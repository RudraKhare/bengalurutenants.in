# ============================================
# Remove Test Files - Cleanup Script
# ============================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  REMOVE TEST FILES" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".\TEST_FILES_BACKUP_$timestamp"

Write-Host "Creating backup directory: $backupDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$removedCount = 0

# ============================================
# BACKEND TEST FILES
# ============================================
Write-Host ""
Write-Host "1. Removing backend test files..." -ForegroundColor Green

$backendTestFiles = @(
    "backend\test_main.py",
    "backend\test_city_filter.py",
    "backend\test_day3.py",
    "backend\test_property_type_creation.py",
    "backend\test_property_type_integration.py",
    "backend\test_r2_integration.py",
    "backend\test_r2_pipeline.py",
    "backend\test_r2_real.py",
    "backend\test_review_api.py",
    "backend\test_review_photos.py",
    "backend\test_user_dashboard.py",
    "backend\main_test.py",
    "backend\main_test_mode.py",
    "backend\run_test_server.py",
    "backend\manual_test_commands.py",
    "backend\quick_test.ps1",
    "backend\quick_test_fixed.ps1",
    "backend\final_r2_test.py"
)

Write-Host "   Found $($backendTestFiles.Count) backend test files to remove" -ForegroundColor Gray

foreach ($filePath in $backendTestFiles) {
    if (Test-Path $filePath) {
        try {
            # Create backup structure
            $backupPath = Join-Path $backupDir $filePath
            $backupParent = Split-Path $backupPath -Parent
            if (-not (Test-Path $backupParent)) {
                New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
            }
            
            Copy-Item $filePath -Destination $backupPath -ErrorAction SilentlyContinue
            Remove-Item $filePath -Force
            Write-Host "   [OK] Removed: $filePath" -ForegroundColor DarkGray
            $removedCount++
        } catch {
            Write-Host "   [FAIL] Failed to remove: $filePath" -ForegroundColor Red
        }
    }
}

# ============================================
# BACKEND DIAGNOSTIC FILES
# ============================================
Write-Host ""
Write-Host "2. Removing backend diagnostic files..." -ForegroundColor Green

$backendDiagFiles = @(
    "backend\check_all_reviews.py",
    "backend\check_current_properties.py",
    "backend\check_enum.py",
    "backend\check_photos.py",
    "backend\diagnose_connection.py",
    "backend\diagnose_property_photos.py",
    "backend\inspect_schema.py"
)

Write-Host "   Found $($backendDiagFiles.Count) diagnostic files to remove" -ForegroundColor Gray

foreach ($filePath in $backendDiagFiles) {
    if (Test-Path $filePath) {
        try {
            $backupPath = Join-Path $backupDir $filePath
            $backupParent = Split-Path $backupPath -Parent
            if (-not (Test-Path $backupParent)) {
                New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
            }
            
            Copy-Item $filePath -Destination $backupPath -ErrorAction SilentlyContinue
            Remove-Item $filePath -Force
            Write-Host "   [OK] Removed: $filePath" -ForegroundColor DarkGray
            $removedCount++
        } catch {
            Write-Host "   [FAIL] Failed to remove: $filePath" -ForegroundColor Red
        }
    }
}

# ============================================
# BACKEND FIX/MIGRATION SCRIPTS
# ============================================
Write-Host ""
Write-Host "3. Removing backend fix/migration scripts..." -ForegroundColor Green

$backendFixFiles = @(
    "backend\add_review_comments.py",
    "backend\fix_coordinates.py",
    "backend\fix_latest_review.py",
    "backend\fix_review_comment.py",
    "backend\quick_fix_review.py",
    "backend\migrate_property_type.py",
    "backend\migrate_sqlalchemy.py",
    "backend\create_schema.py"
)

Write-Host "   Found $($backendFixFiles.Count) fix/migration scripts to remove" -ForegroundColor Gray

