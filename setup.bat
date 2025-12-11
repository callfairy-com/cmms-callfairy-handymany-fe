@echo off
echo ========================================
echo    CRM Fairy Frontend Setup Script
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully

echo.
echo [3/4] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo ✓ Environment file created from template
) else (
    echo ✓ Environment file already exists
)

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo    Next Steps:
echo ========================================
echo 1. Make sure your Django backend is running on http://localhost:8000
echo 2. Run 'npm run dev' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo For more information, see README.md
echo.
pause
