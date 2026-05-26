#  SPARTANAI SECURITY CORE - HYPER-V BUILD & DEPLOYMENT ORCHESTRATOR
# =========================================================================
# This script:
# 1. Triggers the ISO compilation via WSL.
# 2. Provisions a Hyper-V VM (Generation 1).
# 3. Configures networking and boots the Live ISO.
#
# NOTE: Must be run in an elevated (Administrator) PowerShell window.

$ProjectRoot = "c:\GitHub\SpartanAI_Security_Core"
$IsoPath = Join-Path $ProjectRoot "releases\spartanai-live-security.iso"
$VMName = "SpartanAI_Sovereign_Node_01"
$VHDPath = Join-Path $ProjectRoot "releases\spartanai_persistence.vhdx"
$SwitchName = "Default Switch" # Standard Win10/11 Virtual Switch

Write-Host "--- SPARTANAI SECURITY CORE SOVEREIGN BUILD ENGINE ---" -ForegroundColor Cyan

# 1. Check for Administrative Privileges
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script requires Administrator privileges to manage Hyper-V. Please restart PowerShell as Administrator."
    exit
}

# 2. Trigger ISO Compilation Lifecycle
Write-Host "[*] Building Node.js Application & Initiating ISO Compilation via WSL..." -ForegroundColor Yellow
$ProjectRootWsl = "/mnt/c" + $ProjectRoot.Substring(2).Replace("\", "/")
wsl -u root -- bash -c "cd $ProjectRootWsl && npm install && npm run build && cd releases && bash build-iso.sh"

if (-not (Test-Path $IsoPath)) {
    Write-Error "ISO Compilation failed. Could not find: $IsoPath"
    exit
}

Write-Host "[+] ISO Compiled Successfully: $IsoPath" -ForegroundColor Green

# 3. Hyper-V VM Management
Write-Host "[*] Checking for existing VM [$VMName]..." -ForegroundColor Gray
if (Get-VM -Name $VMName -ErrorAction SilentlyContinue) {
    Write-Host "[!] Existing VM found. Purging for fresh deployment..." -ForegroundColor Yellow
    Stop-VM -Name $VMName -Force -ErrorAction SilentlyContinue
    Remove-VM -Name $VMName -Force
}

# 4. Provision Fresh Virtual Machine
Write-Host "[*] Provisioning Sovereign Virtual Node..." -ForegroundColor Cyan
New-VM -Name $VMName -MemoryStartupBytes 2GB -Generation 1 -SwitchName $SwitchName

# Create a small VHDX for persistence (optional)
if (-not (Test-Path $VHDPath)) {
    New-VHD -Path $VHDPath -SizeBytes 4GB -Dynamic
}
Add-VMHardDiskDrive -VMName $VMName -Path $VHDPath

# Attach the SpartanAI Live ISO to the DVD Drive
Set-VMDvdDrive -VMName $VMName -Path $IsoPath

# Force Guest Services to be enabled
Enable-VMIntegrationService -VMName $VMName -Name "Data Exchange"
Enable-VMIntegrationService -VMName $VMName -Name "Guest Service Interface"

$DVD = Get-VMDvdDrive -VMName $VMName
Set-VMBios -VMName $VMName -StartupOrder @($DVD, "LegacyNetworkAdapter", "IDE")

# 5. Launch Node
Write-Host "[+] Starting Sovereign Node..." -ForegroundColor Green
Start-VM -Name $VMName

# Verify VM Heartbeat
Write-Host "[*] Verifying VM Heartbeat..." -ForegroundColor Gray
while ((Get-VM -Name $VMName).Heartbeat -ne "Ok") {
    Write-Host "[.] Waiting for kernel initialization..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

# 6. Wait for Initialization
Write-Host "[*] Waiting for node to report network status..." -ForegroundColor Yellow

$MaxRetries = 40
$RetryCount = 0
$VMIp = $null

while ($RetryCount -lt $MaxRetries) {
    $RetryCount++
    # Attempt to grab the IPv4 address from the VM Guest exchange
    $VMIp = (Get-VMNetworkAdapter -VMName $VMName).IPAddresses | Where-Object { $_ -match '^\d+\.\d+\.\d+\.\d+$' } | Select-Object -First 1
    
    if ($VMIp) {
        Write-Host "[+] Network established. Internal Node IP: $VMIp" -ForegroundColor Green
        break
    }
    
    Write-Host "[.] Polling for IP allocation (Attempt $RetryCount/$MaxRetries)..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

if ($VMIp) {
    Write-Host "[*] Probing SpartanAI Security Core Dashboard status on $VMIp:3000..." -ForegroundColor Yellow
    $DashboardReady = $false
    $PortRetries = 25
    
    for ($i = 1; $i -le $PortRetries; $i++) {
        $Connection = Test-NetConnection -ComputerName $VMIp -Port 3000 -WarningAction SilentlyContinue
        if ($Connection.TcpTestSucceeded) {
            $DashboardReady = $true
            break
        }
        Write-Host "[.] Interface not yet responsive (Attempt $i/$PortRetries)..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }

    if ($DashboardReady) {
        $Url = "http://$($VMIp):3000"
        Write-Host "`n=========================================================" -ForegroundColor Cyan
        Write-Host " SOVEREIGN NODE ONLINE" -ForegroundColor Green
        Write-Host "=========================================================" -ForegroundColor Cyan
        Write-Host "Access URL: $Url"
        Write-Host "VM Console: vmconnect.exe localhost $VMName"
        Write-Host "=========================================================" -ForegroundColor Cyan
        
        Write-Host "[*] Launching Command Center..." -ForegroundColor White
        Start-Process $Url
    }
    else {
        Write-Host "[!] Dashboard probe timeout. Please check the VM console for boot errors." -ForegroundColor Red
    }
}
else {
    Write-Host "[!] Failed to retrieve VM IP address. Ensure Hyper-V Integration Services are active in the guest." -ForegroundColor Red
}