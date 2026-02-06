@echo off
REM Docker Setup & Deployment Script for Network Helper Cameroon (Windows)

echo.
echo ==========================================
echo Network Helper - Docker Setup (Windows)
echo ==========================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker found

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from .env.docker...
    copy .env.docker .env
    if %ERRORLEVEL% EQU 0 (
        echo [OK] .env created with Docker defaults
    ) else (
        echo [ERROR] Failed to create .env file
        pause
        exit /b 1
    )
) else (
    echo [OK] .env file already exists
)

REM Build images
echo.
echo Building Docker images...
docker-compose build

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed. Check errors above.
    pause
    exit /b 1
)

echo [OK] Build successful

REM Start containers
echo.
echo Starting containers...
docker-compose up -d

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start containers. Check errors above.
    pause
    exit /b 1
)

echo [OK] Containers started

REM Wait for services
echo.
echo Waiting for services to be ready...
timeout /t 5 /nobreak

REM Test backend
echo.
echo Testing backend API...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/reports/count' -UseBasicParsing; Write-Host '[OK] Backend responding' } catch { Write-Host '[WARNING] Backend might not be ready yet' }"

REM Test frontend
echo.
echo Testing frontend...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost/' -UseBasicParsing; Write-Host '[OK] Frontend responding' } catch { Write-Host '[WARNING] Frontend might not be ready yet' }"

echo.
echo ==========================================
echo [OK] Setup Complete!
echo ==========================================
echo.
echo Access your application:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:3000/api/reports/count
echo.
echo Useful commands:
echo    View logs:    docker-compose logs -f
echo    Stop:         docker-compose down
echo    Rebuild:      docker-compose up --build -d
echo.
pause
