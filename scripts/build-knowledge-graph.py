from datetime import datetime, timezone
from pathlib import Path
# Build 3D Knowledge Graph Data from portfolio projects
import os
import re
import json
from html import unescape

BASE_DIR = str(Path(__file__).resolve().parents[1])
proj_path = os.path.join(BASE_DIR, "projects.html")
out_path = os.path.join(BASE_DIR, "data", "knowledge-map.json")

with open(proj_path, "r", encoding="utf-8") as f:
    proj_content = f.read()

proj_blocks = re.findall(
    r"<section\s+class=\"[^\"]*project-entry[^\"]*\"\s+aria-labelledby=\"([^\"]+)\">([\s\S]*?)</section>",
    proj_content
)

domains = {
    "ai-agents": {
        "id": "domain-ai-agents",
        "name": "AI & Agentic Systems",
        "color": "#c084fc",
        "val": 38,
        "type": "domain",
        "summary": "Self-hosted neural inference, multi-agent architectures, computer vision, voice cloning, and cognitive agents."
    },
    "homelab-infra": {
        "id": "domain-homelab-infra",
        "name": "Homelab & Networking",
        "color": "#38bdf8",
        "val": 38,
        "type": "domain",
        "summary": "Alpine Linux NUC, Tailscale mesh VPN, Docker, AdGuard, DNS filtering, OpenRC daemons, and storage clustering."
    },
    "embedded-hardware": {
        "id": "domain-embedded-hardware",
        "name": "Embedded Hardware & Mobile",
        "color": "#fbbf24",
        "val": 38,
        "type": "domain",
        "summary": "Microcontrollers, vintage Android & CDMA hardware, Duino-Coin mining, Qualcomm DIAG reversing, and telemetry."
    },
    "forensics-recovery": {
        "id": "domain-forensics-recovery",
        "name": "Digital Forensics & Recovery",
        "color": "#34d399",
        "val": 38,
        "type": "domain",
        "summary": "Storage diagnostics, initramfs recovery, filesystem forensics, OS virtualization, and data preservation."
    },
    "media-creative": {
        "id": "domain-media-creative",
        "name": "Audio, Video & Creative",
        "color": "#2dd4bf",
        "val": 38,
        "type": "domain",
        "summary": "Demucs stem isolation, neural sheet music transcription, audio DSP alignment, and Apple Metal visualizers."
    },
    "enterprise-workflow": {
        "id": "domain-enterprise-workflow",
        "name": "Enterprise IT & Automation",
        "color": "#f43f5e",
        "val": 38,
        "type": "domain",
        "summary": "ITSM ticketing workflows, Tanium endpoint deployment, cloud migrations, spreadsheet macros, and industrial PLC/HMI engineering."
    }
}

