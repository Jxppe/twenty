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

### Changing the address later is cheap

`SERVER_URL` is set when the container is created, but the data is in the two named volumes, not in
the container. So changing it costs:

```bash
docker rm -f twenty-app-dev
# same docker run, new SERVER_URL
```

Nothing is lost. Start with the LAN address and get it running; decide about Tailscale afterwards.

### With Tailscale

Two ways in, and which one applies depends on where Tailscale runs.

**Quick version.** Point `SERVER_URL` at the MagicDNS name instead of the LAN address:

```
SERVER_URL=http://nas.your-tailnet.ts.net:2020
```

Works from the office, from home and from a phone, with no port forwarding and nothing exposed to
the internet.

**If Tailscale is a container rather than a host service**, `serve` proxies to that container's own
localhost, so Twenty has to share its network namespace:

```yaml
services:
  twenty:
    image: twentycrm/twenty-app-dev:latest
    network_mode: service:tailscale
```

Twenty then gets its own tailnet identity, separate from the NAS. More moving parts; worth it only
once you want that.

**With Tailscale on the host: real HTTPS, no port in the URL.**

```bash
sudo tailscale serve --bg 2020
sudo tailscale serve status
```

That puts a Let's Encrypt certificate in front of the container, so the CRM answers at
`https://nas.your-tailnet.ts.net`. Set `SERVER_URL` to exactly that, with no port. Needs MagicDNS
and HTTPS certificates enabled in the tailnet admin console under DNS. `sudo tailscale serve --bg
off` undoes it.

**Simplest of all: subnet routes.** If the Tailscale node already advertises your LAN, every tailnet
device can reach the NAS at its LAN address, and the URL you started with keeps working from
anywhere with nothing to change. Check with `tailscale status` before doing anything more elaborate.

**Three things to know:**

- **`SERVER_URL` holds one address**, so pick which one the CRM answers on. The LAN IP works
  remotely only if a subnet route covers it; otherwise use the tailnet name everywhere, including
  on the LAN.
- **Every device that uses the CRM needs Tailscale.** No Tailscale, no name resolution, no access.
  Fine for staff laptops and phones; it means clients can never reach it, which for the CRM itself
  is correct.
- **Do not use Funnel.** Funnel publishes to the open internet. Serve stays inside the tailnet.
  Client-facing pages, when they exist, are a separate decision and want their own hostname.

**A Windows VM is not a shortcut.** Docker there means Docker Desktop and WSL2 nested inside the
NAS hypervisor, which needs virtualization extensions passed through to the guest. Most NAS virtual
machine managers do not expose them, and Docker Desktop then refuses to start outright. Run it on
the NAS host.

### Upgrading it

The image upgrades itself. Its startup script runs `yarn command:prod upgrade` on every boot:

`packages/twenty-docker/twenty-app-dev/rootfs/etc/s6-overlay/scripts/init-db.sh`

So an upgrade is: pull the new image, recreate the container on the same two volumes, watch the
log. The data is in the volumes, not the container, and nothing is re-seeded because the script
checks for the dev workspace before seeding.

**Take a dump first.** Migrations run on start and do not reverse.

```bash
sudo docker exec twenty-app-dev sh -c \
  "PGPASSWORD=twenty pg_dump -h localhost -U twenty -d default" \
  > ~/tll-crm-$(date +%F).sql
```

Inside the container Postgres is `twenty` / `twenty` on database `default`, listening on localhost
only. That is fixed by the image, not configurable.

Then, if the container was created with `docker run`:

```bash
sudo docker pull twentycrm/twenty-app-dev:latest
sudo docker rm -f twenty-app-dev
# re-issue the same docker run, same SERVER_URL, same volume names
sudo docker logs -f twenty-app-dev
```

`SERVER_URL` is baked in at creation time, so it has to be supplied again. Getting it wrong here
signs you out and breaks logic functions, so read it off the old container before removing it:

```bash
sudo docker inspect twenty-app-dev --format '{{range .Config.Env}}{{println .}}{{end}}'
```

If it was deployed as a UGOS Project instead, the Project's Update button does the pull and
recreate, and the compose file keeps `SERVER_URL`. Confirm which you have with:

```bash
sudo docker inspect twenty-app-dev --format '{{index .Config.Labels "com.docker.compose.project"}}'
```

A project name means compose; empty means `docker run`.

