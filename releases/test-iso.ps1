#  SPARTANAI SECURITY CORE - WINDOWS QEMU ISO TESTER
# =========================================================================
# This script automates launching the compiled Live ISO using QEMU for Windows.
# It forwards port 3000 to the host for dashboard access.

$IsoName = "spartanai-live-security.iso"
$IsoPath = Join-Path $PSScriptRoot $IsoName
$QemuExecutable = "qemu-system-x86_64.exe"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "     SPARTANAI SECURITY CORE - WINDOWS LIVE ISO TESTING RIG" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Check for ISO file
if (-not (Test-Path $IsoPath)) {
    Write-Error "ISO file not found at: $IsoPath`nBuild the ISO first using the WSL build-iso.sh script."
    exit
}

# 2. Check for QEMU installation
$QemuPath = Get-Command $QemuExecutable -ErrorAction SilentlyContinue
if (-not $QemuPath) {
    Write-Host "[!] QEMU not found in system PATH." -ForegroundColor Yellow
    Write-Host "[*] Please install QEMU for Windows: https://www.qemu.org/download/#windows" -ForegroundColor White
    exit
}

Write-Host "[+] Found ISO: $IsoPath" -ForegroundColor Green
Write-Host "[+] Launching Virtual Machine..." -ForegroundColor Yellow
Write-Host "[*] Note: Port 3000 is being forwarded to localhost:3000" -ForegroundColor Gray

# 3. Launch QEMU
# Parameters:
# -m 2048: Allocate 2GB RAM
# -cdrom: Path to the ISO
# -net nic: Virtual network card
# -net user,hostfwd: Forward TCP traffic from host port 3000 to guest port 3000

$Arguments = @(
    "-m", "2048",
    "-cdrom", "`"$IsoPath`"",
    "-net", "nic",
    "-net", "user,hostfwd=tcp::3000-:3000",
    "-serial", "stdio"
)

Write-Host "`n[!] Starting QEMU. Keep this window open while testing.`n" -ForegroundColor Cyan

Start-Process -FilePath $QemuExecutable -ArgumentList $Arguments -Wait