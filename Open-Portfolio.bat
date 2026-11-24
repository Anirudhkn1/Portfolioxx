@echo off
REM Builds (first time) and serves the portfolio, then opens it in the browser.
REM A local server is needed: the 3D skull model can't load from a plain file:// page.
cd /d "%~dp0"
if not exist node_modules call npm install
if not exist dist\index.html call npm run build
start "" http://localhost:4173/
call npx vite preview --port 4173
