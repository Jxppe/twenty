@echo off
REM Any CLI command without yarn: twenty remote:list, twenty plan, twenty apply
node "%~dp0node_modules\twenty-sdk\dist\cli.cjs" %*
