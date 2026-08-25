# Running TLL CRM on the NAS

Moves Twenty off the development PC and onto the NAS, so the instance stays up when the laptop
is closed.

Two ways to do it, and the quick one is genuinely quick.

## Start here: the one-container way

The same image the CLI runs on a development PC, pointed at the NAS instead. Postgres, Redis,
server and worker all inside one container. One value to change.

Over SSH:

```bash
sudo docker run -d --name twenty-app-dev --restart unless-stopped \
  -p 2020:2020 \
  -e NODE_PORT=2020 \
  -e SERVER_URL=http://192.168.1.50:2020 \
  -v twenty-app-dev-data:/data/postgres \
  -v twenty-app-dev-storage:/app/packages/twenty-server/.local-storage \
  twentycrm/twenty-app-dev:latest
```

Through the UGOS Docker app: deploy `docker-compose.simple.yml` as a Project, after changing
`SERVER_URL` to the NAS address.

Either way, give it a few minutes and open `http://<nas-ip>:2020`.

**The only thing that must be right is `SERVER_URL`.** Not `localhost`: the NAS address, port
included. Login redirects are built from it.

Data lives in the two named volumes, so it survives restarts, reboots and image upgrades.

### When to move off it

This is the development image. It is fine for evaluating, for demo data, and for the first few
weeks of real use. It becomes the wrong thing when the instance holds records the firm depends
on, because Postgres runs inside the app container: no separate database to back up cleanly, no
independent upgrade, and one container failure takes everything.

Migrating later is a `pg_dump` from this and a restore into the full stack below. Not free, not
painful. Do it when the CRM stops being an experiment.

---

## The full stack

Four containers, database in its own service. Everything below is about this.

## Which file to use

| Your route | File |
| --- | --- |
| Just get it running | `docker-compose.simple.yml`, or the `docker run` above |
| UGOS Pro Docker app, the Project editor | `docker-compose.ugos.yml` |
| SSH, or any other NAS with a shell | `docker-compose.yml` plus `.env` |

They deploy the same four containers. The UGOS one carries its values inline because the
Project editor does not reliably pass an env file, and a compose file whose `${VARS}` resolve
to blanks starts and then fails in ways that look like a Twenty problem.

## Before you start

**Architecture is fine.** UGREEN's NASync line is Intel x86 throughout, and
`twentycrm/twenty:latest` publishes `linux/amd64`. Confirm with `uname -m` over SSH if you want
to be sure: `x86_64` is what you are looking for.

**RAM matters more.** Budget about 3GB across the four containers. A DXP2800 with the stock 8GB
is comfortable; anything already running Plex transcodes and a few VMs will not be.

**Decide the address now.** `SERVER_URL` must be exactly what you type in the browser, port
included. Login redirects and asset URLs are built from it, so a wrong value gives you a page
that loads and then refuses to sign in. Use the NAS LAN address for now, for example
`http://192.168.1.50:3000`.

## UGOS Pro, through the Docker app

1. **Make a folder.** In File Manager, create `tll-crm` inside the `docker` shared folder.

2. **Generate the encryption key.** On the PC, in any terminal:

   ```
   openssl rand -base64 32
   ```

   No openssl on Windows? `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   does the same thing.

3. **Edit `docker-compose.ugos.yml`** before uploading. Four lines are marked `CHANGE ME`:
   `SERVER_URL`, `ENCRYPTION_KEY`, and the database password, which appears twice and has to
   match in both places. Keep the password to letters and digits: a `@` or `:` in it breaks the
   connection URL, which is assembled as a string.

4. **Docker app, Project, Create.** Name it `tll-crm`, point the path at the folder from step 1,
   and paste the file in, or upload it there first and let the editor read it. Deploy.

5. **Watch it come up.** The Project's log view, or Containers, `tll-crm-server-1`, Logs. First
   boot runs database migrations and takes several minutes. Nothing is wrong until it stops
   restarting and still fails.

6. **Open it** at your `SERVER_URL` and create the first workspace.

## UGOS Pro, over SSH

Faster if you are comfortable with it. Enable SSH first in Control Panel, Terminal, then:

```bash
ssh yourname@192.168.1.50
cd /volume1/docker/tll-crm
sudo docker compose up -d
sudo docker compose logs -f server
```

`sudo` is needed: the Docker socket on UGOS is root-owned. Check the volume name with
`ls /volume1` if that path does not exist. This route can use `docker-compose.yml` with a `.env`
file beside it, which keeps the secrets out of the compose file.

## Pointing the app at it

From the development PC, in `apps/tll-crm`:

```
node node_modules\twenty-sdk\dist\cli.cjs remote add --url http://192.168.1.50:3000 --as nas
node node_modules\twenty-sdk\dist\cli.cjs dev --remote nas
```

(`yarn twenty remote add ...` if yarn is working on that machine; the node form is the fallback.)

The app's `universalIdentifier` is unchanged from the local instance, so this creates the app
fresh on the NAS rather than colliding with anything. The local instance can stay as a scratch
environment: two remotes, sync to whichever you mean.

## Backups

The data lives in the `db-data` Docker volume, not in a share you can see in File Station. Back it
up with a dump rather than by copying files:

```bash
sudo docker compose exec db pg_dump -U postgres default > tll-crm-$(date +%F).sql
```

UGOS Pro has a Task Scheduler under Control Panel. Point a scheduled script at that once the
instance holds anything real. Uploaded files live in the `server-local-data` volume and need their
own copy.

## Upgrades

`latest` is fine now and wrong later. Pin the image to a released version before real data goes in,
then upgrade deliberately:

```bash
sudo docker compose pull && sudo docker compose up -d
```

In the GUI: the Project's Update button, or pull the new image and recreate.

Take a dump first. Migrations run automatically on server start and are not reversible.

## When it misbehaves

**Signs in and bounces straight back out, or assets 404.** `SERVER_URL` does not match the URL in
the address bar. Fix it and redeploy.

**Server restarts in a loop.** Read the server logs. Usually Postgres is not up yet (wait), or the
database password has a character that broke the URL, or the two copies of it do not match.

**Works on the NAS, not from another machine.** UGOS firewall, under Control Panel, Security. Allow
the port on the LAN.

**Port 3000 refused.** Something else on the NAS has it. Change the published port on the left of
`3000:3000` and the port in `SERVER_URL` together, then redeploy.

**Do not expose this to the internet** by forwarding a port. It would be plain HTTP with client
data behind it. When it needs to be reachable from outside, put it behind the reverse proxy with
a certificate, or a Cloudflare Tunnel, and set `SERVER_URL` to that hostname.
