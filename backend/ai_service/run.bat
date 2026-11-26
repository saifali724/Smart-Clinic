@echo off
REM MediScan AI - diagnosis service (port 5002)
REM Uses its OWN Python environment (backend\ai_service\.venv), separate from any other .venv.
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Creating a Python environment for the AI service ^(first time only^)...
  py -3 -m venv .venv 2>nul || python -m venv .venv
)
if not exist ".venv\Scripts\python.exe" (
  echo.
  echo Python was not found. Install Python 3.10+ from python.org and tick "Add python.exe to PATH".
  pause
  exit /b 1
)

echo Installing / checking packages...
".venv\Scripts\python.exe" -m pip install --upgrade pip --quiet
".venv\Scripts\python.exe" -m pip install -r requirements.txt --quiet
if errorlevel 1 (
  echo.
  echo Package install failed. See the message above.
  pause
  exit /b 1
)

echo.
echo AI diagnosis service starting on http://localhost:5002  ^(keep this window open^)
".venv\Scripts\python.exe" -m uvicorn main:app --port 5002
pause
