@echo off
echo ========================================
echo   Bosbeekse 15 - Deploy Script
echo ========================================
echo.

:: Change to project directory
cd /d "D:\OneDrive\001. PROJECTEN\000. KUBUZ\Bosbeekse15"

:: Show current status
echo [1/5] Checking for changes...
git status --short

:: Check if there are any changes
git diff --quiet --exit-code
if %errorlevel% equ 0 (
    git diff --cached --quiet --exit-code
    if %errorlevel% equ 0 (
        echo.
        echo No changes to commit!
        pause
        exit /b 0
    )
)

:: Ask for commit message
echo.
set /p MESSAGE="Enter commit message (or press Enter for 'Update'): "
if "%MESSAGE%"=="" set MESSAGE=Update

:: Add all changes
echo.
echo [2/5] Adding all changes...
git add .

:: Commit
echo.
echo [3/5] Committing: "%MESSAGE%"
git commit -m "%MESSAGE%"

:: Push to GitHub
echo.
echo [4/5] Pushing to GitHub...
git push

:: Open Netlify deploy page
echo.
echo [5/5] Opening Netlify deploy status...
start https://app.netlify.com/sites/bosbeekse15/deploys

echo.
echo ========================================
echo   Deploy triggered!
echo ========================================
echo.
echo Netlify is now building and deploying your site.
echo.
echo Watch progress: https://app.netlify.com/sites/bosbeekse15/deploys
echo Your site:      https://bosbeekse15.kubuz.net
echo.
echo Build takes about 1-2 minutes.
echo.
pause
