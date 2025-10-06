# ============================================
# Remove Test & Diagnostic Files Script
# ============================================
# Removes only diagnostic and temporary test files
# KEEPS backend/app/tests/ (proper test suite)
# ============================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  REMOVE TEST & DIAGNOSTIC FILES" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Keeping backend/app/tests/ folder" -ForegroundColor Yellow
Write-Host "           (proper pytest test suite)" -ForegroundColor Gray
Write-Host ""

# Create backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".\TEST_BACKUP_$timestamp"

Write-Host "Creating backup: $backupDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# ============================================
# 1. BACKEND TEMPORARY TEST FILES
# ============================================
Write-Host ""
Write-Host "1. Backend temporary test files..." -ForegroundColor Green

$backendTempTests = @(
    "backend\main_simple.py",
    "backend\main_test.py",
    "backend\main_test_mode.py",
    "backend\run_test_server.py",
    "backend\manual_test_commands.py",
    "backend\create_schema.py",
    "backend\crud.py",
    "backend\final_r2_test.py"
)

$removed = 0
foreach ($file in $backendTempTests) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $backupDir -ErrorAction SilentlyContinue
        Remove-Item $file -Force
        Write-Host "   [OK] Removed: $file" -ForegroundColor DarkGray
        $removed++
    }
}
Write-Host "   Removed: $removed files" -ForegroundColor Gray

# ============================================
# 2. DIAGNOSTIC SCRIPTS
# ============================================
Write-Host ""
Write-Host "2. Diagnostic scripts..." -ForegroundColor Green

$diagnosticFiles = @(
    "backend\check_current_properties.py",
    "backend\check_enum.py",
    "backend\check_photos.py",
    "backend\diagnose_connection.py",
    "backend\diagnose_property_photos.py",
    "backend\inspect_schema.py",
    "backend\app\check_city_localities.py"
)

$removed = 0
foreach ($file in $diagnosticFiles) {
    if (Test-Path $file) {
        # Create subdirectory in backup if needed
        $dir = Split-Path $file -Parent
        $backupSubDir = Join-Path $backupDir $dir
        New-Item -ItemType Directory -Path $backupSubDir -Force -ErrorAction SilentlyContinue | Out-Null
        
        Copy-Item $file -Destination (Join-Path $backupSubDir (Split-Path $file -Leaf)) -ErrorAction SilentlyContinue
        Remove-Item $file -Force
        Write-Host "   [OK] Removed: $file" -ForegroundColor DarkGray
        $removed++
    }
}
Write-Host "   Removed: $removed files" -ForegroundColor Gray

# ============================================
# 3. MIGRATION SCRIPTS (Already Applied)
# ============================================
Write-Host ""
Write-Host "3. Migration scripts..." -ForegroundColor Green

$migrationFiles = @(
    "backend\fix_coordinates.py",
    "backend\migrate_property_type.py",
    "backend\migrate_sqlalchemy.py"
)

$removed = 0
foreach ($file in $migrationFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $backupDir -ErrorAction SilentlyContinue
        Remove-Item $file -Force
        Write-Host "   [OK] Removed: $file" -ForegroundColor DarkGray
        $removed++
    }
}
Write-Host "   Removed: $removed files" -ForegroundColor Gray

# ============================================
# 4. POWERSHELL TEST SCRIPTS
# ============================================
Write-Host ""
Write-Host "4. PowerShell test scripts..." -ForegroundColor Green

$psTestFiles = @(
    "backend\quick_test.ps1",
    "backend\quick_test_fixed.ps1"
)

$removed = 0
foreach ($file in $psTestFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $backupDir -ErrorAction SilentlyContinue
        Remove-Item $file -Force
        Write-Host "   [OK] Removed: $file" -ForegroundColor DarkGray
        $removed++
    }
}
Write-Host "   Removed: $removed files" -ForegroundColor Gray

# ============================================
# 5. SQL DIAGNOSTIC FILES
# ============================================
Write-Host ""
Write-Host "5. SQL diagnostic files..." -ForegroundColor Green

$sqlDiagFiles = @(
    "backend\check_database_state.sql",
    "backend\force_cleanup_database.sql"
)

$removed = 0
foreach ($file in $sqlDiagFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $backupDir -ErrorAction SilentlyContinue
        Remove-Item $file -Force
        Write-Host "   [OK] Removed: $file" -ForegroundColor DarkGray
        $removed++
    }
}
Write-Host "   Removed: $removed files" -ForegroundColor Gray

# ============================================
# SUMMARY
# ============================================
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$backupFiles = Get-ChildItem -Path $backupDir -Recurse -File
$backupSize = ($backupFiles | Measure-Object -Property Length -Sum).Sum / 1KB

Write-Host "[SUCCESS] Backup: $backupDir" -ForegroundColor Green
Write-Host "          Size: $([math]::Round($backupSize, 2)) KB" -ForegroundColor Gray
Write-Host "          Files: $($backupFiles.Count)" -ForegroundColor Gray
Write-Host ""
Write-Host "[KEPT] backend/app/tests/ folder" -ForegroundColor Green
Write-Host "       - test_auth.py" -ForegroundColor Gray
Write-Host "       - test_properties.py" -ForegroundColor Gray
Write-Host "       - test_reviews.py" -ForegroundColor Gray
Write-Host "       - __init__.py" -ForegroundColor Gray
Write-Host ""
Write-Host "[REMOVED] Temporary test files" -ForegroundColor Yellow
Write-Host "[REMOVED] Diagnostic scripts" -ForegroundColor Yellow
Write-Host "[REMOVED] Migration scripts (already applied)" -ForegroundColor Yellow
Write-Host "[REMOVED] SQL diagnostic files" -ForegroundColor Yellow
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP COMPLETE!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To restore: Copy-Item '$backupDir\*' -Destination . -Recurse -Force" -ForegroundColor Yellow
Write-Host "To delete backup: Remove-Item '$backupDir' -Recurse -Force" -ForegroundColor Yellow
Write-Host ""
Write-Host "Application test suite preserved in backend/app/tests/" -ForegroundColor Green
Write-Host ""
