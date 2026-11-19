#!/bin/sh
# Portfolio Search Index Reconciler & Auto-Sync
# Runs periodically (via cron) on Alpine NUC to ensure search-index.json & knowledge-map.json never drift

REPO_DIR="/home/avanek/agy-work/portfolio"
LOG_FILE="/home/avanek/.cache/portfolio-search-reconcile.log"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    if [ $(wc -l < "$LOG_FILE" 2>/dev/null || echo 0) -gt 250 ]; then
        tail -n 200 "$LOG_FILE" > "$LOG_FILE.tmp" 2>/dev/null && mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi
}

cd "$REPO_DIR" || {
    log "ERROR: Cannot cd to $REPO_DIR"
    exit 1
}

INDEX_FILE="$REPO_DIR/data/search-index.json"
MAP_FILE="$REPO_DIR/data/knowledge-map.json"
INDEXER="$REPO_DIR/scripts/build-search-index.py"
MAPPER="$REPO_DIR/scripts/build-knowledge-graph.py"

# 1. Safety check: Check if working tree has untracked or modified files (other than index/map json)
DIRTY_FILES=$(git status --porcelain | grep -v 'data/search-index.json' | grep -v 'data/knowledge-map.json' | tr -d ' ')
if [ -n "$DIRTY_FILES" ]; then
    log "Working tree has active uncommitted edits; yielding to avoid conflicts."
    exit 0
fi

# 2. Check if search-index.json or knowledge-map.json is missing or older than projects.html
NEEDS_REBUILD=0
if [ ! -f "$INDEX_FILE" ] || [ ! -f "$MAP_FILE" ]; then
    NEEDS_REBUILD=1
else
    NEWER=$(find "$REPO_DIR" -maxdepth 1 -name "*.html" -newer "$INDEX_FILE" 2>/dev/null)
    if [ -n "$NEWER" ]; then
        NEEDS_REBUILD=1
    fi
fi

if [ "$NEEDS_REBUILD" -eq 0 ]; then
    exit 0
fi

log "Outdated search index or knowledge map detected. Running indexer and mapper..."
python3 "$INDEXER" >> "$LOG_FILE" 2>&1
python3 "$MAPPER" >> "$LOG_FILE" 2>&1

STATUS=$(git status --porcelain data/search-index.json data/knowledge-map.json)
if [ -z "$STATUS" ]; then
    log "Rebuilt; no semantic changes to commit."
    exit 0
fi

# 4. Commit and push cleanly
git add data/search-index.json data/knowledge-map.json
git commit -m "Auto-refresh search index & 3D knowledge map [skip ci]" >> "$LOG_FILE" 2>&1
if [ $? -eq 0 ]; then
    git push origin master >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "Successfully committed and pushed updated search index & knowledge map to origin/master."
    else
        log "WARN: git push failed. Wi-Fi/network might be temporarily offline."
    fi
fi

exit 0
