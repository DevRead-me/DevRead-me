@echo off
setlocal enabledelayedexpansion

:: DevRead.me Quick Start Script for Windows
:: Automatisiertes Setup für Development & Production

color 0A
cls

echo.
echo ========================================
echo  DevRead.me Quick Start Setup (Windows)
echo ========================================
echo.

:: Check Node.js
echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detected

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found
    pause
    exit /b 1
)

for /f %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% detected

if not exist "package.json" (
    echo [ERROR] package.json not found. Are you in the devreadme directory?
    pause
    exit /b 1
)

echo.

:: Setup menu
echo Select setup type:
echo 1) Development Setup (npm install + dev server)
echo 2) Production Build (npm install + build)
echo 3) Clean Install (remove node_modules + install)
echo 4) Docker Build (requires Docker)
echo.

set /p choice=Enter choice (1-4): 

if "%choice%"=="1" (
    set setup_type=Development
) else if "%choice%"=="2" (
    set setup_type=Production
) else if "%choice%"=="3" (
    set setup_type=Clean
) else if "%choice%"=="4" (
    set setup_type=Docker
) else (
    echo [ERROR] Invalid choice
    pause
    exit /b 1
)

echo.
echo Setting up for %setup_type%...
echo.

:: Check .env.local
if not exist ".env.local" (
    if exist ".env.local.example" (
        echo [WARNING] .env.local not found. Creating from template...
        copy ".env.local.example" ".env.local" >nul
        echo [WARNING] Please edit .env.local and add your GROQ_API_KEY
        echo.
        echo Opening .env.local for editing...
        notepad ".env.local"
    ) else (
        echo [ERROR] .env.local.example not found
        pause
        exit /b 1
    )
)

:: Validate GROQ_API_KEY
findstr /R "^GROQ_API_KEY=" ".env.local" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] GROQ_API_KEY not found in .env.local
    pause
    exit /b 1
)

findstr "your_groq_api_key_here" ".env.local" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] GROQ_API_KEY still set to placeholder in .env.local
    echo Please update it first!
    notepad ".env.local"
)

echo [OK] GROQ_API_KEY configured

echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed

echo.

:: Execute chosen setup
if "%setup_type%"=="Development" (
    echo.
    echo ========================================
    echo  Development Setup Complete!
    echo ========================================
    echo.
    echo Starting development server...
    echo.
    echo Browse to: http://localhost:3000
    echo.
    call npm run dev
) else if "%setup_type%"=="Production" (
    echo.
    echo Building for production...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Build failed
        pause
        exit /b 1
    )
    echo.
    echo ========================================
    echo  Production Build Complete!
    echo ========================================
    echo.
    echo To start the production server, run:
    echo   npm start
) else if "%setup_type%"=="Clean" (
    echo.
    echo Removing node_modules and package-lock.json...
    if exist "node_modules" rmdir /S /Q "node_modules"
    if exist "package-lock.json" del "package-lock.json"
    echo.
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
    echo.
    echo ========================================
    echo  Clean Install Complete!
    echo ========================================
    echo.
    echo Now run:
    echo   npm run dev    # for development
    echo   npm run build  # for production
) else if "%setup_type%"=="Docker" (
    where docker >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Docker not found. Install from https://docker.com
        pause
        exit /b 1
    )
    echo.
    echo Building Docker image...
    call docker build -t devreadme:latest .
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Docker build failed
        pause
        exit /b 1
    )
    echo.
    echo ========================================
    echo  Docker Build Complete!
    echo ========================================
    echo.
    echo To run the Docker container:
    echo   docker run -e GROQ_API_KEY="your_key" -p 3000:3000 devreadme:latest
)

echo.
echo [OK] Setup complete!
echo.
pause
