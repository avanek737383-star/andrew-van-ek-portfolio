#!/usr/bin/env python3
"""
FishDepth - Marine Depth Chart & Hot Fishing Spots Web Service
Standalone service on Alpine NUC with SQLite caching, NOAA/OpenSeaMap bathymetry layers,
live bearing & heading calculation, Screen Wake Lock API, and dynamic sliding depth labels.
Port: 8098 (served via Tailscale HTTPS on port 8446)
"""

import os
import sys
import json
import time
import math
import sqlite3
import urllib.parse
import urllib.request
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from bathymetry import contours, search_lakes

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DB_PATH = BASE_DIR / "fish_spots.db"
PORT = 8098
HOST = "127.0.0.1"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS spots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        water_type TEXT NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        depth_ft REAL NOT NULL,
        structure TEXT NOT NULL,
        bait TEXT,
        season TEXT,
        rating INTEGER DEFAULT 5,
        notes TEXT,
        is_user_added INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()

def haversine_distance_m(lat1, lon1, lat2, lon2):
    R = 6371000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi/2.0)**2 + math.cos(phi1)*math.cos(phi2) * math.sin(delta_lambda/2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def calculate_bearing(lat1, lon1, lat2, lon2):
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)
    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    bearing = (math.degrees(math.atan2(y, x)) + 360.0) % 360.0
    return round(bearing, 1)

class FishRequestHandler(BaseHTTPRequestHandler):
    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            pass  # Expected when a newer viewport cancels an in-flight request.

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/spots":
            qs = urllib.parse.parse_qs(parsed.query)
            user_lat = float(qs.get("lat", [0])[0]) if "lat" in qs else None
            user_lon = float(qs.get("lon", [0])[0]) if "lon" in qs else None

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM spots ORDER BY id DESC")
            rows = [dict(r) for r in c.fetchall()]
            conn.close()

            # If user coordinates supplied, compute live bearing and distance to each spot
            if user_lat is not None and user_lon is not None and (user_lat != 0 or user_lon != 0):
                for r in rows:
                    dist_m = haversine_distance_m(user_lat, user_lon, r["lat"], r["lon"])
                    r["distance_m"] = round(dist_m, 1)
                    r["distance_yds"] = round(dist_m * 1.09361, 1)
                    r["distance_mi"] = round(dist_m * 0.000621371, 2)
                    r["bearing_deg"] = calculate_bearing(user_lat, user_lon, r["lat"], r["lon"])
                rows.sort(key=lambda x: x["distance_m"])

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "count": len(rows), "spots": rows}).encode("utf-8"))
            return

        if path in ("/api/contours", "/api/search"):
            qs = urllib.parse.parse_qs(parsed.query)
            try:
                if path == "/api/contours":
                    result = contours(qs.get("bbox", ["-86.6,42.6,-85.5,43.3"])[0])
                    status = 200 if result["complete"] or result["features"] else 502
                else:
                    query = qs.get("q", [""])[0].strip()
                    results = search_lakes(query)
                    result = {"query": query, "results": results, "count": len(results)}
                    status = 200
            except ValueError as exc:
                status, result = 400, {"error": str(exc)}
            except Exception as exc:
                status, result = 502, {"error": "Map data provider unavailable", "detail": str(exc)}
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))
            return

        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "running", "service": "FishDepth Marine Chart", "port": PORT}).encode("utf-8"))
            return

        # Static files
        if path == "/" or path == "/index.html":
            file_path = STATIC_DIR / "index.html"
            if file_path.exists():
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
                return

        # Fallback 404
        self.send_response(404)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Not Found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/spots":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            try:
                data = json.loads(body)
                name = str(data.get("name", "Custom Hotspot")).strip()
                species = str(data.get("species", "Mixed Catch")).strip()
                water_type = str(data.get("water_type", "Freshwater")).strip()
                lat = float(data.get("lat", 0.0))
                lon = float(data.get("lon", 0.0))
                depth_ft = float(data.get("depth_ft", 15.0))
                structure = str(data.get("structure", "Drop-Off / Ledge")).strip()
                bait = str(data.get("bait", "Artificial Lure")).strip()
                notes = str(data.get("notes", "")).strip()

                conn = sqlite3.connect(DB_PATH)
                c = conn.cursor()
                c.execute("""
                INSERT INTO spots (name, species, water_type, lat, lon, depth_ft, structure, bait, notes, is_user_added)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                """, (name, species, water_type, lat, lon, depth_ft, structure, bait, notes))
                new_id = c.lastrowid
                conn.commit()
                conn.close()

                self.send_response(201)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "created", "id": new_id}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return

        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        parts = parsed.path.strip("/").split("/")
        if len(parts) == 3 and parts[0] == "api" and parts[1] == "spots":
            try:
                spot_id = int(parts[2])
                conn = sqlite3.connect(DB_PATH)
                c = conn.cursor()
                c.execute("DELETE FROM spots WHERE id = ?", (spot_id,))
                conn.commit()
                conn.close()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "deleted", "id": spot_id}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return
        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), FishRequestHandler)
    print(f"[*] FishDepth Server listening on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    server.server_close()
