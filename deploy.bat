@echo off
echo ========================================
echo   Bosbeekse 15 - Deploy Script
echo ========================================
echo.

:: Change to project directory
cd /d "D:\OneDrive\001. PROJECTEN\000. KUBUZ\Bosbeekse15"

:: Ask for commit message
set /p MESSAGE="Commit message (or Enter for 'Update'): "
if "%MESSAGE%"=="" set MESSAGE=Update

:: Add, commit, push
echo.
echo Adding all changes...
git add .

echo.
echo Committing: "%MESSAGE%"
git commit -m "%MESSAGE%" --allow-empty

echo.
echo Pushing to GitHub...
git push

echo.
echo Opening Netlify deploy status...
start https://app.netlify.com/sites/bosbeekse15/deploys

echo.
echo ========================================
echo   Done! Check Netlify for build status
echo ========================================
echo.
pause
