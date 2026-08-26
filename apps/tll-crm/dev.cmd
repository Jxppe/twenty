@echo off
REM Start the watcher: edit a file, save, it syncs. Leave this running.
REM Uses the node bundle directly so a broken yarn shim does not matter.
node "%~dp0node_modules\twenty-sdk\dist\cli.cjs" dev %*
