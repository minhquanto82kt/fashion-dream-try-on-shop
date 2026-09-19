@echo off
setlocal
cd /d "%~dp0.."
call npm run test:smoke || goto :fail
echo.
echo WEARO VERIFY PASSED
exit /b 0
:fail
echo.
echo WEARO VERIFY FAILED
exit /b 1
