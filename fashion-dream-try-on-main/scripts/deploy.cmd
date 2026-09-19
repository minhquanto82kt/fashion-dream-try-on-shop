@echo off
setlocal
cd /d "%~dp0.."
if /I "%~1"=="preview" goto preview
if /I "%~1"=="production" goto production
echo Usage: deploy.cmd preview ^| production
exit /b 2
:preview
call scripts\check.cmd || exit /b 1
call vercel || exit /b 1
exit /b 0
:production
call scripts\check.cmd || exit /b 1
call vercel --prod || exit /b 1
exit /b 0
