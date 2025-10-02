@echo off
REM Activate Virtual Environment and Start Backend Server

echo.
echo 🚀 Starting Backend with Virtual Environment
echo ============================================
echo.

cd /d "%~dp0"

REM Check if venv exists
if not exist "venv\" (
    echo ❌ Virtual environment not found!
    echo.
    echo Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
    echo.
    echo Installing dependencies...
    call venv\Scripts\activate.bat
    pip install --upgrade pip
    pip install -r requirements.txt
    echo ✅ Dependencies installed
    echo.
)

REM Activate venv
call venv\Scripts\activate.bat

echo ✅ Virtual environment activated: (venv)
echo.

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found
    echo Please create .env with your configuration
    echo.
)

echo 📦 Installed packages location:
python -c "import sys; print(sys.prefix)"
echo.

echo 🔍 Starting FastAPI server...
echo Access the API at: http://localhost:8000
echo API Docs at: http://localhost:8000/docs
echo.

REM Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