foreach ($filePath in $backendFixFiles) {
    if (Test-Path $filePath) {
        try {
            $backupPath = Join-Path $backupDir $filePath
            $backupParent = Split-Path $backupPath -Parent
            if (-not (Test-Path $backupParent)) {
                New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
            }
            
            Copy-Item $filePath -Destination $backupPath -ErrorAction SilentlyContinue
            Remove-Item $filePath -Force
            Write-Host "   [OK] Removed: $filePath" -ForegroundColor DarkGray
            $removedCount++
        } catch {
            Write-Host "   [FAIL] Failed to remove: $filePath" -ForegroundColor Red
        }
    }
}

# ============================================
# BACKEND SQL FILES
# ============================================
Write-Host ""
Write-Host "4. Removing backend SQL files..." -ForegroundColor Green

$backendSqlFiles = @(
    "backend\check_database_state.sql",
    "backend\force_cleanup_database.sql"
)

Write-Host "   Found $($backendSqlFiles.Count) SQL files to remove" -ForegroundColor Gray

foreach ($filePath in $backendSqlFiles) {
    if (Test-Path $filePath) {
        try {
            $backupPath = Join-Path $backupDir $filePath
            $backupParent = Split-Path $backupPath -Parent
            if (-not (Test-Path $backupParent)) {
                New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
            }
            
            Copy-Item $filePath -Destination $backupPath -ErrorAction SilentlyContinue
            Remove-Item $filePath -Force
            Write-Host "   [OK] Removed: $filePath" -ForegroundColor DarkGray
            $removedCount++
        } catch {
            Write-Host "   [FAIL] Failed to remove: $filePath" -ForegroundColor Red
        }
    }
}

# ============================================
# FRONTEND TEST FILES
# ============================================
Write-Host ""
Write-Host "5. Removing frontend test files..." -ForegroundColor Green

$frontendTestFiles = @(
    "frontend\test-integration.js"
)

Write-Host "   Found $($frontendTestFiles.Count) frontend test file to remove" -ForegroundColor Gray

foreach ($filePath in $frontendTestFiles) {
    if (Test-Path $filePath) {
        try {
            $backupPath = Join-Path $backupDir $filePath
            $backupParent = Split-Path $backupPath -Parent
            if (-not (Test-Path $backupParent)) {
                New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
            }
            
            Copy-Item $filePath -Destination $backupPath -ErrorAction SilentlyContinue
            Remove-Item $filePath -Force
            Write-Host "   [OK] Removed: $filePath" -ForegroundColor DarkGray
            $removedCount++
        } catch {
            Write-Host "   [FAIL] Failed to remove: $filePath" -ForegroundColor Red
        }
    }
}

# ============================================
# SUMMARY
# ============================================
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($removedCount -gt 0) {
    $backupFiles = Get-ChildItem -Path $backupDir -Recurse -File
    $backupSize = ($backupFiles | Measure-Object -Property Length -Sum).Sum / 1KB
    
    Write-Host "[SUCCESS] Backup created: $backupDir" -ForegroundColor Green
    Write-Host "          Size: $([math]::Round($backupSize, 2)) KB" -ForegroundColor Gray
    Write-Host "          Files: $($backupFiles.Count)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "[SUCCESS] Removed $removedCount test/diagnostic files" -ForegroundColor Green
    Write-Host ""
    Write-Host "Categories removed:" -ForegroundColor Yellow
    Write-Host "  - Backend test files (*.py)" -ForegroundColor Gray
    Write-Host "  - Backend diagnostic files (check_*, diagnose_*)" -ForegroundColor Gray
    Write-Host "  - Backend fix/migration scripts" -ForegroundColor Gray
    Write-Host "  - Backend SQL debug files" -ForegroundColor Gray
    Write-Host "  - Frontend test files" -ForegroundColor Gray
} else {
    Write-Host "[INFO] No test files found to remove" -ForegroundColor Yellow
    Remove-Item $backupDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP COMPLETE!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($removedCount -gt 0) {
    Write-Host "To restore files: Copy-Item '$backupDir\*' -Destination . -Recurse -Force" -ForegroundColor Yellow
    Write-Host "To delete backup: Remove-Item '$backupDir' -Recurse -Force" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Test files removed successfully!" -ForegroundColor Green
    Write-Host ""
}
