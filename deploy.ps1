# Bosbeekse 15 - Deploy Script (PowerShell)
# ==========================================
# Usage: Right-click -> Run with PowerShell
# Or in terminal: .\deploy.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Bosbeekse 15 - Deploy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "D:\OneDrive\001. PROJECTEN\000. KUBUZ\Bosbeekse15"

# Show current status
Write-Host "[1/5] Checking for changes..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Check if there are any changes
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "No changes to commit!" -ForegroundColor Green
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 0
}

# Ask for commit message
$message = Read-Host "Enter commit message (or press Enter for 'Update')"
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "Update"
}

# Add all changes
Write-Host ""
Write-Host "[2/5] Adding all changes..." -ForegroundColor Yellow
git add .

# Commit
Write-Host ""
Write-Host "[3/5] Committing: $message" -ForegroundColor Yellow
git commit -m $message

# Push to GitHub
Write-Host ""
Write-Host "[4/5] Pushing to GitHub..." -ForegroundColor Yellow
git push

# Open Netlify deploy page
Write-Host ""
Write-Host "[5/5] Opening Netlify deploy status..." -ForegroundColor Yellow
Start-Process "https://app.netlify.com/sites/bosbeekse15/deploys"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Deploy triggered!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Netlify is now building and deploying your site." -ForegroundColor White
Write-Host ""
Write-Host "Watch progress: " -NoNewline
Write-Host "https://app.netlify.com/sites/bosbeekse15/deploys" -ForegroundColor Cyan
Write-Host "Your site:      " -NoNewline
Write-Host "https://bosbeekse15.kubuz.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "Build takes about 1-2 minutes." -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"
