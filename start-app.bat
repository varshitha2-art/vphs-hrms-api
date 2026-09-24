@echo off
title VPHS Services ERP - Unified System
cd /d "%~dp0"

echo =======================================================
echo   VPHS SERVICES PVT. LTD. - ERP SYSTEM LAUNCHER
echo =======================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js (v18+) to run this application.
    pause
    exit /b 1
)

echo Starting VPHS Unified ERP Server...
echo Opening browser at http://localhost:5000 in 3 seconds...
start "" timeout /t 3 /nobreak >nul & start http://localhost:5000

node app.js
pause
