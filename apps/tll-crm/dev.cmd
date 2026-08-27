@echo off
REM Start the watcher: edit a file, save, it syncs. Leave this running.
REM Uses the node bundle directly so a broken yarn shim does not matter.
REM
REM Relaunches if it dies. The watcher leaks slowly and eventually hits the heap
REM cap, and a dead watcher looks exactly like a working one until you notice
REM nothing has synced for an hour. Ctrl-C twice to stop for real.
setlocal
if "%NODE_OPTIONS%"=="" set NODE_OPTIONS=--max-old-space-size=8192
:loop
node "%~dp0node_modules\twenty-sdk\dist\cli.cjs" dev %*
echo.
echo [%TIME:~0,8%] Watcher exited. Restarting in 5 seconds. Ctrl-C to stop.
timeout /t 5 >nul
goto loop
