# Cleanup Unused Files - Summary

## 📋 Overview

This document lists all the files that will be removed from the project root directory. These files are documentation, migration scripts, debug files, and other temporary files that are not needed for the application to run.

---

## 🗑️ Files to be Removed

### 1. Documentation Files (~105 .md files)

**Keeping:**
- README.md (main project documentation)
- QUICKSTART.md (getting started guide)

**Removing:**
All other .md files including:
- SELECT_CITY_VISUAL_GUIDE.md
- LOGIN_BUTTON_STYLING_UPDATE.md
- PROPERTY_IMAGES_LOADING_FIX.md
- MOBILE_*.md (mobile UI documentation)
- ADMIN_*.md (admin system documentation)
- MAP_*.md (map feature documentation)
- DROPDOWN_*.md (dropdown fix documentation)
- And ~95 more documentation files...

### 2. SQL Files (12 files)

**Keeping:**
- supabase-schema.sql (database schema reference)
- supabase-schema-clean.sql (clean schema reference)

**Removing:**
- add_property_type_to_reviews.sql
- add_sample_photo_keys.sql
- check-enum-values.sql
- check_and_fix_photos.sql
- check_recent_photos.sql
- cleanup_invalid_photos.sql
- cleanup_sample_photos.sql
- debug_enum.sql
- fix_review_comment.sql
- migration-add-photo-support.sql
- migration_cities_localities.sql
- migration_property_type.sql

### 3. Python Debug Files (3 files)

**Removing:**
- diagnose_photos.py
- test_application.py
- test_r2_connection.py

### 4. Batch Files (2 files)

**Keeping:**
- start-frontend.bat (convenient startup)
- restart-frontend.bat (convenient restart)

**Removing:**
- ROLLBACK.bat
- test-map-feature.bat

### 5. Shell Scripts (2 files)

**Removing:**
- set_r2_cors.sh
- start-map-feature.sh

### 6. Config Files (3 files)

**Removing:**
- r2-cors-config.json
- r2-cors.json
- verify-migration.js

### 7. Text Files (3 files)

**Removing:**
- BACKEND_FIX.txt
- MAP_INTEGRATION_SUMMARY.txt
- QUICK_REFERENCE.txt

### 8. Old Cleanup Scripts (2 files)

**Removing:**
- cleanup-project.ps1
- cleanup-simple.ps1

---

## ✅ Files/Folders Being Kept

### Essential Files:
- ✅ README.md
- ✅ QUICKSTART.md
- ✅ package.json
- ✅ package-lock.json
- ✅ .gitignore
- ✅ .env.example
- ✅ start-frontend.bat
- ✅ restart-frontend.bat
- ✅ supabase-schema.sql
- ✅ supabase-schema-clean.sql

### Essential Folders:
- ✅ frontend/ (entire Next.js application)
- ✅ backend/ (entire FastAPI application)
- ✅ monuments/ (background images - kept for now)
- ✅ docs/ (documentation folder - kept for now)
- ✅ .git/ (version control)
- ✅ .github/ (GitHub actions/workflows)
- ✅ .vscode/ (VS Code settings)
- ✅ .venv/ (Python virtual environment)
- ✅ node_modules/ (Node.js dependencies)

---

## 📊 Cleanup Impact

### Before Cleanup:
- **Total files in root**: ~140 files
- **Documentation files**: 107 .md files
- **SQL files**: 14 files
- **Debug files**: 3 Python files
- **Scripts**: 6 batch/shell files
- **Config files**: 3 JSON/JS files

### After Cleanup:
- **Total files in root**: ~10 essential files
- **Documentation files**: 2 .md files (README, QUICKSTART)
- **SQL files**: 2 schema files (reference only)
- **Scripts**: 2 batch files (convenience)
- **Config files**: 1 (package.json)

### Space Saved:
- Estimated: ~3-5 MB of documentation and scripts
- Cleaner workspace structure
- Easier to navigate project

---

## 🔒 Safety Features

### Backup System:
- All deleted files are backed up to `BACKUP_YYYYMMDD_HHMMSS/`
- Backup is created before any deletion
- Can restore individual files or entire backup

### Restore Process:
```powershell
# To restore all files
Copy-Item "BACKUP_20250105_123456\*" -Destination . -Force

# To restore specific file
Copy-Item "BACKUP_20250105_123456\SELECT_CITY_VISUAL_GUIDE.md" -Destination . -Force
```

### Delete Backup (after verification):
```powershell
Remove-Item "BACKUP_20250105_123456" -Recurse -Force
```

---

## 🚀 How to Run Cleanup

### Step 1: Review this document
Make sure you understand what will be removed.

### Step 2: Run the cleanup script
```powershell
.\CLEANUP_UNUSED_FILES.ps1
```

### Step 3: Verify the application still works
```powershell
# Test frontend
cd frontend
npm run dev

# Test backend
cd ..\backend
python main.py
```

### Step 4: Delete backup (optional)
If everything works, delete the backup folder:
```powershell
Remove-Item "BACKUP_*" -Recurse -Force
```

---

## ⚠️ Important Notes

### What This Does NOT Remove:
- ❌ Application code (frontend/, backend/)
- ❌ Dependencies (node_modules/, .venv/)
- ❌ Version control (.git/)
- ❌ Environment configs (.env files if they exist)
- ❌ Essential documentation (README.md, QUICKSTART.md)

### What This DOES Remove:
- ✅ Development documentation (~105 .md files)
- ✅ SQL migration scripts (already applied)
- ✅ Debug/test Python scripts
- ✅ Obsolete batch/shell scripts
- ✅ Old config files
- ✅ Text notes and summaries

---

## 🎯 Benefits

### For Development:
- **Cleaner workspace**: Easier to find important files
- **Faster navigation**: Less clutter in file explorer
- **Better Git**: Smaller repository, faster operations
- **Reduced confusion**: Only essential files visible

### For New Developers:
- **Clear structure**: Immediately see what matters
- **Less overwhelming**: Not buried in documentation
- **Faster onboarding**: Focus on code, not old docs
- **Better understanding**: Clear project structure

---

## 📝 Post-Cleanup Checklist

After running the cleanup, verify:

- [ ] Frontend starts successfully (`npm run dev`)
- [ ] Backend starts successfully (`python main.py`)
- [ ] All pages load correctly
- [ ] Images display properly
- [ ] API calls work
- [ ] Database connections work
- [ ] No console errors
- [ ] All features functional

If any issues occur, restore from backup and investigate.

---

## 🔄 Future Maintenance

### Keep Documentation Under Control:
- Use a separate `docs/` folder for detailed documentation
- Keep only essential .md files in root (README, QUICKSTART)
- Archive old documentation instead of deleting
- Use Git history for historical context

### Regular Cleanup:
- Run cleanup every few weeks/months
- Remove obsolete SQL scripts after migrations are done
- Delete debug files after debugging is complete
- Archive completed feature documentation

---

## 📞 Questions?

If you're unsure about deleting any file:
1. Check the backup folder first
2. Review this document
3. Run the application after cleanup
4. Restore from backup if needed

---

**Status**: ✅ Ready to execute cleanup

**Safety**: ✅ Backup system in place

**Reversible**: ✅ Can restore all files

**Impact**: ⭐ Cleaner, more maintainable workspace

---

**Run the cleanup script to proceed!**
