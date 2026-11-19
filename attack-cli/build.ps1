# HARBORSTRIKE X CLI - Build and Test Script
Write-Host "==> Running CLI unit tests..." -ForegroundColor Cyan
go test ./...

if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests failed! Aborting build." -ForegroundColor Red
    exit 1
}

Write-Host "`n==> Creating dist directory..." -ForegroundColor Cyan
if (!(Test-Path -Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

Write-Host "==> Compiling hso.exe..." -ForegroundColor Cyan
go build -o dist\hso.exe .

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[+] Build successful! Executable created at dist\hso.exe" -ForegroundColor Green
    Write-Host "`n==> Testing dist\hso.exe status:" -ForegroundColor Yellow
    .\dist\hso.exe status
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}
