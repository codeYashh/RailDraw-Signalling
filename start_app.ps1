# RailDraw Signalling — Start Backend & Frontend Servers
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting RailDraw Signalling..." -ForegroundColor Cyan

# Start FastAPI Backend (port 8000, accessible on LAN for phone APK download)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root'; python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

# Start Vite Frontend Dev Server (port 5173)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host ""
Write-Host "Servers launching:" -ForegroundColor Green
Write-Host "  Frontend Dev UI : http://127.0.0.1:5173/"
Write-Host "  Phone Simulator : http://127.0.0.1:8000/simulator"
Write-Host "  Built Web App   : http://127.0.0.1:8000/app/"
Write-Host "  APK Download    : http://127.0.0.1:8000/download"
Write-Host "  Backend API     : http://127.0.0.1:8000/api/health"
