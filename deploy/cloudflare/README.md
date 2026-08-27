# Public HTTPS for the CRM, via Cloudflare Tunnel

Gives the instance a real hostname and certificate without forwarding a port, and without
touching any tunnel already running on the NAS.

**Why bother, beyond the certificate:** `SERVER_URL` has to be reachable from *inside* the
container as well as from a browser, because logic functions call back into the API at that
address. A `.ts.net` name fails that test (see `../nas/README.md`). A public hostname passes it,
because the container resolves it over the internet and comes back in through the tunnel.

## One tunnel per thing

Use a **token-based tunnel in its own container**. It carries its whole configuration in the token,
so it shares no file, no `cert.pem` and no lifecycle with an existing cloudflared. Nothing about
the tunnel you already run changes.

## Steps

1. **Add the domain to Cloudflare.** Add a domain, Free plan. It returns two nameservers.

2. **Point the registrar at them.** On Porkbun: the domain, Authoritative Nameservers, replace both.
   Minutes to a couple of hours. On a domain with nothing on it there is no risk; on the firm's live
   domain there very much is, which is the argument for a separate cheap one.

3. **Create the tunnel.** Zero Trust, Networks, Tunnels, Create a tunnel, Cloudflared, name it,
   choose Docker, copy the token.

4. **Add the public hostname** on the tunnel: subdomain `crm`, your domain, type `HTTP`, URL
   `localhost:2020`.

5. **Deploy `docker-compose.yml` from this folder** as its own project, with the token pasted in.

6. **Set `SERVER_URL` to `https://crm.<domain>`** in the CRM's project and redeploy.

`network_mode: host` on the connector is not optional on UGOS: the Docker bridge there cannot reach
the host, so a bridge-networked connector cannot see the port Twenty publishes.

## Then close the door

The instance is now on the public internet with whatever auth Twenty has. Add Cloudflare Access:
Zero Trust, Access, Applications, Self-hosted, the hostname, and a policy listing the staff emails
with One-time PIN. That is email-code sign-in, in front of the app, which is the passwordless login
Twenty itself does not offer.

**Access blocks machines as well as people.** The CLI, the REST API and the MCP endpoint will hit a
login page and fail in confusing ways. Either exempt `/rest` and `/mcp` with a bypass policy, or
issue a service token and send it as headers. Decide this when you turn Access on, not after the
first mysterious 403.

## Do not commit the API key

The MCP client configuration Twenty shows you contains a bearer token. `.mcp.json` is tracked in
this repository. Put the key in an untracked local file or an environment variable; a key in git
history is a key to rotate.
