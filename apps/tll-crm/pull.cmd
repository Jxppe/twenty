@echo off
REM Watches GitHub and pulls when something lands, so you never type git pull.
REM Run in terminal 2 and leave it. The dev watcher picks up whatever arrives.
setlocal
set REPO=%~dp0..\..
echo Watching for changes on the current branch. Ctrl-C to stop.
:loop
git -C "%REPO%" fetch --quiet 2>nul
for /f %%i in ('git -C "%REPO%" rev-list HEAD..@{u} --count 2^>nul') do set BEHIND=%%i
if not "%BEHIND%"=="0" if not "%BEHIND%"=="" (
  echo.
  echo [%TIME:~0,8%] %BEHIND% new commit^(s^), pulling...
  git -C "%REPO%" pull --ff-only
)
timeout /t 20 /nobreak >nul
goto loop
