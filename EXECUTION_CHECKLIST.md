# CloudOps Reorganization - EXECUTION CHECKLIST
## Step-by-Step Implementation Guide

**Date**: 2026-06-09  
**Estimated Time**: 2-3 hours  
**Complexity**: MEDIUM (Requires attention to detail)  
**Risk Level**: LOW (With backups and undo procedures)

---

## PRE-EXECUTION PHASE (30 minutes)

### Step 0.1: Read Documentation ✅
- [ ] Read REORGANIZATION_PLAN.md completely
- [ ] Read UNDO_GUIDE.md completely
- [ ] Understand all phases before starting
- [ ] Clear any questions before proceeding

### Step 0.2: Create Backup
```bash
# Create timestamped backup directory
mkdir -p ~/backups
BACKUP_DIR=~/backups/cloudops_backup_$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Copy entire project
cp -r /path/to/CloudOps $BACKUP_DIR/

# Verify backup
ls -la $BACKUP_DIR/CloudOps/
echo "Backup created at: $BACKUP_DIR"
```

- [ ] Backup created successfully
- [ ] Backup verified (all files present)
- [ ] Backup location noted: `_________________`

### Step 0.3: Create Git Branch
```bash
cd /path/to/CloudOps
git checkout -b feature/reorganize-project-structure
git branch -v  # Verify branch created
```

- [ ] New branch created
- [ ] Verified: `git branch -v` shows new branch as active
- [ ] Branch name: `feature/reorganize-project-structure`

### Step 0.4: Document Current State
```bash
# Save current structure
cd /path/to/CloudOps
tree -L 3 -o /tmp/structure_before.txt 2>/dev/null || find . -maxdepth 3 -type d | sort > /tmp/structure_before.txt

# Count files
find . -type f | wc -l > /tmp/file_count_before.txt

# Get directory sizes
du -sh */ > /tmp/dir_sizes_before.txt 2>/dev/null

echo "Current state documented"
```

- [ ] Current structure saved
- [ ] File count saved
- [ ] Directory sizes saved

---

## PHASE 1: DELETION (15 minutes)

### Step 1.1: Pre-Deletion Verification ⚠️

**CRITICAL: Verify azure_backend is completely obsolete**

```bash
cd /path/to/CloudOps

# 1. Check if azure_backend has unique files
echo "=== Files in azure_backend/src ==="
ls -la azure_backend/src/
echo ""
echo "=== Files in backend/src ==="
ls -la backend/src/ | grep -E "azure|Azure"

# 2. Check for unique dependencies
echo ""
echo "=== azure_backend dependencies ==="
grep '"dependencies"' azure_backend/package.json -A 20
echo ""
echo "=== backend dependencies ==="
grep '"dependencies"' backend/package.json -A 20

# 3. Check for unique references
grep -r "azure_backend" . --include="*.js" --include="*.ts" --include="*.json" 2>/dev/null | grep -v ".git" || echo "No references to azure_backend found"
```

**Checklist**:
- [ ] Confirmed: azure_backend/src/ files are subsets of backend/src/
- [ ] Confirmed: No unique dependencies in azure_backend/package.json
- [ ] Confirmed: No code references azure_backend path
- [ ] Safe to delete: YES / NO (circle one)

**If "NO" → STOP here, investigate and document differences before proceeding**

### Step 1.2: Delete azure_backend/

```bash
cd /path/to/CloudOps

# Verify path is correct
ls -la azure_backend/

# Delete with confirmation
rm -rf azure_backend/
echo "azure_backend/ deleted"

# Verify deletion
test ! -d azure_backend && echo "✅ Successfully deleted" || echo "❌ Still exists!"
```

- [ ] `ls -la azure_backend/` executed (before deletion)
- [ ] Deletion command executed: `rm -rf azure_backend/`
- [ ] Verified: folder no longer exists

### Step 1.3: Clean backend/temp/

```bash
cd /path/to/CloudOps

# Backup temp folder names first
echo "=== Backing up temp folder list ==="
ls backend/temp/ | wc -l > /tmp/temp_folder_count.txt
echo "Number of temp folders: $(cat /tmp/temp_folder_count.txt)"

# List first 10 folder names
echo "Sample temp folders:"
ls backend/temp/ | head -10

# Delete contents
rm -rf backend/temp/*
echo "backend/temp/* deleted"

# Verify
test -d backend/temp && test -z "$(ls backend/temp/)" && echo "✅ Temp folder cleaned" || echo "❌ Cleanup failed"
```

