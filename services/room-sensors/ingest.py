#!/usr/bin/env python3
"""Forced-command SSH receiver: accept only bounded, validated sensor JSON."""
import json
import os
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from snapshot import validate

TARGET = Path.home() / '.local/share/portfolio-room-sensors/latest.json'


def main():
    raw = sys.stdin.buffer.read(4097)
    if len(raw) > 4096:
        raise ValueError('Snapshot exceeds the byte limit')
    clean = validate(json.loads(raw))
    clean['received_at'] = datetime.now(timezone.utc).isoformat()
    TARGET.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    name = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=TARGET.parent,
                                         prefix='.incoming-', delete=False) as f:
            name = f.name
            json.dump(clean, f, separators=(',', ':'), allow_nan=False)
            f.flush()
            os.fsync(f.fileno())
        os.replace(name, TARGET)
        print('accepted')
    finally:
        if name and os.path.exists(name):
            os.unlink(name)


if __name__ == '__main__':
    try:
        main()
    except (ValueError, TypeError, KeyError, OSError):
        print('Snapshot rejected', file=sys.stderr)
        raise SystemExit(1)
