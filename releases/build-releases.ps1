# SpartanAI_Security_Core - Release Compiler
# Compiles clean standalone production executables for Windows, Linux, and WSL environments.

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " SPARTANAI SECURITY CORE - RELEASE BUILDER" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Ensure releases folder exists
$ReleasesDir = Join-Path $PSScriptRoot ""
if (-not (Test-Path $ReleasesDir)) {
    New-Item -ItemType Directory -Path $ReleasesDir -Force | Out-Null
}

# 1. Clean previous build artifacts
Write-Host "[*] Cleaning old build artifacts..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\..\dist") {
    Remove-Item -Recurse -Force "$PSScriptRoot\..\dist"
}

# 2. Build production assets (Vite frontend + esbuild server)
Write-Host "[*] Compiling frontend assets and server bundle..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\.."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Production build failed!"
}

# 3. Compile standalone binaries using pkg
Write-Host "[*] Compiling standalone cross-platform executables..." -ForegroundColor Yellow
# We compile targets:
# - node18-win-x64 (Windows Desktop Release)
# - node18-linux-x64 (Linux Server and WSL Native Release)

$targets = "node18-win-x64,node18-linux-x64"
Write-Host "[*] Running pkg targeted at: $targets" -ForegroundColor Gray

npx pkg . --targets $targets --out-path "$PSScriptRoot"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Binary packaging via pkg failed!"
}

Write-Host "`n[+] STANDALONE EXECUTABLES COMPILED SUCCESSFULLY:" -ForegroundColor Green
Write-Host "  -> Windows (x64): $(Join-Path $PSScriptRoot 'react-example-win.exe')" -ForegroundColor Gray
Write-Host "  -> Linux/WSL (x64): $(Join-Path $PSScriptRoot 'react-example-linux')" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Cyan
