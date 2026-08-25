# Prepares a Windows VM to run TLL CRM as a server, and starts the container.
#
# Run in an ELEVATED PowerShell (right-click, Run as administrator):
#
#   .\setup-windows-vm.ps1 -ServerIp 192.168.1.60
#
# Three things it cannot do for you are printed at the end. Reboot survival
# depends on those, so do not skip them.

param(
  [Parameter(Mandatory = $true)][string]$ServerIp,
  [int]$Port = 2020,
  [int]$WslMemoryGb = 4
)

$ErrorActionPreference = 'Stop'
$containerName = 'twenty-app-dev'

function Write-Step($message) {
  Write-Host ""
  Write-Host "==> $message" -ForegroundColor Cyan
}

# --- Firewall ---------------------------------------------------------------
Write-Step "Allowing inbound TCP $Port"

$ruleName = "TLL CRM $Port"
if (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue) {
  Write-Host "Rule already present."
} else {
  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP `
    -LocalPort $Port -Action Allow -Profile Any | Out-Null
  Write-Host "Rule created."
}

# --- Power ------------------------------------------------------------------
# A sleeping VM is a server that is down.
Write-Step "Disabling sleep and hibernation"

powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
powercfg /change monitor-timeout-ac 0
Write-Host "Done."

# --- WSL memory -------------------------------------------------------------
# Docker Desktop runs containers inside WSL2, which takes up to half the VM's
# RAM by default and does not give it back. Capping it keeps Windows usable.
Write-Step "Checking WSL memory cap"

$wslConfig = Join-Path $env:USERPROFILE '.wslconfig'
if (Test-Path $wslConfig) {
  Write-Host "$wslConfig already exists, leaving it alone. Current contents:"
  Get-Content $wslConfig | ForEach-Object { Write-Host "    $_" }
} else {
  Set-Content -Path $wslConfig -Value @(
    '[wsl2]'
    "memory=${WslMemoryGb}GB"
    'swap=0'
  )
  Write-Host "Wrote $wslConfig with a ${WslMemoryGb}GB cap."
}

# --- Container --------------------------------------------------------------
Write-Step "Starting Twenty"

docker version --format '{{.Server.Version}}' | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Docker is not responding. Start Docker Desktop and run this again."
}

$serverUrl = "http://${ServerIp}:${Port}"
$existing = docker ps -a --filter "name=^/$containerName$" --format '{{.Names}}'

if ($existing -eq $containerName) {
  $currentUrl = docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' $containerName |
    Select-String -Pattern '^SERVER_URL=(.*)$' |
    ForEach-Object { $_.Matches[0].Groups[1].Value }

  Write-Host "Container already exists with SERVER_URL=$currentUrl"

  if ($currentUrl -ne $serverUrl) {
    Write-Host ""
    Write-Host "That does not match $serverUrl." -ForegroundColor Yellow
    Write-Host "SERVER_URL is fixed when the container is created, but the data lives"
    Write-Host "in volumes, so recreating it loses nothing:"
    Write-Host ""
    Write-Host "    docker rm -f $containerName"
    Write-Host "    .\setup-windows-vm.ps1 -ServerIp $ServerIp"
    exit 1
  }

  docker start $containerName | Out-Null
  Write-Host "Started."
} else {
  docker run -d --name $containerName --restart unless-stopped `
    -p "${Port}:${Port}" `
    -e "NODE_PORT=$Port" `
    -e "SERVER_URL=$serverUrl" `
    -v twenty-app-dev-data:/data/postgres `
    -v twenty-app-dev-storage:/app/packages/twenty-server/.local-storage `
    twentycrm/twenty-app-dev:latest | Out-Null
  Write-Host "Created and started. First boot runs migrations and takes a few minutes."
}

# --- What is left -----------------------------------------------------------
Write-Host ""
Write-Host "Twenty will answer at $serverUrl" -ForegroundColor Green
Write-Host "Watch it come up with:  docker logs -f $containerName"
Write-Host ""
Write-Host "STILL TO DO BY HAND, or it will not survive a reboot:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Give this VM a fixed address. A DHCP reservation on the router is"
Write-Host "     easiest. If $ServerIp changes, the CRM stops answering."
Write-Host ""
Write-Host "  2. Docker Desktop, Settings, General:"
Write-Host "     tick 'Start Docker Desktop when you sign in'."
Write-Host ""
Write-Host "  3. Make Windows sign in on its own: run netplwiz and untick"
Write-Host "     'Users must enter a user name and password'. Docker Desktop only"
Write-Host "     runs while a user is signed in, so without this a reboot leaves"
Write-Host "     the CRM down until someone logs in."
