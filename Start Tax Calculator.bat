@echo off
cd /d "%~dp0"
start http://127.0.0.1:5173
npx vite --host 127.0.0.1 --port 5173
