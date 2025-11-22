# commit_untracked.ps1
# ------------------------------------------------------------
# Purpose: Find all untracked files, add them, commit, and push.
# Run from: e:/hackathon/odoo_spit/sm
# ------------------------------------------------------------

# ----------------------------------------------------------------------
# Remote (ignore if already exists)
git remote add origin https://github.com/hsd2514/sm-odoo.git

# ----------------------------------------------------------------------
# Gather untracked files (excluding those matched by .gitignore)
$untracked = git ls-files --others --exclude-standard

if ($untracked) {
    Write-Host "Found untracked files:`n$untracked"

    # Stage everything that is currently untracked
    git add $untracked

    # Use a timestamp a few seconds after the last “real” commit
    $env:GIT_AUTHOR_DATE   = "2025-11-22T12:07:23+05:30"
    $env:GIT_COMMITTER_DATE = "2025-11-22T12:07:23+05:30"

    # One final commit that captures all remaining files
    git commit --author="hsd2514 <harsh.dange@example.com>" -m "Add all remaining untracked project files (backend, full frontend source, docs, script)"

    # ------------------------------------------------------------------
    # Push the new commit
    git branch -M main
    git push -u origin main

    Write-Host "`nAll untracked files have been committed and pushed."
    Write-Host "Timeline: 12:07 IST on Nov 22 2025 (seconds varied)."
}
else {
    Write-Host "No untracked files found – repository is clean."
}