**Watch for `==> START Running upgrade`** in the log. On a version that changes workspace metadata
it takes a few minutes and the UI is unusable until it finishes. `Warning: Upgrade completed with
errors` is not fatal by itself, but it means a workspace did not fully migrate, and the lines above
it say which.

The version the server reports afterwards. `/healthz` only says `{"status":"ok"}`, so ask the
public discovery endpoint instead, which carries `APP_VERSION` verbatim
(`well-known.controller.ts`):

```bash
curl -s https://crm.tllcrm.fyi/.well-known/mcp/server-card.json
```

The `version` field in the reply is the server's version. No authentication needed, so this works
from any machine that can reach the CRM.

**Keep the server and the CLI on the same minor version.** The SDK writes metadata against the
schema it was built for, and the failures when they diverge are unhelpful: `Cannot query field
"isCustom"` was one of ours. `apps/tll-crm/package.json` pins `twenty-sdk`, so the server is the
side that moves.

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

**RAM jobs more.** Budget about 3GB across the four containers. A DXP2800 with the stock 8GB
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

## Logic functions and SERVER_URL

**If the CRM works but a logic function returns 500 with `ROUTE_TRIGGER_USER_UNCAUGHT_ERROR` and
"fetch failed", this is why.**

Logic functions run server-side and call back into Twenty's own API. The base URL they get is
`SERVER_URL`, verbatim:

`packages/twenty-server/src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service.ts:418`

So `SERVER_URL` has to be resolvable and reachable **from inside the container**, not only from a
browser. A Tailscale `.ts.net` name is the case where these come apart: the browser resolves it
through MagicDNS, and the Twenty container, which is not on the Tailscale network, cannot.

Everything else keeps working, which makes it confusing: the UI loads, REST reads succeed, and only
the code that runs server-side fails.

Two fixes. Map the name to the node's Tailscale IP:

```yaml
    extra_hosts:
      - "your-host.your-tailnet.ts.net:100.64.49.93"
```

Traffic then goes to that address on 443, where `tailscale serve` proxies it back to the local port.
The certificate is valid for the name, so TLS verification passes.

Or put Twenty inside the Tailscale container's network namespace, which gives it MagicDNS directly:

```yaml
    network_mode: container:tailscale
```

and drop the `ports:` block, since it no longer has a network of its own. Cleaner, at the cost of a
start-order dependency between the two containers.

## What SERVER_URL has to satisfy

VERIFIED on a UGREEN NAS running UGOS Pro.

`SERVER_URL: http://<nas-ip>:2020` on a normal bridge network with a published port works for
everything, logic functions included. That is the configuration to use.

`tailscale serve` does not work with it. Serve gives the instance a `.ts.net` name, which the
browser resolves through MagicDNS and the container cannot: it has no route to the Tailscale
interface. Logic functions then fail with `ROUTE_TRIGGER_USER_UNCAUGHT_ERROR` and "fetch failed"
while the rest of the CRM looks perfectly healthy, because they are the only code that runs
server-side and calls back in.

Two attempts that did not fix it:

- **`extra_hosts` mapping the name to the Tailscale IP.** Resolution starts working, the connection
  still times out.
- **`network_mode: host`**, which would have made both addresses local. Unusable here: the
  all-in-one image runs its own Redis, and on host networking it cannot bind 6379 because something
  on the NAS already owns it. The container dies at startup.

**So use subnet routes rather than serve.** Advertise the LAN from a Tailscale node, approve the
route in the admin console, and `http://<nas-ip>:2020` reaches the CRM from every tailnet device
with the same URL as on the LAN. One address that both the browser and the container can use, which
is the actual requirement.

Freeing port 6379 on the NAS would reopen the host-networking option and with it `serve`, if the
certificate and hostname become worth it later.

## When it misbehaves

**Signs in and bounces straight back out, or assets 404.** `SERVER_URL` does not match the URL in
the address bar. Fix it and redeploy.

**Server restarts in a loop.** Read the server logs. Usually Postgres is not up yet (wait), or the
database password has a character that broke the URL, or the two copies of it do not match.

**Works on the NAS, not from another machine.** UGOS firewall, under Control Panel, Security. Allow
the port on the LAN.

**Port 3000 refused.** Something else on the NAS has it. Change the published port on the left of
`3000:3000` and the port in `SERVER_URL` together, then redeploy.

**Do not expose this to the internet** by forwarding a port. Remote access is what Tailscale is
for: `tailscale serve` gives it a certificate and keeps it inside the tailnet. Port forwarding
would put plain HTTP with client data behind it on the open internet.
