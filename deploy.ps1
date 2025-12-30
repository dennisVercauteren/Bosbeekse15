# Bosbeekse 15 - Deploy Script (PowerShell)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Bosbeekse 15 - Deploy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "D:\OneDrive\001. PROJECTEN\000. KUBUZ\Bosbeekse15"

# Ask for commit message
$message = Read-Host "Commit message (or Enter for 'Update')"
if ([string]::IsNullOrEmpty($message)) { $message = "Update" }

# Add, commit, push
Write-Host ""
Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Committing: '$message'" -ForegroundColor Yellow
git commit -m "$message" --allow-empty

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push

Write-Host ""
Write-Host "Opening Netlify deploy status..." -ForegroundColor Cyan
Start-Process "https://app.netlify.com/sites/bosbeekse15/deploys"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Done! Check Netlify for build status" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
