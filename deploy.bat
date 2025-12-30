@echo off
echo ========================================
echo   Bosbeekse 15 - Deploy Script
echo ========================================
echo.

:: Change to project directory
cd /d "D:\OneDrive\001. PROJECTEN\000. KUBUZ\Bosbeekse15"

:: Check if there are changes to commit
git status --porcelain > nul
if %errorlevel% neq 0 (
    echo [ERROR] Not a git repository or git not installed
    pause
    exit /b 1
)

:: Show current status
echo [1/4] Checking for changes...
git status --short

:: Ask for commit message
echo.
set /p MESSAGE="Enter commit message (or press Enter for 'Update'): "
if "%MESSAGE%"=="" set MESSAGE=Update

:: Add all changes
echo.
echo [2/4] Adding all changes...
git add .

:: Commit
echo.
echo [3/4] Committing with message: "%MESSAGE%"
git commit -m "%MESSAGE%"

:: Push to GitHub (Netlify auto-deploys from GitHub)
echo.
echo [4/4] Pushing to GitHub...
git push

echo.
echo ========================================
echo   Deploy complete!
echo ========================================
echo.
echo Netlify will automatically build and deploy.
echo Check status at: https://app.netlify.com
echo.
echo Your site: https://bosbeekse15.kubuz.net
echo.
pause

