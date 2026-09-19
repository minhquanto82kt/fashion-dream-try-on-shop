@echo off
setlocal
cd /d "%~dp0.."
call npm run lint || goto :fail
call npm run typecheck || goto :fail
call npm run build || goto :fail
echo.
echo WEARO CHECK PASSED
exit /b 0
:fail
echo.
echo WEARO CHECK FAILED
exit /b 1