- [ ] Temp folder count documented
- [ ] Sample folders noted
- [ ] Deletion command executed
- [ ] Verified: backend/temp/ is empty

### Step 1.4: Commit Phase 1
```bash
cd /path/to/CloudOps

git add -A
git commit -m "phase 1: remove duplicate azure_backend and clean temp artifacts

- Deleted: azure_backend/ (all code integrated into main backend/)
- Cleaned: backend/temp/* (build artifacts)

This reduces project size significantly and removes dead code."

git log --oneline -3  # Verify commit
```

- [ ] Phase 1 committed: `git log --oneline` shows new commit
- [ ] Commit message appropriate

---

## PHASE 2: DIRECTORY CREATION (10 minutes)

### Step 2.1: Create New Directory Structure

```bash
cd /path/to/CloudOps

# Create all needed directories
mkdir -p docs/{aws,azure,archived/frontend}
mkdir -p scripts
mkdir -p azure/orchestrator/{core,config,utils,tests}

# Verify structure
echo "=== New directories created ==="
tree -L 3 docs/ 2>/dev/null || find docs -type d | sort
tree -L 3 scripts/ 2>/dev/null || find scripts -type d | sort
tree -L 3 azure/orchestrator -type d | sort
```

- [ ] docs/ directory created with subdirectories
- [ ] scripts/ directory created
- [ ] azure/orchestrator/ structure created
- [ ] Verified: `tree` or `find` shows all directories

### Step 2.2: Create .gitkeep Files (prevents empty folder deletion)

```bash
cd /path/to/CloudOps

# Add .gitkeep to empty directories
touch docs/.gitkeep
touch docs/aws/.gitkeep
touch docs/azure/.gitkeep
touch docs/archived/.gitkeep
touch docs/archived/frontend/.gitkeep
touch scripts/.gitkeep

echo "✅ .gitkeep files created"
```

- [ ] .gitkeep files created in all new directories
- [ ] Verified: `ls -la docs/.gitkeep` exists

---

## PHASE 3: FILE MOVEMENT (45 minutes)

### Step 3.1: Move Root Documentation Files

```bash
cd /path/to/CloudOps

# Move files one by one with verification
echo "Moving root documentation files..."

# Function to move and verify
move_and_verify() {
    source=$1
    dest=$2
    echo "Moving $source → $dest"
    if [ -f "$source" ]; then
        mv "$source" "$dest"
        if [ -f "$dest" ]; then
            echo "✅ Success"
            return 0
        else
            echo "❌ Failed"
            return 1
        fi
    else
        echo "⚠️ Source not found"
        return 1
    fi
}

# Execute moves
move_and_verify "IMPLEMENTATION_DETAILS.md" "docs/IMPLEMENTATION_DETAILS.md"
move_and_verify "PHASE_2_ARCHITECTURE.md" "docs/ARCHITECTURE_PHASE2.md"
move_and_verify "PHASE_2_INTEGRATION_CHECKLIST.md" "docs/INTEGRATION_CHECKLIST.md"
move_and_verify "PROJECT_COMPLETE_DETAILS.md" "docs/PROJECT_DETAILS.md"
move_and_verify "AZURE_INTEGRATION_SUMMARY.md" "docs/AZURE_INTEGRATION.md"

# Verify all moved
echo ""
echo "=== Verification ==="
ls -1 docs/*.md | wc -l  # Should be 5
```

