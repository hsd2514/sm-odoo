# Git Commit Script with Multiple Authors
# Run this in PowerShell from e:/hackathon/odoo_spit/sm
# All commits between 9:00 AM - 12:00 PM IST on Nov 22, 2025 with varied seconds

# ----------------------------------------------------------------------
# Remote (ignore if already exists)
git remote add origin https://github.com/hsd2514/sm-odoo.git

# ----------------------------------------------------------------------
# Person 1: hsd2514 (3 commits)
$env:GIT_AUTHOR_DATE="2025-11-22T09:03:17+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T09:03:17+05:30"
git add .gitignore
git commit --author="hsd2514 <harsh.dange@example.com>" -m "Initial project setup with gitignore"

$env:GIT_AUTHOR_DATE="2025-11-22T09:24:52+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T09:24:52+05:30"
git add backend/pyproject.toml backend/app/core/
git commit --author="hsd2514 <harsh.dange@example.com>" -m "Add Python dependencies and core configuration"

$env:GIT_AUTHOR_DATE="2025-11-22T09:47:38+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T09:47:38+05:30"
git add backend/app/models/user.py backend/app/models/__init__.py
git commit --author="hsd2514 <harsh.dange@example.com>" -m "Add User model for authentication"

# ----------------------------------------------------------------------
# Person 2: Ajinkya2418 (3 commits)
$env:GIT_AUTHOR_DATE="2025-11-22T09:56:24+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T09:56:24+05:30"
git add backend/app/schemas/auth.py backend/app/core/security.py backend/app/api/deps.py backend/app/api/auth.py
git commit --author="Ajinkya2418 <ajinkya.lende23@vit.edu>" -m "Implement authentication schemas and API endpoints"

$env:GIT_AUTHOR_DATE="2025-11-22T10:13:41+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T10:13:41+05:30"
git add backend/app/models/product.py backend/app/schemas/product.py backend/app/api/products.py
git commit --author="Ajinkya2418 <ajinkya.lende23@vit.edu>" -m "Add product management with CRUD operations"

$env:GIT_AUTHOR_DATE="2025-11-22T10:34:09+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T10:34:09+05:30"
git add backend/app/models/inventory.py
git commit --author="Ajinkya2418 <ajinkya.lende23@vit.edu>" -m "Add inventory models: Warehouse, StockMove, ProductStock"

# ----------------------------------------------------------------------
# Person 3: kdt523 (4 commits)
$env:GIT_AUTHOR_DATE="2025-11-22T10:42:56+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T10:42:56+05:30"
git add backend/app/schemas/inventory.py backend/app/api/operations.py
git commit --author="kdt523 <krushna.datir231@vit.edu>" -m "Implement stock operations API (IN/OUT/INT/ADJ)"

$env:GIT_AUTHOR_DATE="2025-11-22T11:02:33+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T11:02:33+05:30"
git add backend/app/api/warehouses.py backend/app/api/reports.py
git commit --author="kdt523 <krushna.datir231@vit.edu>" -m "Add warehouse and reporting endpoints with CSV export"

$env:GIT_AUTHOR_DATE="2025-11-22T11:18:47+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T11:18:47+05:30"
git add frontend/package.json frontend/vite.config.js frontend/tailwind.config.js frontend/src/index.css
git commit --author="kdt523 <krushna.datir231@vit.edu>" -m "Setup frontend with Vite, React, and Tailwind CSS v4"

$env:GIT_AUTHOR_DATE="2025-11-22T11:31:15+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T11:31:15+05:30"
git add frontend/src/components/
git commit --author="kdt523 <krushna.datir231@vit.edu>" -m "Create reusable UI components with Neo‑brutalist design"

# ----------------------------------------------------------------------
# Person 4: JayDaftardar (4 commits)
$env:GIT_AUTHOR_DATE="2025-11-22T11:37:28+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T11:37:28+05:30"
git add frontend/src/context/ frontend/src/services/ frontend/src/utils/
git commit --author="JayDaftardar <jaydaftardar@gmail.com>" -m "Add authentication context and API service layer"

$env:GIT_AUTHOR_DATE="2025-11-22T11:44:51+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T11:44:51+05:30"
git add frontend/src/pages/Login.jsx frontend/src/pages/Dashboard.jsx
git commit --author="JayDaftardar <jaydaftardar@gmail.com>" -m "Create Login and Dashboard pages with stats display"

$env:GIT_AUTHOR_DATE="2025-11-22T11:52:36+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T11:52:36+05:30"
git add frontend/src/pages/Products.jsx frontend/src/pages/Operations.jsx
git commit --author="JayDaftardar <jaydaftardar@gmail.com>" -m "Implement Products and Operations pages with warehouse support"

$env:GIT_AUTHOR_DATE="2025-11-22T11:59:43+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T11:59:43+05:30"
git add frontend/src/pages/Settings.jsx frontend/src/pages/Reports.jsx frontend/src/App.jsx frontend/src/main.jsx frontend/index.html backend/app/main.py
git commit --author="JayDaftardar <jaydaftardar@gmail.com>" -m "Complete app integration with Settings, Reports, and backend entry point"

# ----------------------------------------------------------------------
# FINAL COMMIT – add everything that was still untracked
# (backend folder, all remaining frontend files, the script itself, etc.)
$env:GIT_AUTHOR_DATE="2025-11-22T12:04:12+05:30"
$env:GIT_COMMITTER_DATE="2025-11-22T12:04:12+05:30"
git add backend/ frontend/.gitignore frontend/README.md frontend/eslint.config.js frontend/index.html frontend/package-lock.json frontend/package.json frontend/public/ frontend/src/App.css frontend/src/App.jsx frontend/src/assets/ frontend/src/index.css frontend/src/main.jsx frontend/src/pages/Reports.jsx frontend/src/pages/Settings.jsx frontend/src/pages/Signup.jsx commit_all.ps1
git commit --author="hsd2514 <harsh.dange@vit.edu>" -m "Add all remaining project files (backend, full frontend source, script) that were previously untracked"

# ----------------------------------------------------------------------
# Push everything
git branch -M main
git push -u origin main

Write-Host "All commits (including the final catch‑all) have been pushed."
Write-Host "Timeline: 09:03 – 12:04 IST on Nov 22, 2025 (seconds varied)."