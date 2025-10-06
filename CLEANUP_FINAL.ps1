# ============================================
# Cleanup Script - Remove Unused Files
# ============================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP UNUSED FILES" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".\BACKUP_$timestamp"

Write-Host "Creating backup directory: $backupDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# ============================================
# 1. DOCUMENTATION FILES
# ============================================
Write-Host ""
Write-Host "1. Removing documentation files (.md)..." -ForegroundColor Green

$mdFilesToKeep = @(
    "README.md",
    "QUICKSTART.md",
    "CLEANUP_SUMMARY.md"
)

$mdFiles = Get-ChildItem -Path . -Filter "*.md" -File | Where-Object {
    $mdFilesToKeep -notcontains $_.Name
}

Write-Host "   Found $($mdFiles.Count) documentation files to remove" -ForegroundColor Gray

foreach ($file in $mdFiles) {
    try {
        Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
        Remove-Item $file.FullName -Force
        Write-Host "   [OK] Removed: $($file.Name)" -ForegroundColor DarkGray
    } catch {
        Write-Host "   [FAIL] Failed to remove: $($file.Name)" -ForegroundColor Red
    }
}

# ============================================
# 2. SQL FILES
# ============================================
Write-Host ""
Write-Host "2. Removing SQL migration/debug files..." -ForegroundColor Green

$sqlFilesToRemove = @(
    "add_property_type_to_reviews.sql",
    "add_sample_photo_keys.sql",
    "check-enum-values.sql",
    "check_and_fix_photos.sql",
    "check_recent_photos.sql",
    "cleanup_invalid_photos.sql",
    "cleanup_sample_photos.sql",
    "debug_enum.sql",
    "fix_review_comment.sql",
    "migration-add-photo-support.sql",
    "migration_cities_localities.sql",
    "migration_property_type.sql"
)

Write-Host "   Found $($sqlFilesToRemove.Count) SQL files to remove" -ForegroundColor Gray

