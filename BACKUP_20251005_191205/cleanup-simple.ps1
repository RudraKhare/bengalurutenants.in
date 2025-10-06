# Project Cleanup Script - Moderate Level
# Run this to clean up documentation and unused files

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "_CLEANUP_BACKUP_$timestamp"
$filesDeleted = 0

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  PROJECT CLEANUP - MODERATE LEVEL" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Creating backup folder: $backupDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host ""

# List of files to delete
$filesToDelete = @(
    "SELECT_CITY_VISUAL_GUIDE.md",
    "SELECT_CITY_FIX_QUICK_REF.md",
    "SELECT_CITY_FIX_SUMMARY.md",
    "SELECT_CITY_MOBILE_FIX.md",
    "LOGIN_BUTTON_STYLING_UPDATE.md"
)

Write-Host "Deleting files..." -ForegroundColor Cyan
foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Copy-Item $file $backupDir\ -Force
        Remove-Item $file -Force
        Write-Host "  [OK] Deleted: $file" -ForegroundColor Green
        $filesDeleted++
    }
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "  CLEANUP COMPLETE" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "Files deleted: $filesDeleted" -ForegroundColor Green
Write-Host "Backup location: $backupDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "Test your app, then delete backup if all works:" -ForegroundColor Yellow
Write-Host "  Remove-Item $backupDir -Recurse -Force" -ForegroundColor White
