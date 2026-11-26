"""Owner-authorized, in-place redaction of known website log files.

Retains non-address diagnostics and file permissions. Makes no raw-log backup.
Do not run against arbitrary filesystem trees.
"""
import argparse
import gzip
import os
from pathlib import Path
import tempfile
from ip_redaction import redact_ip

def sanitize(path):
    if path.is_symlink() or not path.is_file():
        return False
    is_gzip = path.suffix == '.gz'
    data = gzip.decompress(path.read_bytes()) if is_gzip else path.read_bytes()
    old = data.decode('utf-8', errors='replace')
    new = redact_ip(old)
    if old == new:
        return False
    payload = new.encode('utf-8')
    if is_gzip:
        payload = gzip.compress(payload, mtime=0)
    info = path.stat()
    descriptor, name = tempfile.mkstemp(prefix='.redacted-', dir=path.parent)
    try:
        os.fchmod(descriptor, info.st_mode & 0o777)
        os.fchown(descriptor, info.st_uid, info.st_gid)
        with os.fdopen(descriptor, 'wb') as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)
    return True

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--gateway', type=Path, required=True)
    parser.add_argument('--nginx', type=Path, required=True)
    args = parser.parse_args()
    roots = [args.gateway.resolve(), args.nginx.resolve()]
    expected = [Path('/root/myserver'), Path('/var/log/nginx')]
    if roots != expected:
        raise SystemExit('Only the explicitly audited website log directories are supported')
    examined = changed = 0
    for root in roots:
        if not root.exists():
            continue
        for path in root.rglob('*'):
            if path.is_symlink() or not path.is_file():
                continue
            if not ('.log' in path.name or path.name.startswith(('access.', 'error.', 'prompts.jsonl'))):
                continue
            examined += 1
            changed += sanitize(path)
    print('Log files checked:', examined, 'Files redacted:', changed, 'Raw visitor addresses are not printed.')

if __name__ == '__main__':
    main()