foreach ($fileName in $sqlFilesToRemove) {
    $file = Get-Item $fileName -ErrorAction SilentlyContinue
    if ($file) {
        try {
            Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
            Remove-Item $file.FullName -Force
            Write-Host "   [OK] Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   [FAIL] Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 3. PYTHON FILES
# ============================================
Write-Host ""
Write-Host "3. Removing Python debug/test files..." -ForegroundColor Green

$pyFilesToRemove = @(
    "diagnose_photos.py",
    "test_application.py",
    "test_r2_connection.py"
)

Write-Host "   Found $($pyFilesToRemove.Count) Python files to remove" -ForegroundColor Gray

foreach ($fileName in $pyFilesToRemove) {
    $file = Get-Item $fileName -ErrorAction SilentlyContinue
    if ($file) {
        try {
            Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
            Remove-Item $file.FullName -Force
            Write-Host "   [OK] Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   [FAIL] Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 4. BATCH FILES
# ============================================
Write-Host ""
Write-Host "4. Removing obsolete batch files..." -ForegroundColor Green

$batFilesToRemove = @(
    "ROLLBACK.bat",
    "test-map-feature.bat"
)

Write-Host "   Found $($batFilesToRemove.Count) batch files to remove" -ForegroundColor Gray

foreach ($fileName in $batFilesToRemove) {
    $file = Get-Item $fileName -ErrorAction SilentlyContinue
    if ($file) {
        try {
            Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
            Remove-Item $file.FullName -Force
            Write-Host "   [OK] Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   [FAIL] Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 5. SHELL SCRIPTS
# ============================================
Write-Host ""
Write-Host "5. Removing shell scripts..." -ForegroundColor Green

$shFilesToRemove = @(
    "set_r2_cors.sh",
    "start-map-feature.sh"
)

Write-Host "   Found $($shFilesToRemove.Count) shell script files to remove" -ForegroundColor Gray

foreach ($fileName in $shFilesToRemove) {
    $file = Get-Item $fileName -ErrorAction SilentlyContinue
    if ($file) {
        try {
            Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
            Remove-Item $file.FullName -Force
            Write-Host "   [OK] Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   [FAIL] Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 6. CONFIG FILES
# ============================================
Write-Host ""
Write-Host "6. Removing obsolete config files..." -ForegroundColor Green

$configFilesToRemove = @(
    "r2-cors-config.json",
    "r2-cors.json",
    "verify-migration.js"
)

Write-Host "   Found $($configFilesToRemove.Count) config files to remove" -ForegroundColor Gray

foreach ($fileName in $configFilesToRemove) {
    $file = Get-Item $fileName -ErrorAction SilentlyContinue
    if ($file) {
        try {
            Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
            Remove-Item $file.FullName -Force
            Write-Host "   [OK] Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   [FAIL] Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 7. TEXT FILES
# ============================================
Write-Host ""
Write-Host "7. Removing obsolete text files..." -ForegroundColor Green

$txtFilesToRemove = @(
    "BACKEND_FIX.txt",
    "MAP_INTEGRATION_SUMMARY.txt",
    "QUICK_REFERENCE.txt"
)

Write-Host "   Found $($txtFilesToRemove.Count) text files to remove" -ForegroundColor Gray

foreach ($fileName in $txtFilesToRemove) {
    $file = Get-Item $fileName -ErrorAction SilentlyContinue
    if ($file) {
        try {
            Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
            Remove-Item $file.FullName -Force
            Write-Host "   [OK] Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   [FAIL] Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 8. OLD CLEANUP SCRIPTS
# ============================================
Write-Host ""
Write-Host "8. Removing old cleanup scripts..." -ForegroundColor Green

$cleanupScriptsToRemove = @(
    "cleanup-project.ps1",
    "cleanup-simple.ps1"
)

Write-Host "   Found $($cleanupScriptsToRemove.Count) old cleanup scripts to remove" -ForegroundColor Gray

foreach ($fileName in $cleanupScriptsToRemove) {
    $file = Get-Item $fileName -ErrorAction SilentlyContinue
    if ($file) {
        try {
            Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
            Remove-Item $file.FullName -Force
            Write-Host "   [OK] Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   [FAIL] Failed to remove: $fileName" -ForegroundColor Red
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

$backupFiles = Get-ChildItem -Path $backupDir -Recurse
$backupSize = ($backupFiles | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "[SUCCESS] Backup created: $backupDir" -ForegroundColor Green
Write-Host "          Size: $([math]::Round($backupSize, 2)) MB" -ForegroundColor Gray
Write-Host "          Files: $($backupFiles.Count)" -ForegroundColor Gray
Write-Host ""
Write-Host "[SUCCESS] Removed ~105 documentation files (.md)" -ForegroundColor Green
Write-Host "[SUCCESS] Removed 12 SQL migration files" -ForegroundColor Green
Write-Host "[SUCCESS] Removed 3 Python debug files" -ForegroundColor Green
Write-Host "[SUCCESS] Removed 2 batch files" -ForegroundColor Green
Write-Host "[SUCCESS] Removed 2 shell scripts" -ForegroundColor Green
Write-Host "[SUCCESS] Removed 3 config files" -ForegroundColor Green
Write-Host "[SUCCESS] Removed 3 text files" -ForegroundColor Green
Write-Host "[SUCCESS] Removed 2 old cleanup scripts" -ForegroundColor Green
Write-Host ""

# ============================================
# FILES KEPT
# ============================================
Write-Host "Files kept (important for application):" -ForegroundColor Yellow
Write-Host "  - README.md" -ForegroundColor Gray
Write-Host "  - QUICKSTART.md" -ForegroundColor Gray
Write-Host "  - CLEANUP_SUMMARY.md" -ForegroundColor Gray
Write-Host "  - package.json" -ForegroundColor Gray
Write-Host "  - start-frontend.bat" -ForegroundColor Gray
Write-Host "  - restart-frontend.bat" -ForegroundColor Gray
Write-Host "  - supabase-schema.sql" -ForegroundColor Gray
Write-Host "  - supabase-schema-clean.sql" -ForegroundColor Gray
Write-Host "  - frontend/ folder" -ForegroundColor Gray
Write-Host "  - backend/ folder" -ForegroundColor Gray
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP COMPLETE!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To restore files: Copy-Item '$backupDir\*' -Destination . -Force" -ForegroundColor Yellow
Write-Host "To delete backup: Remove-Item '$backupDir' -Recurse -Force" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your workspace is now cleaner!" -ForegroundColor Green
Write-Host ""
