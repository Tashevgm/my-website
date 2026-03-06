@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo Starting website...
call npm start

if errorlevel 1 (
  echo.
  echo Failed to start website.
  pause
  exit /b 1
)

endlocal
