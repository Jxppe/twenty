# Running TLL CRM on the NAS

Moves Twenty off the development PC and onto the NAS, so the instance stays up when the
laptop is closed. Four containers: server, worker, Postgres, Redis.

This replaces `yarn twenty docker start`, which ran the all-in-one `twenty-app-dev` image on
`localhost:2020`. That image bundles Postgres inside the container and is meant for development.
This one keeps the database in its own volume, which is what you want the moment real records
go in.

## Before you start

**Check the CPU.** VERIFIED: `twentycrm/twenty:latest` publishes `linux/amd64` and `linux/arm64`.
An Intel or Celeron NAS is amd64, a modern Synology Plus with an AMD Ryzen is amd64, and most
recent ARM units are arm64. Older Realtek and Marvell ARMv7 boxes are neither, and nothing here
will run on them.

**Check the RAM.** Twenty wants about 2GB for the server plus 1GB for Postgres. A 2GB NAS will
thrash.

**Pick the address now.** `SERVER_URL` has to be the exact URL a browser types, including the
port. Login redirects and asset URLs are built from it, so a wrong value produces an instance
that loads and then fails to sign in. Use the NAS LAN address for now
(`http://192.168.1.50:3000`); switch to a hostname later and restart.

## Steps

1. **Make a folder on the NAS**, for example `/volume1/docker/tll-crm`.

2. **Copy `docker-compose.yml` and `.env.example` into it**, and rename the second to `.env`.

3. **Fill in `.env`.** Generate the key on any machine with

   ```bash
   openssl rand -base64 32
   ```

   Keep `PG_DATABASE_PASSWORD` to letters and digits: special characters break the connection
   URL, which is assembled as a string.

   Back up `ENCRYPTION_KEY` somewhere outside the NAS. Without it, encrypted values are
   unrecoverable even with a full database backup.

4. **Start it.**

   Over SSH:

   ```bash
   cd /volume1/docker/tll-crm
   docker compose up -d
   ```

   In Synology Container Manager: Project, Create, point it at the folder, and it reads both
   files. In QNAP Container Station: Applications, Create, paste the compose file.

5. **Watch the first boot.** It runs migrations and takes a few minutes.

   ```bash
   docker compose logs -f server
   ```

   It is ready when `/healthz` answers:

   ```bash
   curl http://localhost:3000/healthz
   ```

6. **Open it** at the `SERVER_URL` value and create the first workspace.

## Pointing the app at it

From the development PC, in `apps/tll-crm`:

```bash
yarn twenty remote add --url http://192.168.1.50:3000 --as nas
yarn twenty dev --remote nas
```

The app's `universalIdentifier` is unchanged from the local instance, so this creates the app
fresh on the NAS rather than colliding with anything. The local instance can stay as a scratch
environment: two remotes, sync to whichever you mean.

## Ports

3000 collides with a few NAS packages. If it is taken, set both `HOST_PORT` and the port inside
`SERVER_URL` to something free, say 3010. They have to agree.

## Backups

The data lives in the `db-data` Docker volume, not in a share you can see in File Station. Back it
up with a dump rather than by copying files:

```bash
docker compose exec db pg_dump -U postgres default > tll-crm-$(date +%F).sql
```

Put that on a schedule in Task Scheduler once the instance holds anything real. Uploaded files
live in the `server-local-data` volume and need their own copy.

## Upgrades

`TAG=latest` is fine now and wrong later. Pin it to a released version before real data goes in,
then upgrade deliberately:

```bash
docker compose pull && docker compose up -d
```

Take a dump first. Migrations run automatically on server start and are not reversible.

## When it misbehaves

**Signs in and bounces straight back out, or assets 404.** `SERVER_URL` does not match the URL in
the address bar. Fix it and `docker compose up -d`.

**Server restarts in a loop.** Read `docker compose logs server`. Usually Postgres is not up yet
(wait), or `PG_DATABASE_PASSWORD` has a character that broke the URL.

**Works on the NAS, not from another machine.** NAS firewall. Allow the port on the LAN.

**Do not expose this to the internet** by forwarding a port. It would be plain HTTP with client
data behind it. When it needs to be reachable from outside, put it behind the reverse proxy with
a certificate, or a Cloudflare Tunnel, and set `SERVER_URL` to that hostname.
