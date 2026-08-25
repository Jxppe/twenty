# Running TLL CRM in a Windows VM

**Check this before anything else.** Docker Desktop runs Linux containers inside WSL2, which is a
virtual machine, so a Windows VM needs CPU virtualization extensions passed through from the
hypervisor underneath. Without them Docker Desktop refuses to start with "virtualisation support
wasn't detected", and there is no way around it: Linux containers cannot run.

Task Manager, Performance, CPU, bottom right: **Virtualization: Enabled**, or you are done here.

If it says Disabled, look for a nested virtualization option on the VM in the hypervisor, enable it,
and cold boot the VM. Most NAS virtual machine managers do not offer one. **If yours does not, run
the container on the NAS host instead** (`deploy/nas/README.md`): one command, no Docker Desktop,
no auto-login, no WSL, and the daemon is a system service that starts with the NAS.

This whole document only applies if virtualization is exposed and you want the VM anyway.

---

The VM is a server, so the work is not installing Docker, it is making the thing come back on its
own after a reboot. Windows fights you on that in three specific places.

## Setup

1. **Fix the VM's address first.** `ipconfig` gives you its current IPv4. Then either reserve it on
   the router against the VM's MAC, which is the easy way, or set it statically in Windows under
   Network, Change adapter options, IPv4 properties.

   This matters more than it looks. The address is written into the container when it is created,
   so a VM that comes back on a different IP is a CRM that no longer answers.

2. **Run the setup script** in an elevated PowerShell, in this folder:

   ```powershell
   .\setup-windows-vm.ps1 -ServerIp 192.168.1.60
   ```

   It opens the firewall port, disables sleep, caps WSL's memory, and starts the container. It
   prints what is left to do by hand.

3. **Docker Desktop, Settings, General: tick "Start Docker Desktop when you sign in."**

4. **Make Windows sign in by itself.** Run `netplwiz`, untick "Users must enter a user name and
   password", enter the password once.

   **The tickbox is usually missing.** Windows 10 hides it behind a registry flag. In an elevated
   prompt:

   ```
   reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device" /v DevicePasswordLessBuildVersion /t REG_DWORD /d 0 /f
   ```

   Reopen `netplwiz` and it is there. On a Microsoft account rather than a local one, the same
   thing is also reachable through Settings, Accounts, Sign-in options, by turning off "Require
   Windows Hello sign-in for Microsoft accounts".

   Failing both, use [Sysinternals Autologon](https://learn.microsoft.com/sysinternals/downloads/autologon):
   username, computer name as the domain, password, Enable. It keeps the password in LSA secrets
   rather than plaintext in the registry, which the `AutoAdminLogon` registry recipe found in most
   search results does not.

   **Reboot once and watch it reach the desktop unattended before trusting it.**

   **This is the one people skip**, and it is why the CRM is down on Monday morning. Docker Desktop
   is a desktop application: it runs only while a user is signed in. `--restart unless-stopped`
   restarts the container when Docker is running, and does nothing at all when Docker never
   started.

   The trade: anyone with console access to the VM lands on a signed-in desktop. On a NAS-hosted VM
   on the office LAN that is usually fine. On a laptop that leaves the building it is not.

## After a reboot

With all four done, the chain is: Windows signs in, Docker Desktop starts, the container restarts,
Twenty answers on the same address. Nothing to do.

Check it with `docker ps` on the VM, or just open the URL. If it is down, walk the chain in order:

| Symptom | Cause |
| --- | --- |
| Docker commands say the daemon is not running | Docker Desktop did not start: step 3, or nobody is signed in: step 4 |
| Docker is up, container is not listed in `docker ps` | It is in `docker ps -a`. Read `docker logs twenty-app-dev` |
| Container runs, browser cannot reach it | Firewall rule, or the VM's IP changed: step 1 |
| Loads but signing in bounces you back | The IP changed, so `SERVER_URL` is now wrong. See below |

## Changing the address

`SERVER_URL` is fixed when the container is created. The data is in the `twenty-app-dev-data` and
`twenty-app-dev-storage` volumes, not in the container, so recreating loses nothing:

```powershell
docker rm -f twenty-app-dev
.\setup-windows-vm.ps1 -ServerIp 192.168.1.61
```

## Windows Update

It will reboot the VM without asking, eventually. That is survivable once steps 3 and 4 are done.
Set active hours under Settings, Update, so it does not do it at 10am on a Tuesday.

## Syncing the app to it

From the development PC, not from the VM. The CLI talks to the server over the network, so there is
no reason to clone the repository twice:

```
node node_modules\twenty-sdk\dist\cli.cjs remote add --url http://192.168.1.60:2020 --as vm
node node_modules\twenty-sdk\dist\cli.cjs dev --remote vm
```

## Two things worth knowing

**This is the development image.** Postgres runs inside the app container. Fine for now, wrong once
the firm depends on the records in it, because there is no separate database to back up or upgrade.
`deploy/nas/README.md` covers the full stack and when moving is worth it.

**Docker Desktop on Windows runs containers inside WSL2**, which is a virtual machine inside your
virtual machine. It works, and it costs memory: give the VM at least 6GB so WSL can have 4.
