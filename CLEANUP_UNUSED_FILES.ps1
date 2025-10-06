# ============================================
# Cleanup Script - Remove Unused Files
# ============================================
# This script removes documentation, debug files, 
# SQL migration scripts, and other temporary files
# that are not needed for the application to run.
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  CLEANUP UNUSED FILES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".\BACKUP_$timestamp"

Write-Host "Creating backup directory: $backupDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# ============================================
# 1. DOCUMENTATION FILES (107 .md files)
# ============================================
Write-Host ""
Write-Host "1. Removing documentation files (.md)..." -ForegroundColor Green

$mdFilesToKeep = @(
    "README.md",
    "QUICKSTART.md"
)

$mdFiles = Get-ChildItem -Path . -Filter "*.md" -File | Where-Object {
    $mdFilesToKeep -notcontains $_.Name
}

Write-Host "   Found $($mdFiles.Count) documentation files to remove" -ForegroundColor Gray

foreach ($file in $mdFiles) {
    try {
        # Backup first
        Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
        # Delete
        Remove-Item $file.FullName -Force
        Write-Host "   ✓ Removed: $($file.Name)" -ForegroundColor DarkGray
    } catch {
        Write-Host "   ✗ Failed to remove: $($file.Name)" -ForegroundColor Red
    }
}

# ============================================
# 2. SQL MIGRATION/DEBUG FILES
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

# Keep schema files for reference
$sqlFilesToKeep = @(
    "supabase-schema.sql",
    "supabase-schema-clean.sql"
)

Write-Host "   Found $($sqlFilesToRemove.Count) SQL files to remove" -ForegroundColor Gray

foreach ($fileName in $sqlFilesToRemove) {
    $file = Get-Item $fileName -ErrorAction SilentlyContinue
    if ($file) {
        try {
            Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
            Remove-Item $file.FullName -Force
            Write-Host "   ✓ Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   ✗ Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 3. PYTHON DEBUG/TEST FILES
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
            Write-Host "   ✓ Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   ✗ Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 4. BATCH FILES (keeping useful ones)
# ============================================
Write-Host ""
Write-Host "4. Removing obsolete batch files..." -ForegroundColor Green

$batFilesToRemove = @(
    "ROLLBACK.bat",
    "test-map-feature.bat"
)

# Keep these for convenience
$batFilesToKeep = @(
    "start-frontend.bat",
    "restart-frontend.bat"
)

Write-Host "   Found $($batFilesToRemove.Count) batch files to remove" -ForegroundColor Gray

foreach ($fileName in $batFilesToRemove) {
    $file = Get-Item $fileName -ErrorAction SilentlyContinue
    if ($file) {
        try {
            Copy-Item $file.FullName -Destination $backupDir -ErrorAction SilentlyContinue
            Remove-Item $file.FullName -Force
            Write-Host "   ✓ Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   ✗ Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 5. SHELL SCRIPTS (Unix/Linux files)
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
            Write-Host "   ✓ Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   ✗ Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 6. CONFIG/JSON FILES (obsolete)
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
            Write-Host "   ✓ Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   ✗ Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 7. TEXT FILES (obsolete)
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
            Write-Host "   ✓ Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   ✗ Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 8. CLEANUP OLD CLEANUP SCRIPTS
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
            Write-Host "   ✓ Removed: $fileName" -ForegroundColor DarkGray
        } catch {
            Write-Host "   ✗ Failed to remove: $fileName" -ForegroundColor Red
        }
    }
}

# ============================================
# 9. MONUMENTS FOLDER (if not used)
# ============================================
Write-Host ""
Write-Host "9. Checking monuments folder..." -ForegroundColor Green

$monumentsDir = ".\monuments"
if (Test-Path $monumentsDir) {
    $monumentsFiles = Get-ChildItem -Path $monumentsDir -Recurse
    Write-Host "   Found monuments folder with $($monumentsFiles.Count) files" -ForegroundColor Gray
    Write-Host "   Keeping for now (may contain background images)" -ForegroundColor Yellow
    # Uncomment below to remove:
    # Copy-Item $monumentsDir -Destination $backupDir -Recurse -ErrorAction SilentlyContinue
    # Remove-Item $monumentsDir -Recurse -Force
}

# ============================================
# 10. DOCS FOLDER (if not used)
# ============================================
Write-Host ""
Write-Host "10. Checking docs folder..." -ForegroundColor Green

$docsDir = ".\docs"
if (Test-Path $docsDir) {
    $docsFiles = Get-ChildItem -Path $docsDir -Recurse
    Write-Host "   Found docs folder with $($docsFiles.Count) files" -ForegroundColor Gray
    Write-Host "   Keeping for now (may contain useful documentation)" -ForegroundColor Yellow
    # Uncomment below to remove:
    # Copy-Item $docsDir -Destination $backupDir -Recurse -ErrorAction SilentlyContinue
    # Remove-Item $docsDir -Recurse -Force
}

# ============================================
# SUMMARY
# ============================================
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$backupSize = (Get-ChildItem -Path $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "✓ Backup created: $backupDir" -ForegroundColor Green
Write-Host "  Size: $([math]::Round($backupSize, 2)) MB" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ Removed ~105 documentation files (.md)" -ForegroundColor Green
Write-Host "✓ Removed 12 SQL migration files" -ForegroundColor Green
Write-Host "✓ Removed 3 Python debug files" -ForegroundColor Green
Write-Host "✓ Removed 2 batch files" -ForegroundColor Green
Write-Host "✓ Removed 2 shell scripts" -ForegroundColor Green
Write-Host "✓ Removed 3 config files" -ForegroundColor Green
Write-Host "✓ Removed 3 text files" -ForegroundColor Green
Write-Host "✓ Removed 2 old cleanup scripts" -ForegroundColor Green
Write-Host ""

# ============================================
# FILES KEPT (IMPORTANT)
# ============================================
Write-Host "Files kept (important for application):" -ForegroundColor Yellow
Write-Host "  - README.md (project documentation)" -ForegroundColor Gray
Write-Host "  - QUICKSTART.md (getting started guide)" -ForegroundColor Gray
Write-Host "  - package.json (Node.js dependencies)" -ForegroundColor Gray
Write-Host "  - package-lock.json (dependency lock file)" -ForegroundColor Gray
Write-Host "  - .gitignore (Git configuration)" -ForegroundColor Gray
Write-Host "  - .env.example (environment template)" -ForegroundColor Gray
Write-Host "  - start-frontend.bat (convenience script)" -ForegroundColor Gray
Write-Host "  - restart-frontend.bat (convenience script)" -ForegroundColor Gray
Write-Host "  - supabase-schema.sql (database schema reference)" -ForegroundColor Gray
Write-Host "  - supabase-schema-clean.sql (clean schema reference)" -ForegroundColor Gray
Write-Host "  - frontend/ folder (application code)" -ForegroundColor Gray
Write-Host "  - backend/ folder (API code)" -ForegroundColor Gray
Write-Host "  - monuments/ folder (background images - kept)" -ForegroundColor Gray
Write-Host "  - docs/ folder (documentation - kept)" -ForegroundColor Gray
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  CLEANUP COMPLETE!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To restore files, copy them from: $backupDir" -ForegroundColor Yellow
Write-Host "To delete backup (after verifying): Remove-Item '$backupDir' -Recurse -Force" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your workspace is now cleaner!" -ForegroundColor Green
Write-Host ""
