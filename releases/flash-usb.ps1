#  SPARTANAI SECURITY CORE - INTERACTIVE USB FLASH & PERSISTENCE CONFIGURATION
# =========================================================================
# This PowerShell script allows safe partition preparation and persistent flashing
# for Live USB boot systems. It enforces strict boundary checks to prevent targeting internal host disks.

$ErrorActionPreference = "Stop"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "     SPARTANAI SECURITY CORE - LIVE USB INTERACTIVE AUTO-FLASH SYSTEM" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Administrator validation
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warning "[!] WARNING: This script modifies partition structures and must be executed as Administrator."
    Write-Host "[*] Relaunching in administrative mode..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    Exit
}

# 2. Probe removable USB storage
Write-Host "[*] Probing system WMI and checking for removable USB storage devices..." -ForegroundColor Yellow

$disks = Get-Disk | Where-Object { $_.BusType -eq "USB" -and $_.OperationalStatus -eq "Online" }

if ($disks.Count -eq 0) {
    Write-Error "No active removable USB storage devices detected! Please plug in a USB flash drive and try again."
}

Write-Host "`n[+] REMOVABLE USB DRIVES DETECTED:" -ForegroundColor Green
Write-Host "---------------------------------------------------------" -ForegroundColor Gray
$disks | Format-Table -Property Number, FriendlyName, Size, PartitionStyle -AutoSize

# 3. Prompt user for drive selection
$selectedDiskNumber = -1
while ($true) {
    [string]$input = Read-Host "`nEnter the Disk Number you wish to flash (e.g. 1)"
    if ([int]::TryParse($input, [ref]$selectedDiskNumber)) {
        $selectedDisk = $disks | Where-Object { $_.Number -eq $selectedDiskNumber }
        if ($selectedDisk) {
            break
        }
    }
    Write-Host "[!] Invalid selection. Please enter a valid USB disk number from the table above." -ForegroundColor Red
}

Write-Host "`n=========================================================" -ForegroundColor Yellow
Write-Host "  WARNING: YOU ARE ABOUT TO CLEAR ALL DATA ON THIS DISK!" -ForegroundColor Red
Write-Host "  Target Disk: [$($selectedDisk.Number)] $($selectedDisk.FriendlyName) ($([Math]::Round($selectedDisk.Size / 1GB, 2)) GB)" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Yellow

# Double check safety affirmation
$confirm = Read-Host "Type 'YES' to proceed with formatting and flashing this device"
if ($confirm -ne "YES") {
    Write-Host "[*] Operation aborted by the user. Exiting." -ForegroundColor Yellow
    Exit
}

# 4. Prepare partition structure
Write-Host "`n[*] Starting disk preparation sequence on Disk $($selectedDisk.Number)..." -ForegroundColor Yellow

try {
    # Clear read-only flags if any
    Set-Disk -Number $selectedDisk.Number -IsReadOnly $false
    
    # Wipe the drive
    Write-Host "[*] Wiping target disk sectors..." -ForegroundColor Gray
    Clear-Disk -Number $selectedDisk.Number -RemoveData -RemoveOEM -Confirm:$false
    
    # Initialize partition table
    Write-Host "[*] Creating GPT partition style..." -ForegroundColor Gray
    Initialize-Disk -Number $selectedDisk.Number -PartitionStyle GPT -Force
    
    # Create boot partition (FAT32, typically 4GB for Live boot system ISO contents)
    Write-Host "[*] Creating primary Boot partition (FAT32)..." -ForegroundColor Gray
    $bootPart = New-Partition -DiskNumber $selectedDisk.Number -Size 4GB -AssignDriveLetter
    $bootPart | Format-Volume -FileSystem FAT32 -NewFileSystemLabel "SPARTANAI_BOOT" -Confirm:$false
    
    # Create persistence partition (remaining storage, NTFS/EXT4 for logs and suite binaries)
    Write-Host "[*] Creating Live Persistence partition (NTFS)..." -ForegroundColor Gray
    $persistPart = New-Partition -DiskNumber $selectedDisk.Number -UseMaximumSize -AssignDriveLetter
    $persistPart | Format-Volume -FileSystem NTFS -NewFileSystemLabel "persistence" -Confirm:$false

    Write-Host "`n[+] PARTITIONS CREATED AND FORMATTED SUCCESSFULY:" -ForegroundColor Green
    Write-Host "  -> Volume [SPARTANAI_BOOT] ready to receive Live OS boot files." -ForegroundColor Gray
    Write-Host "  -> Volume [persistence] prepared for persistent local configurations." -ForegroundColor Gray
}
catch {
    Write-Error "Disk partitioning failed! Error details: $_"
}

# 5. Provision application launcher to persistence
Write-Host "`n[*] Copying application packaging templates to persistence..." -ForegroundColor Yellow

# Check if releases directory contains setup scripts
$ReleasesPath = Join-Path $PSScriptRoot ""
$PersistDriveLetter = $persistPart.DriveLetter + ":"

if (Test-Path $PersistDriveLetter) {
    $DestPath = Join-Path $PersistDriveLetter "spartanai-security-core-setup"
    New-Item -ItemType Directory -Path $DestPath -Force | Out-Null
    
    # Copy build scripts & wrappers
    Copy-Item -Path (Join-Path $ReleasesPath "*") -Destination $DestPath -Recurse -Force
    Write-Host "[+] Automated setup scripts successfully copied to dynamic persistence partition: $DestPath" -ForegroundColor Green
}
else {
    Write-Warning "Could not access persistence partition letter to write setup files."
}

Write-Host "`n=========================================================" -ForegroundColor Cyan
Write-Host "     USB FLASH & PERSISTENCE PREPARATION COMPLETED!" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
