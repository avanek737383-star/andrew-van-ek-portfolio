"""Supervise a website process and redact its stdout/stderr before persistence.

Application file log handlers must also use ip_redaction.install().
"""
import signal
import subprocess
import sys
from ip_redaction import redact_ip

def main():
    command = sys.argv[1:]
    if not command:
        raise SystemExit('A child command is required')
    child = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8', errors='replace', bufsize=1)
    def stop(signum, frame):
        if child.poll() is None:
            child.send_signal(signum)
    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    for line in child.stdout:
        sys.stdout.write(redact_ip(line))
        sys.stdout.flush()
    return child.wait()

if __name__ == '__main__':
    raise SystemExit(main())
