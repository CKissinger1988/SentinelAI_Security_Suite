# Deploy-Jarvis-HyperV.ps1
# Initiating Phase 3: Autonomous Hyper-V Deployment for Jarvis OS

$VMName = "Jarvis_Sovereign_Node_Test"
$ISOPATH = "C:\GitHub\JarvisAI_OS_Server.iso"
$SwitchName = "Default Switch"

Write-Host "Initiating STEPP x3 Hyper-V Deployment..." -ForegroundColor Cyan

# Check if Hyper-V is available
if (-not (Get-Command New-VM -ErrorAction SilentlyContinue)) {
    Write-Host "[CRITICAL ERROR] Hyper-V module is not loaded or available. Ensure you are running as Administrator and Hyper-V feature is enabled." -ForegroundColor Red
    exit 1
}

# Check if VM already exists and remove it if so (Clean slate for STEPP)
$existingVM = Get-VM -Name $VMName -ErrorAction SilentlyContinue
if ($existingVM) {
    Write-Host "Purging existing test instance..." -ForegroundColor Yellow
    Stop-VM -Name $VMName -Force -ErrorAction SilentlyContinue
    Remove-VM -Name $VMName -Force
}

Write-Host "Building Sovereign Virtual Hardware..." -ForegroundColor Cyan
try {
    # Create the VM
    New-VM -Name $VMName -MemoryStartupBytes 2GB -Generation 2 -NoVHD -SwitchName $SwitchName | Out-Null
    Set-VMProcessor -VMName $VMName -Count 2 | Out-Null
    
    # Configure for Linux/Custom OS (Disable Secure Boot for custom ISOs if needed)
    Set-VMFirmware -VMName $VMName -EnableSecureBoot Off | Out-Null

    # Attach the ISO as a DVD drive
    Add-VMDvdDrive -VMName $VMName -Path $ISOPATH | Out-Null

    # Set boot order to boot from DVD first
    $dvd = Get-VMDvdDrive -VMName $VMName
    Set-VMFirmware -VMName $VMName -FirstBootDevice $dvd | Out-Null

    Write-Host "Virtual Hardware provisioned. ISO Attached: $ISOPATH" -ForegroundColor Green
    
    # Start the VM autonomously
    Write-Host "Powering up Sovereign Node..." -ForegroundColor Cyan
    Start-VM -Name $VMName

    Write-Host "Hyper-V Autonomous Test successfully launched! VM '$VMName' is now running." -ForegroundColor Green
    Write-Host "Please open Hyper-V Manager to view the boot sequence visually." -ForegroundColor Yellow
} catch {
    Write-Host "[CRITICAL ERROR] Failed to deploy Hyper-V Instance. Error details:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}