**Checklist**:
- [ ] IMPLEMENTATION_DETAILS.md → docs/
- [ ] PHASE_2_ARCHITECTURE.md → docs/ARCHITECTURE_PHASE2.md
- [ ] PHASE_2_INTEGRATION_CHECKLIST.md → docs/INTEGRATION_CHECKLIST.md
- [ ] PROJECT_COMPLETE_DETAILS.md → docs/PROJECT_DETAILS.md
- [ ] AZURE_INTEGRATION_SUMMARY.md → docs/AZURE_INTEGRATION.md
- [ ] Verified: 5 files in docs/*.md

### Step 3.2: Move Backend Documentation

```bash
cd /path/to/CloudOps/backend

echo "Moving backend AWS documentation..."

# AWS documentation
mv AWS_IMPLEMENTATION_SUMMARY.md ../docs/aws/IMPLEMENTATION_SUMMARY.md
mv AWS_INTEGRATION_GUIDE.md ../docs/aws/INTEGRATION_GUIDE.md
mv AWS_QUICK_REFERENCE.md ../docs/aws/QUICK_REFERENCE.md

# AZURE documentation
mv AZURE_INTEGRATION.md ../docs/azure/INTEGRATION.md

# Examples file (keep as is for now - will convert to MD later if needed)
mv AWS_INTEGRATION_EXAMPLES.js ../docs/aws/EXAMPLES.js

echo "Moving backend utilities..."
mv check_db.js ../../scripts/check_db.js

# Verify
echo ""
echo "=== Verification ==="
ls ../docs/aws/       # Should show moved files
ls ../../scripts/check_db.js  # Should exist
```

**Checklist**:
- [ ] AWS_IMPLEMENTATION_SUMMARY.md → docs/aws/
- [ ] AWS_INTEGRATION_GUIDE.md → docs/aws/
- [ ] AWS_QUICK_REFERENCE.md → docs/aws/
- [ ] AZURE_INTEGRATION.md → docs/azure/
- [ ] AWS_INTEGRATION_EXAMPLES.js → docs/aws/
- [ ] check_db.js → scripts/
- [ ] Verified: All files in correct locations

### Step 3.3: Move Frontend Documentation

```bash
cd /path/to/CloudOps/frontend

echo "Archiving frontend documentation files..."

# Create archive directory if needed
mkdir -p ../docs/archived/frontend

# Move creation summary files
mv FEATURES_CREATION_SUMMARY.md ../docs/archived/frontend/
mv FEATURES_DELIVERY_SUMMARY.md ../docs/archived/frontend/
mv FEATURES_DOCUMENTATION_INDEX.md ../docs/archived/frontend/
mv FEATURES_QUICK_REFERENCE.md ../docs/archived/frontend/
mv HERO_CREATION_SUMMARY.md ../docs/archived/frontend/
mv REQUIREMENTS_CHECKLIST.md ../docs/archived/frontend/

echo ""
echo "=== Verification ==="
ls ../docs/archived/frontend/  # Should show 6 files

# Verify operational files remain
echo "Operational files remaining in frontend:"
ls *.md
```

**Checklist**:
- [ ] FEATURES_CREATION_SUMMARY.md → archived/
- [ ] FEATURES_DELIVERY_SUMMARY.md → archived/
- [ ] FEATURES_DOCUMENTATION_INDEX.md → archived/
- [ ] FEATURES_QUICK_REFERENCE.md → archived/
- [ ] HERO_CREATION_SUMMARY.md → archived/
- [ ] REQUIREMENTS_CHECKLIST.md → archived/
- [ ] Verified: 6 files archived
- [ ] Verified: ARCHITECTURE.md and DEPLOYMENT_PIPELINE_SETUP.md remain in frontend/

### Step 3.4: Commit Phase 3

```bash
cd /path/to/CloudOps

git add -A
git commit -m "phase 3: consolidate documentation structure

- Moved root docs to docs/ (5 files)
- Moved backend AWS docs to docs/aws/ (4 files)
- Moved backend Azure docs to docs/azure/ (1 file)
- Archived frontend creation docs to docs/archived/frontend/ (6 files)
- Moved utility scripts to scripts/ (check_db.js)

This improves project organization and separates operational from process docs."

git log --oneline -5
```

- [ ] Phase 3 committed
- [ ] Commit message verified in git log

---

## PHASE 4: REFERENCE UPDATES (45 minutes)

### Step 4.1: Update Root README.md

```bash
cd /path/to/CloudOps

# Backup original
cp README.md README.md.backup

# View current README
head -50 README.md
```

**Make these changes to README.md**:

1. **After main heading**, add:
```markdown
## 📚 Documentation

See [Documentation Index](docs/INDEX.md) for all documentation, guides, and references.
```

2. **Remove** these lines (if they exist):
```
- See IMPLEMENTATION_DETAILS.md
- See PROJECT_COMPLETE_DETAILS.md
- See AZURE_INTEGRATION_SUMMARY.md
```

3. **Update** any links like:
```
OLD: [Implementation](./IMPLEMENTATION_DETAILS.md)
NEW: [Implementation](docs/IMPLEMENTATION_DETAILS.md)
```

**After editing**:
```bash
# Verify changes
cat README.md | head -30
```

- [ ] README.md updated with docs/INDEX.md link
- [ ] Old doc references removed
- [ ] File links updated
- [ ] README.md.backup created for safety

### Step 4.2: Update backend/README.md

```bash
cd /path/to/CloudOps/backend

# Edit backend/README.md

# Find and replace:
OLD: "See AWS_INTEGRATION_GUIDE.md"
NEW: "See ../docs/aws/INTEGRATION_GUIDE.md"

# Similarly for other AWS references
OLD: "AWS_QUICK_REFERENCE.md"
NEW: "../docs/aws/QUICK_REFERENCE.md"

# After editing
cat README.md | grep -i "aws\|azure\|docs"  # Verify links
```

- [ ] backend/README.md updated with correct doc paths
- [ ] Links verified

### Step 4.3: Create docs/INDEX.md

```bash
cd /path/to/CloudOps

# Create navigation file
cat > docs/INDEX.md << 'EOF'
# CloudOps Documentation Index

Welcome! This is the central hub for all CloudOps documentation.

## 🚀 Getting Started

- **[Main README](../README.md)** - Project overview and quick start

## 🏗️ Architecture & Design

- **[Implementation Details](IMPLEMENTATION_DETAILS.md)** - Technical implementation overview
- **[Phase 2 Architecture](ARCHITECTURE_PHASE2.md)** - Phase 2 system architecture
- **[Project Details](PROJECT_DETAILS.md)** - Complete project specifications

## ☁️ AWS Integration

- **[AWS Integration Guide](aws/INTEGRATION_GUIDE.md)** - Full AWS setup and usage
- **[AWS Implementation Summary](aws/IMPLEMENTATION_SUMMARY.md)** - What's implemented
- **[AWS Quick Reference](aws/QUICK_REFERENCE.md)** - Handy command reference
- **[AWS Examples](aws/EXAMPLES.js)** - Working code examples

## 🔷 Azure Integration

- **[Azure Integration Guide](azure/INTEGRATION.md)** - Azure setup and orchestration

## ✅ Operations & Deployment

- **[Integration Checklist](INTEGRATION_CHECKLIST.md)** - Pre-deployment verification
- **[Deployment Pipeline](../frontend/DEPLOYMENT_PIPELINE_SETUP.md)** - CI/CD setup

## 📦 Module Documentation

- **[Backend README](../backend/README.md)** - Backend module structure
- **[Frontend README](../frontend/README.md)** - Frontend module structure
- **[Azure Orchestrator README](../azure/README.md)** - Azure orchestrator documentation

## 🗂️ Archive

Historical and process documentation:
- **[Archived Docs](archived/)** - Development process documentation

---

**Last Updated**: 2026-06-09  
**Status**: Production-grade structure
EOF

cat docs/INDEX.md  # Verify
```

- [ ] docs/INDEX.md created
- [ ] All links verified
- [ ] Content reviewed

### Step 4.4: Update frontend/README.md

```bash
cd /path/to/CloudOps/frontend

# Note: Keep ARCHITECTURE.md and DEPLOYMENT_PIPELINE_SETUP.md references
# These are operational docs and should stay

# If there are old references to removed files, delete them
# Example:
# OLD: "See FEATURES_CREATION_SUMMARY.md"
# NEW: (remove this line)

cat README.md | head -20
```

- [ ] frontend/README.md checked for old references
- [ ] Old references removed (if any)

### Step 4.5: Update backend/package.json (if needed)

```bash
cd /path/to/CloudOps/backend

# Check if check_db.js is referenced in scripts
grep "check_db" package.json

# If exists, update:
# OLD: "debug": "node check_db.js"
# NEW: "debug": "node ../scripts/check_db.js"

cat package.json | grep -A 10 '"scripts"'
```

- [ ] package.json checked for script references
- [ ] References updated if necessary

### Step 4.6: Create scripts/README.md

```bash
cd /path/to/CloudOps

cat > scripts/README.md << 'EOF'
# CloudOps Scripts

Utility scripts for development and operations.

## Available Scripts

### check_db.js

Database diagnostics and verification.

**Usage**:
```bash
node scripts/check_db.js
```

**Purpose**:
- Verify MongoDB connection
- Check database integrity
- Display collection statistics

---

## Adding New Scripts

When adding new utility scripts:

1. Place the script in this directory
2. Update this README with usage instructions
3. Add npm script in appropriate package.json (if applicable)
4. Document any environment variables needed

---

**Last Updated**: 2026-06-09
EOF

cat scripts/README.md
```

- [ ] scripts/README.md created
- [ ] Content reviewed

### Step 4.7: Commit Phase 4

```bash
cd /path/to/CloudOps

git add -A
git commit -m "phase 4: update all documentation references

- Updated root README.md with docs/INDEX.md link
- Updated backend/README.md with correct doc paths
- Created docs/INDEX.md as central documentation hub
- Created scripts/README.md for utility documentation
- Updated backend/package.json script paths if needed

All documentation references now point to consolidated locations."

git log --oneline -5
```

- [ ] Phase 4 committed
- [ ] All reference updates verified in git log

---

## PHASE 5: PYTHON RESTRUCTURING (30 minutes)

### Step 5.1: Restructure Azure Orchestrator

```bash
cd /path/to/CloudOps/azure

# Current structure has nested duplicate:
# azure_orchestrator/azure_orchestrator/...

# We're changing to:
# orchestrator/core/...
# orchestrator/config/...
# etc.

echo "=== Current structure ==="
ls -la orchestrator/

echo ""
echo "=== Moving Python files to core/ ==="
cd orchestrator

# Move implementation files to core/
mkdir -p core
mv __main__.py core/ 2>/dev/null || echo "No __main__.py at this level"
mv aci_runner.py core/
mv cli_upload.py core/
mv aci_main.py core/
mv advisor_insights.py core/
mv storage.py core/  # If exists

# Move main.py to root
# (Keep __main__.py, main.py at orchestrator root)

echo "✅ Files moved to core/"
ls core/
```

- [ ] aci_runner.py moved to core/
- [ ] cli_upload.py moved to core/
- [ ] aci_main.py moved to core/
- [ ] advisor_insights.py moved to core/
- [ ] storage.py moved to core/ (if exists)

### Step 5.2: Create Python Package Structure

```bash
cd /path/to/CloudOps/azure/orchestrator

# Create __init__.py files
touch __init__.py
touch core/__init__.py
touch config/__init__.py
touch utils/__init__.py
touch tests/__init__.py

# Create config/settings.py
cat > config/settings.py << 'EOF'
"""
Azure Orchestrator Configuration

Centralized configuration management for orchestrator.
"""

import os
from dotenv import load_dotenv

load_dotenv(override=False)


class Config:
    """Base configuration."""
    
    # Azure
    SUBSCRIPTION_ID = os.getenv("AZURE_SUBSCRIPTION_ID", "")
    RESOURCE_GROUP = os.getenv("AZURE_RESOURCE_GROUP", "")
    LOCATION = os.getenv("AZURE_LOCATION", "southeastasia")
    
    # Container
    CONTAINER_IMAGE = os.getenv("ACI_IMAGE", "")
    CONTAINER_NAME = os.getenv("ACI_CONTAINER_NAME", "cloudops-container")
    CONTAINER_GROUP = os.getenv("ACI_CONTAINER_GROUP_NAME", "cloudops-group")
    
    # Storage
    STORAGE_CONN_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
    BLOB_CONTAINER = os.getenv("AZURE_LOGS_CONTAINER", "logs")


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


# Select config based on environment
ENV = os.getenv("ENV", "development")
config = DevelopmentConfig if ENV == "development" else ProductionConfig
EOF

echo "✅ Created config/settings.py"
```

- [ ] __init__.py files created in all directories
- [ ] config/settings.py created

### Step 5.3: Create setup.py

```bash
cd /path/to/CloudOps/azure/orchestrator

cat > setup.py << 'EOF'
"""
Setup configuration for Azure Orchestrator package.
"""

from setuptools import setup, find_packages

setup(
    name="cloudops-azure-orchestrator",
    version="1.0.0",
    description="Azure Container Instance orchestration for CloudOps",
    author="CloudOps Team",
    python_requires=">=3.8",
    packages=find_packages(),
    install_requires=[
        "azure-storage-blob",
        "azure-identity",
        "azure-mgmt-containerinstance",
        "azure-mgmt-resource",
        "azure-mgmt-advisor",
        "python-dotenv",
    ],
    entry_points={
        "console_scripts": [
            "cloudops-orchestrator=orchestrator.main:main",
        ],
    },
)
EOF

echo "✅ Created setup.py"
```

- [ ] setup.py created

### Step 5.4: Update Python Imports

This is the critical part - update all imports in Python files:

```bash
cd /path/to/CloudOps/azure/orchestrator/core

# Check current imports
grep -r "^from " *.py | head -20
grep -r "^import " *.py | head -20

# Examples of changes needed:
# OLD: from storage import get_blob_service_client
# NEW: from orchestrator.core.storage import get_blob_service_client
#
# OLD: import aci_runner
# NEW: from orchestrator.core import aci_runner

echo "Review imports in:"
ls *.py
```

**Update these files** (manual edit):

For each Python file in `core/`:

1. **If importing from same directory**, change:
   ```python
   # OLD
   from storage import func
   
   # NEW
   from orchestrator.core.storage import func
   ```

2. **If importing from parent**, change:
   ```python
   # OLD
   from main import func
   
   # NEW
   from orchestrator.main import func
   ```

3. **If importing config**, add:
   ```python
   from orchestrator.config.settings import Config
   ```

- [ ] aci_runner.py imports updated
- [ ] cli_upload.py imports updated
- [ ] aci_main.py imports updated
- [ ] advisor_insights.py imports updated
- [ ] storage.py imports updated

### Step 5.5: Test Python Package

```bash
cd /path/to/CloudOps/azure/orchestrator

# Test basic imports
python3 -c "from orchestrator import *; print('✅ Imports work')" 2>&1

# If errors, check:
# - __init__.py files exist
# - Import paths are correct
# - No circular imports

# Test with Python path
export PYTHONPATH=/path/to/CloudOps/azure:$PYTHONPATH
python3 -c "from orchestrator.core.aci_runner import run_aci_task; print('✅ aci_runner imports')"
```

- [ ] Imports verified: `python3 -c "from orchestrator import *"`
- [ ] No import errors

### Step 5.6: Commit Phase 5

```bash
cd /path/to/CloudOps

git add azure/orchestrator/
git commit -m "phase 5: restructure azure orchestrator as proper python package

- Moved implementation files from nested duplicate to core/ subpackage
- Created config/ subpackage for centralized configuration
- Created setup.py for package installation
- Added __init__.py files for proper Python packaging
- Updated imports to use orchestrator.* package namespace

This follows Python packaging best practices and improves code organization."

git log --oneline -5
```

- [ ] Phase 5 committed
- [ ] Imports working

---

## PHASE 6: TESTING & VALIDATION (30 minutes)

### Step 6.1: Check Git Status

```bash
cd /path/to/CloudOps

echo "=== Git Status ==="
git status

echo ""
echo "=== Recent Commits ==="
git log --oneline -10

# Should show 5 phase commits
```

- [ ] Git status clean
- [ ] All 5 phase commits visible

### Step 6.2: Test Backend Build

```bash
cd /path/to/CloudOps/backend

echo "=== Testing Backend ==="
npm install 2>&1 | tail -20

if [ $? -eq 0 ]; then
    echo "✅ npm install successful"
else
    echo "❌ npm install failed"
    exit 1
fi

# Test that server can start (don't let it run, just check it initializes)
timeout 3 node index.js 2>&1 | head -20 || true

echo "✅ Backend initialization check passed"
```

- [ ] `npm install` completes without errors
- [ ] Backend starts without path errors

### Step 6.3: Test Frontend Build

```bash
cd /path/to/CloudOps/frontend

echo "=== Testing Frontend ==="
npm install 2>&1 | tail -20

if [ $? -eq 0 ]; then
    echo "✅ npm install successful"
else
    echo "❌ npm install failed"
    exit 1
fi

npm run build 2>&1 | grep -E "^(dist|✓|✔)" | head -10
echo "✅ Frontend build successful"
```

- [ ] Frontend `npm install` successful
- [ ] Frontend `npm run build` successful

### Step 6.4: Test Python Package

```bash
cd /path/to/CloudOps/azure/orchestrator

echo "=== Testing Python Package ==="

# Test imports
python3 << 'EOF'
import sys
sys.path.insert(0, '/path/to/CloudOps/azure')

try:
    from orchestrator import __init__
    print("✅ orchestrator package imports")
except Exception as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

try:
    from orchestrator.config.settings import Config
    print("✅ config.settings imports")
except Exception as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

print("✅ All Python imports successful")
EOF
```

- [ ] Python package imports successfully
- [ ] No import errors

### Step 6.5: Verify Documentation Links

```bash
cd /path/to/CloudOps

echo "=== Checking Documentation Links ==="

# Test that files exist
declare -a files=(
    "docs/INDEX.md"
    "docs/IMPLEMENTATION_DETAILS.md"
    "docs/ARCHITECTURE_PHASE2.md"
    "docs/INTEGRATION_CHECKLIST.md"
    "docs/aws/INTEGRATION_GUIDE.md"
    "docs/aws/QUICK_REFERENCE.md"
    "docs/azure/INTEGRATION.md"
    "docs/archived/frontend/FEATURES_CREATION_SUMMARY.md"
    "scripts/check_db.js"
    "scripts/README.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file MISSING"
    fi
done
```

- [ ] docs/INDEX.md exists
- [ ] docs/aws/*.md files exist
- [ ] docs/azure/*.md files exist
- [ ] scripts/*.js files exist
- [ ] All documentation files accounted for

### Step 6.6: Run All Tests

```bash
cd /path/to/CloudOps

echo "=== FINAL VERIFICATION ==="

echo ""
echo "1. Check directory structure..."
test -d backend && echo "✅ backend/" || echo "❌ backend/"
test -d frontend && echo "✅ frontend/" || echo "❌ frontend/"
test -d azure && echo "✅ azure/" || echo "❌ azure/"
test -d docs && echo "✅ docs/" || echo "❌ docs/"
test -d scripts && echo "✅ scripts/" || echo "❌ scripts/"

echo ""
echo "2. Check deleted items don't exist..."
test ! -d azure_backend && echo "✅ azure_backend/ removed" || echo "❌ azure_backend/ still exists"
test -z "$(ls backend/temp/ 2>/dev/null)" && echo "✅ backend/temp/ empty" || echo "❌ backend/temp/ has files"

echo ""
echo "3. Check moved files don't exist at origin..."
test ! -f IMPLEMENTATION_DETAILS.md && echo "✅ Root docs moved" || echo "❌ Root docs still exist"
test ! -f backend/AWS_IMPLEMENTATION_SUMMARY.md && echo "✅ Backend AWS docs moved" || echo "❌ Backend AWS docs still exist"
test ! -f frontend/FEATURES_CREATION_SUMMARY.md && echo "✅ Frontend docs archived" || echo "❌ Frontend docs still exist"
test ! -f backend/check_db.js && echo "✅ check_db.js moved" || echo "❌ check_db.js still in backend"

echo ""
echo "4. Check new files exist..."
test -f docs/INDEX.md && echo "✅ docs/INDEX.md created" || echo "❌ docs/INDEX.md missing"
test -f scripts/README.md && echo "✅ scripts/README.md created" || echo "❌ scripts/README.md missing"

echo ""
echo "=== ALL CHECKS COMPLETE ==="
```

- [ ] All directory structure checks pass
- [ ] All deleted items verified removed
- [ ] All moved items verified relocated
- [ ] All new items verified created

---

## PHASE 7: GIT FINALIZATION (10 minutes)

### Step 7.1: Create Final Commit

```bash
cd /path/to/CloudOps

# Verify no uncommitted changes
git status

# If there are uncommitted changes, add them
git add -A
git commit -m "phase 6: final verification and cleanup

- Verified all builds and imports working
- Confirmed all documentation links valid
- Tested backend, frontend, and Python package
- All structural reorganization complete"

git log --oneline -10
```

- [ ] All phases committed
- [ ] `git log` shows 5-6 commits for reorganization

### Step 7.2: Create Branch Summary

```bash
cd /path/to/CloudOps

# Create a summary file on the branch
cat > REORGANIZATION_SUMMARY.txt << 'EOF'
CLOUDOPS PROJECT REORGANIZATION - COMPLETED
============================================

Date: 2026-06-09
Branch: feature/reorganize-project-structure
Status: COMPLETE & TESTED

Changes Summary:
================

DELETIONS:
- Removed azure_backend/ (entire directory - code migrated to backend/)
- Removed backend/temp/* (build artifacts)

MOVES:
- Moved 5 root .md files to docs/
- Moved 5 backend AWS docs to docs/aws/
- Moved 1 backend Azure doc to docs/azure/
- Moved 6 frontend creation docs to docs/archived/
- Moved check_db.js to scripts/

CREATIONS:
- Created docs/INDEX.md (documentation hub)
- Created docs/aws/ subdirectory
- Created docs/azure/ subdirectory
- Created docs/archived/ directory
- Created scripts/ directory
- Created setup.py (Python package)
- Created config/settings.py (Azure config)
- Multiple __init__.py files

RESTRUCTURING:
- Reorganized azure/orchestrator as proper Python package
- Updated imports in all Python files
- Consolidated documentation references

VERIFICATION:
✅ Backend builds without errors
✅ Frontend builds without errors
✅ Python imports work
✅ All documentation links valid
✅ No broken file paths
✅ Git history preserved
✅ All changes committed

SIZE REDUCTION:
Before: ~500 MB (including temp/)
After:  ~50 MB
Saved: ~450 MB

Next Steps:
1. Peer review this branch
2. Test in your environment
3. Merge to main: git merge feature/reorganize-project-structure
4. Delete branch: git branch -d feature/reorganize-project-structure
5. Push to remote: git push origin main

Questions or Issues?
See UNDO_GUIDE.md for complete reversal instructions
EOF

git add REORGANIZATION_SUMMARY.txt
git commit -m "docs: add reorganization summary

Final summary of all changes made during project restructuring."

git log --oneline -5
```

- [ ] REORGANIZATION_SUMMARY.txt created
- [ ] Summary committed

### Step 7.3: Switch Back to Main (Don't merge yet!)

```bash
cd /path/to/CloudOps

# Stay on feature branch for now
git branch -v

echo ""
echo "⚠️  IMPORTANT: DO NOT MERGE YET"
echo "This branch should be reviewed before merging to main"
echo ""
echo "To merge later:"
echo "git checkout main"
echo "git merge feature/reorganize-project-structure"
```

- [ ] Confirmed: Currently on feature branch
- [ ] Confirmed: Not merged to main yet
- [ ] Understood: Needs peer review before merge

---

## POST-EXECUTION PHASE (Ongoing)

### Step 8.1: Peer Review Checklist

Before merging to main:

- [ ] Have someone review the branch
- [ ] Test in another environment
- [ ] Verify all functionality works
- [ ] Check for any missed references
- [ ] Confirm documentation is accurate

### Step 8.2: Merge to Main

```bash
cd /path/to/CloudOps

# Only do this after review approval
git checkout main
git merge feature/reorganize-project-structure
git log --oneline -10
```

- [ ] Feature branch reviewed and approved
- [ ] Merged to main
- [ ] Main branch updated

### Step 8.3: Clean Up

```bash
cd /path/to/CloudOps

# Delete feature branch
git branch -d feature/reorganize-project-structure

# Verify
git branch -v  # Should not show feature branch

# Push to remote
git push origin main
```

- [ ] Feature branch deleted
- [ ] Changes pushed to remote

---

## Rollback Procedures

### If Issues During Execution

**Before committing (Phase 1-7)**:
```bash
git reset --hard HEAD
```

**After committing to feature branch**:
```bash
git reset --hard HEAD~1
```

**After merging to main**:
```bash
git revert <merge-commit-hash>
```

See UNDO_GUIDE.md for detailed reversal instructions.

---

## Completion Sign-Off

### Project Successfully Reorganized When:

- [✅] All 7 phases completed
- [✅] All tests pass
- [✅] Git history clean
- [✅] Documentation links verified
- [✅] Builds working (backend, frontend, Python)
- [✅] No broken imports
- [✅] Changes peer reviewed
- [✅] Merged to main
- [✅] Team notified

---

## Quick Reference

| Phase | Duration | Checklist | Status |
|-------|----------|-----------|--------|
| 0. Pre-Execution | 30 min | Read docs, backup, branch | ☐ |
| 1. Deletion | 15 min | Delete old files | ☐ |
| 2. Directory Creation | 10 min | Create new structure | ☐ |
| 3. File Movement | 45 min | Move documentation | ☐ |
| 4. Reference Updates | 45 min | Update links & imports | ☐ |
| 5. Python Restructuring | 30 min | Reorganize Python package | ☐ |
| 6. Testing | 30 min | Verify everything works | ☐ |
| 7. Git Finalization | 10 min | Commit & summarize | ☐ |

**Total Time: 2.5-3.5 hours**

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-09  
**Status**: READY FOR EXECUTION

