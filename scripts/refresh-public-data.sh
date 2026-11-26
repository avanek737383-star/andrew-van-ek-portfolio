#!/bin/sh
# Called from the owner's cron. Refuses to race with active edits or an old branch.
set -eu
REPO_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$REPO_DIR"
LOCK="$REPO_DIR/.git/portfolio-public-data.lock"
mkdir "$LOCK" 2>/dev/null || exit 0
trap 'rmdir "$LOCK"' EXIT INT TERM
test -z "$(git status --porcelain)" || exit 0
git fetch --quiet origin master
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/master)" || exit 0
LAST_STATE="$REPO_DIR/.git/portfolio-public-data-state"
LAST_HEAD=""
test ! -f "$LAST_STATE" || LAST_HEAD=$(cat "$LAST_STATE")
CURRENT_HEAD=$(git rev-parse HEAD)
RELEASE_DUE=$(python3 -c 'import json,datetime,pathlib; p=pathlib.Path("data/releases.json"); d=json.loads(p.read_text()) if p.exists() else {}; t=d.get("lastAttemptAt"); print(1 if not t or (datetime.datetime.now(datetime.timezone.utc)-datetime.datetime.fromisoformat(t)).total_seconds()>86400 else 0)')
if [ "$LAST_HEAD" = "$CURRENT_HEAD" ] && [ "$RELEASE_DUE" = "0" ]; then exit 0; fi
if [ "$RELEASE_DUE" = "1" ]; then python3 scripts/refresh-release-data.py; fi
python3 scripts/build-changelog-data.py
git diff --quiet -- data/releases.json data/changelog.json && exit 0
git add data/releases.json data/changelog.json
git commit -m "[data] Refresh primary-source release checks and Git snapshot [skip ci]"
git push origin master
git rev-parse HEAD > "$LAST_STATE"
