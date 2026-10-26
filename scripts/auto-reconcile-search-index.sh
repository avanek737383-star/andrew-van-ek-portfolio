#!/bin/sh
# Portfolio Search Index Reconciler & Auto-Sync
# Runs periodically (via cron) on Alpine NUC to ensure search-index.json never drifts

REPO_DIR="/home/avanek/agy-work/portfolio"
LOG_FILE="/home/avanek/.cache/portfolio-search-reconcile.log"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    # Keep log file bounded to last 200 lines
    if [ $(wc -l < "$LOG_FILE" 2>/dev/null || echo 0) -gt 250 ]; then
        tail -n 200 "$LOG_FILE" > "$LOG_FILE.tmp" 2>/dev/null && mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi
}

cd "$REPO_DIR" || {
    log "ERROR: Cannot cd to $REPO_DIR"
    exit 1
}

INDEX_FILE="$REPO_DIR/data/search-index.json"
INDEXER="$REPO_DIR/scripts/build-search-index.py"

# 1. Safety check: Check if working tree has untracked or modified files (other than search-index.json)
DIRTY_FILES=$(git status --porcelain | grep -v 'data/search-index.json' | tr -d ' ')
if [ -n "$DIRTY_FILES" ]; then
    log "Working tree has active uncommitted edits; yielding to avoid conflicts."
    exit 0
fi

# 2. Check if search-index.json is missing or older than any HTML file
NEEDS_REBUILD=0
if [ ! -f "$INDEX_FILE" ]; then
    NEEDS_REBUILD=1
else
    # Find any .html file modified after the index file
    NEWER=$(find "$REPO_DIR" -maxdepth 1 -name "*.html" -newer "$INDEX_FILE" 2>/dev/null)
    if [ -n "$NEWER" ]; then
        NEEDS_REBUILD=1
    fi
fi

if [ "$NEEDS_REBUILD" -eq 0 ]; then
    exit 0
fi

log "Outdated search index detected. Running build-search-index.py..."
python3 "$INDEXER" >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    log "ERROR: build-search-index.py failed."
    exit 1
fi

# 3. Check if search-index.json was actually modified
STATUS=$(git status --porcelain data/search-index.json)
if [ -z "$STATUS" ]; then
    log "Index rebuilt; no semantic changes to commit."
    exit 0
fi

# 4. Commit and push cleanly
git add data/search-index.json
git commit -m "Auto-refresh search index [skip ci]" >> "$LOG_FILE" 2>&1
if [ $? -eq 0 ]; then
    git push origin master >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "Successfully committed and pushed updated search-index.json to origin/master."
    else
        log "WARN: git push failed. Wi-Fi/network might be temporarily offline."
    fi
fi

exit 0