canonical_bridges = [
    {
        "id": "tech-alpine",
        "name": "Alpine Linux",
        "color": "#0ea5e9",
        "val": 16,
        "type": "tech",
        "keywords": ["alpine", "nucwol2", "openrc", "supervise-daemon"],
        "summary": "Lightweight, secure Musl-based Linux powering homelab NUC services and daemons."
    },
    {
        "id": "tech-tailscale",
        "name": "Tailscale Mesh VPN",
        "color": "#6366f1",
        "val": 16,
        "type": "tech",
        "keywords": ["tailscale", "mesh", "wireguard", "100.87", "magicdns"],
        "summary": "Encrypted WireGuard zero-trust mesh interconnecting cloud VMs, Alpine NUC, Mac, and mobile devices."
    },
    {
        "id": "tech-python-fastapi",
        "name": "Python 3 & FastAPI",
        "color": "#eab308",
        "val": 15,
        "type": "tech",
        "keywords": ["python", "fastapi", "uvicorn", "asyncio", "sse"],
        "summary": "Core asynchronous language and framework powering custom APIs, scanners, and local AI servers."
    },
    {
        "id": "tech-threejs-webgl",
        "name": "Three.js & WebGL",
        "color": "#ec4899",
        "val": 14,
        "type": "tech",
        "keywords": ["three.js", "webgl", "3d-force-graph", "constellation", "knowledge map"],
        "summary": "Hardware-accelerated 3D graphics rendering in-browser scientific and system visualizations."
    },
    {
        "id": "tech-docker-containers",
        "name": "Docker & Containers",
        "color": "#0284c7",
        "val": 14,
        "type": "tech",
        "keywords": ["docker", "container", "compose", "codex-container", "adguard home"],
        "summary": "Isolated container virtualization for reproducible services, AdGuard, and development sandboxes."
    },
    {
        "id": "tech-apple-metal",
        "name": "Apple Silicon & macOS",
        "color": "#a855f7",
        "val": 14,
        "type": "tech",
        "keywords": ["apple silicon", "m1", "macos", "mps", "coreml", "videotoolbox"],
        "summary": "Apple M-series unified memory hardware acceleration for CoreML inference, Metal shaders, and DSP."
    },
    {
        "id": "tech-openrc-daemons",
        "name": "OpenRC & Supervisors",
        "color": "#14b8a6",
        "val": 13,
        "type": "tech",
        "keywords": ["openrc", "supervise-daemon", "init.d", "rc-update", "daemon"],
        "summary": "Non-systemd UNIX service supervision delivering automated crash recovery and background persistence."
    },
    {
        "id": "tech-gcp-cloud",
        "name": "Google Cloud & GCP",
        "color": "#4285f4",
        "val": 13,
        "type": "tech",
        "keywords": ["google cloud", "gcp", "compute engine", "debian 12", "c2-standard"],
        "summary": "Scalable cloud virtual machines for continuous inference, compute rendering, and offsite processing."
    },
    {
        "id": "tech-antigravity",
        "name": "Antigravity AI (Google DeepMind)",
        "color": "#8b5cf6",
        "val": 16,
        "type": "tech",
        "keywords": ["antigravity", "google deepmind", "agentic assistant", "pair programming"],
        "summary": "Agentic AI partner collaborating across architecture, automated diagnosis, code execution, and verification."
    },
    {
        "id": "tech-forensics-reversing",
        "name": "Hardware Reversing & Forensics",
        "color": "#10b981",
        "val": 14,
        "type": "tech",
        "keywords": ["forensic", "qualcomm", "diag", "brew", "odin", "ftk", "ram-disk", "efs2", "flashing"],
        "summary": "Binary protocol extraction, diagnostic mode firmware manipulation, and non-destructive storage recovery."
    }
]

def clean_html(text):
    text = re.sub(r"<[^>]+>", "", text)
    return unescape(text).strip()

def classify_domain(title, text, tech_list):
    blob = (title + " " + text + " " + " ".join(tech_list)).lower()
    if any(k in blob for k in ["knowledge map", "three.js", "webgl force graph", "3d-force-graph"]):
        return "ai-agents"
    if any(k in blob for k in ["sheet music", "demucs", "karaoke", "visualizer", "slo-mo", "musescore", "audio visualizer"]):
        return "media-creative"
    if any(k in blob for k in ["fishbeck", "mission design", "tanium", "invgate", "onedrive to google drive", "blackboard", "parts database", "plc & hmi", "vba"]):
        return "enterprise-workflow"
    if any(k in blob for k in ["forensic", "malware", "ram-disk", "ftk", "failing hard drive", "mac os x tiger", "powerpc", "tahoe", "slax", "storage recovery", "battery removal", "drive c forensics", "takeout"]):
        return "forensics-recovery"
    if any(k in blob for k in ["samsung", "duco", "duino", "bluefruit", "vx5600", "ipod", "sch-u460", "sch-i435", "cdma", "brew"]):
        return "embedded-hardware"
    if any(k in blob for k in ["ai", "gpt", "llm", "realistic vision", "neural", "sudoku vision", "mind reader", "chat", "scam defense", "ace-step", "agent", "council", "stable-diffusion"]):
        return "ai-agents"
    return "homelab-infra"

nodes = []
links = []

for d_key, d_info in domains.items():
    nodes.append(d_info)

for bridge in canonical_bridges:
    nodes.append(bridge)

parsed_projects = []

