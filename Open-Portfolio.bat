@echo off
REM Builds the portfolio, serves it, and opens the browser once the server is ready.
REM A local server is needed: the 3D skull model can't load from a plain file:// page.
REM Everything runs through node.exe, so it still works if npm.cmd is missing from the Node install.
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js was not found. Install it from https://nodejs.org & goto :fail)

if exist node_modules\vite\bin\vite.js goto :build
for %%i in (node.exe) do set "NODEDIR=%%~dp$PATH:i"
node "%NODEDIR%node_modules\npm\bin\npm-cli.js" install || goto :fail

:build
node node_modules\vite\bin\vite.js build || goto :fail
echo.
echo Keep this window open while you view the site. Closing it stops the server.
REM --open waits for the server, and opens the right address even if port 4173 is already taken.
node node_modules\vite\bin\vite.js preview --port 4173 --open || goto :fail
exit /b 0

:fail
echo.
echo The portfolio could not start. The message above says why.
pause
exit /b 1
