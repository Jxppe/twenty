@echo off
REM One terminal, nothing to type. Watches the branch; when a commit lands it
REM pulls, pushes the metadata to the CRM, and runs the install hook.
REM
REM Replaces the old dev + pull pair. The file watcher in `dev` only helps
REM someone editing files on this machine; changes arrive here by git, so
REM watching git is the loop that matters.
setlocal enabledelayedexpansion
if "%NODE_OPTIONS%"=="" set NODE_OPTIONS=--max-old-space-size=8192
set REPO=%~dp0..\..
set CLI=node "%~dp0node_modules\twenty-sdk\dist\cli.cjs"

echo Watching for commits. Ctrl-C to stop.
echo.
call :deploy

:loop
git -C "%REPO%" fetch --quiet 2>nul
set BEHIND=
for /f %%i in ('git -C "%REPO%" rev-list HEAD..@{u} --count 2^>nul') do set BEHIND=%%i
if not "!BEHIND!"=="0" if not "!BEHIND!"=="" (
  echo.
  echo [%TIME:~0,8%] !BEHIND! new commit^(s^), pulling
  git -C "%REPO%" pull --ff-only
  call :deploy
)
timeout /t 20 /nobreak >nul
goto loop

:deploy
echo [%TIME:~0,8%] Applying to the CRM
%CLI% apply
if errorlevel 1 (
  echo [%TIME:~0,8%] SYNC FAILED. Read the errors above. It retries on the next commit.
  goto :eof
)
echo [%TIME:~0,8%] Running the install hook
%CLI% dev:function:exec --postInstall
echo [%TIME:~0,8%] Done.
goto :eof