for pid, pbody in proj_blocks:
    h_match = re.search(r"<h[23][^>]*id=\"" + re.escape(pid) + r"\"[^>]*>([\s\S]*?)</h[23]>", pbody)
    title = clean_html(h_match.group(1)) if h_match else pid.replace("-", " ").title()

    status_match = re.search(r"<span\s+class=\"[^\"]*status-badge[^\"]*\">([\s\S]*?)</span>", pbody)
    status_raw = clean_html(status_match.group(1)) if status_match else "Completed"
    is_in_progress = "in progress" in status_raw.lower()

    date_match = re.search(r"<time\s+datetime=\"[^\"]*\">([\s\S]*?)</time>", pbody)
    date_str = clean_html(date_match.group(1)) if date_match else ""

    p_matches = re.findall(r"<p>(?!<span)([\s\S]*?)</p>", pbody)
    summary = clean_html(p_matches[0]) if p_matches else ""
    if len(summary) > 280:
        summary = summary[:277] + "..."

    meta_p = re.search(r"<p\s+class=\"[^\"]*project-status[^\"]*\">([\s\S]*?)</p>", pbody)
    tech_tags = []
    if meta_p:
        text = clean_html(meta_p.group(1))
        parts = [p.strip() for p in re.split(r"&middot;|·|&bull;|•", text)]
        tech_tags = [
            p for p in parts
            if p and not re.search(r"(Completed|In Progress|Active|January|February|March|April|May|June|July|August|September|October|November|December|202[0-9])", p, re.I)
        ]

    tasks = []
    li_matches = re.findall(r"<li>\s*<strong>([^<:]+):?</strong>\s*([\s\S]*?)</li>", pbody)
    for t_title, t_desc in li_matches[:4]:
        tasks.append({
            "title": clean_html(t_title),
            "desc": clean_html(t_desc)[:140] + ("..." if len(clean_html(t_desc)) > 140 else "")
        })

    domain_key = classify_domain(title, pbody[:400], tech_tags)

    parsed_projects.append({
        "id": pid,
        "title": title,
        "status": "in-progress" if is_in_progress else "completed",
        "statusLabel": status_raw,
        "date": date_str,
        "domain": domain_key,
        "domainName": domains[domain_key]["name"],
        "summary": summary,
        "tech": tech_tags[:6],
        "tasks": tasks,
        "url": f"projects.html#{pid}",
        "raw_text": (title + " " + pbody).lower()
    })

for p in parsed_projects:
    d_node_id = domains[p["domain"]]["id"]
    base_color = "#f59e0b" if p["status"] == "in-progress" else domains[p["domain"]]["color"]

    nodes.append({
        "id": p["id"],
        "name": p["title"],
        "type": "project",
        "domain": p["domain"],
        "domainName": p["domainName"],
        "status": p["status"],
        "statusLabel": p["statusLabel"],
        "date": p["date"],
        "val": 16 + len(p["tasks"]) * 2,
        "color": base_color,
        "summary": p["summary"],
        "tech": p["tech"],
        "tasks": p["tasks"],
        "url": p["url"]
    })

    links.append({
        "source": d_node_id,
        "target": p["id"],
        "type": "domain-project",
        "distance": 65
    })

    for idx, t in enumerate(p["tasks"]):
        task_id = f"task-{p['id']}-{idx}"
        nodes.append({
            "id": task_id,
            "name": t["title"],
            "type": "task",
            "parentProject": p["title"],
            "parentId": p["id"],
            "status": p["status"],
            "val": 5,
            "color": "#10b981" if p["status"] == "completed" else "#facc15",
            "summary": t["desc"],
            "url": p["url"]
        })

        links.append({
            "source": p["id"],
            "target": task_id,
            "type": "project-task",
            "distance": 26
        })

    for bridge in canonical_bridges:
        if any(kw in p["raw_text"] for kw in bridge["keywords"]):
            links.append({
                "source": p["id"],
                "target": bridge["id"],
                "type": "project-tech",
                "distance": 85
            })

graph_data = {
    "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    "stats": {
        "totalProjects": len(parsed_projects),
        "totalNodes": len(nodes),
        "totalLinks": len(links),
        "domains": len(domains),
        "techBridges": len(canonical_bridges)
    },
    "domains": list(domains.values()),
    "bridges": canonical_bridges,
    "nodes": nodes,
    "links": links
}

os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(graph_data, f, indent=2)

print("SUCCESS: Enhanced knowledge-map.json generated!")
print("Stats:", graph_data["stats"])
