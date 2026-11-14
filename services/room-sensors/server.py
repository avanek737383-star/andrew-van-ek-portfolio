#!/usr/bin/env python3
"""Read-only, loopback-bound telemetry endpoint behind Tailscale HTTPS/Funnel."""
import argparse
import json
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from snapshot import public_view

ORIGINS = {'https://andrewtvanekportfolio.online', 'https://www.andrewtvanekportfolio.online'}
PATHS = {'/', '/website-chat/room-sensors', '/website-chat/room-sensors/'}


def create_handler(snapshot_path):
    class Handler(BaseHTTPRequestHandler):
        def reply(self, status, data=None):
            body = json.dumps(data, separators=(',', ':'), allow_nan=False).encode() if data is not None else b''
            self.send_response(status)
            origin = self.headers.get('Origin')
            if origin in ORIGINS:
                self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            if urlsplit(self.path).path not in PATHS:
                return self.reply(404, {'error': 'Not found'})
            try:
                if snapshot_path.stat().st_size > 8192:
                    raise ValueError('Snapshot too large')
                data = json.loads(snapshot_path.read_text(encoding='utf-8'))
                payload = public_view(data)
                return self.reply(200, payload)
            except (OSError, ValueError, TypeError, KeyError):
                return self.reply(200, {'schema_version': 1, 'status': 'unavailable',
                    'served_at': datetime.now(timezone.utc).isoformat(),
                    'temperature_f': None, 'light_percent': None, 'mining': None})

        def do_OPTIONS(self):
            if self.headers.get('Origin') not in ORIGINS:
                return self.reply(403, {'error': 'Origin not allowed'})
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin', self.headers['Origin'])
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Accept, Cache-Control')
            self.send_header('Vary', 'Origin')
            self.end_headers()

        def do_POST(self):
            return self.reply(405, {'error': 'Read-only endpoint'})

        def log_message(self, *args):
            pass

    return Handler


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8096)
    parser.add_argument('--snapshot', type=Path, default=Path.home()/'.local/share/portfolio-room-sensors/latest.json')
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), create_handler(args.snapshot))
    print('Room sensor read-only service listening on loopback port ' + str(args.port), flush=True)
    server.serve_forever()
