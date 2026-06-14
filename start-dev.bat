@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo  Portfolio - Local Dev Server (Vite)
echo  Browser opens at http://localhost:5173
echo  Stop: press Ctrl+C in this window
echo ============================================
echo.

REM Use npm from PATH if available, else fall back to the default install path.
where npm >nul 2>nul
if %errorlevel%==0 (
  call npm install
  call npm run dev
) else (
  call "C:\Program Files\nodejs\npm.cmd" install
  call "C:\Program Files\nodejs\npm.cmd" run dev
)

echo.
echo (server stopped)
pause
