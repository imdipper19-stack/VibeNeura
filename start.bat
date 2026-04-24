@echo off
REM OmniChat — Windows one-click starter.
REM Requires: Docker Desktop for Windows running.

echo ====================================
echo   Starting OmniChat...
echo ====================================

where docker >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] Docker is not installed or not in PATH.
  echo Install Docker Desktop: https://www.docker.com/products/docker-desktop
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] Docker Desktop is not running. Launch it and try again.
  pause
  exit /b 1
)

echo.
echo Building containers (first run takes ~3-5 minutes)...
docker compose up --build -d

if errorlevel 1 (
  echo.
  echo [ERROR] docker compose failed. Check output above.
  pause
  exit /b 1
)

echo.
echo ====================================
echo   OmniChat is starting at:
echo   http://localhost:3000
echo ====================================
echo.
echo Logs:   docker compose logs -f app
echo Stop:   docker compose down
echo.

timeout /t 3 /nobreak >nul
start http://localhost:3000
pause
