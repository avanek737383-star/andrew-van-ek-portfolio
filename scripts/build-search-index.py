import os
import re
import json
from html.parser import HTMLParser

BASE_DIR = "/home/avanek/agy-work/portfolio"
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_PATH = os.path.join(DATA_DIR, "search-index.json")

class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, data):
        t = data.strip()
        if t:
            self.parts.append(t)
    def get_text(self):
        return " ".join(self.parts)

def strip_tags(html_str):
    p = HTMLTextExtractor()
    p.feed(html_str)
    return p.get_text()

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def build_index():
    index_items = []

    # 1. Maintenance Log
    maint_path = os.path.join(BASE_DIR, "maintenance.html")
    if os.path.exists(maint_path):
        with open(maint_path, "r", encoding="utf-8") as f:
            maint_content = f.read()

        cat_blocks = re.findall(
            r'<section\s+class="maintenance-category"\s+aria-labelledby="([^"]+)">\s*<h2\s+id="[^"]+">([\s\S]*?)</h2>([\s\S]*?)</section>',
            maint_content
        )
        for cat_id, cat_title_raw, cat_body in cat_blocks:
            cat_title = clean_text(strip_tags(cat_title_raw))
            li_items = re.findall(r'<li(\s+id="([^"]+)")?[^>]*>([\s\S]*?)</li>', cat_body)
            for _, item_id, item_html in li_items:
                full_text = clean_text(strip_tags(item_html))
                if not full_text:
                    continue

                strong_match = re.search(r'<strong>([\s\S]*?)</strong>', item_html)
                if strong_match:
                    raw_title = clean_text(strip_tags(strong_match.group(1))).rstrip(':')
                    # If it starts with "Follow-up / verification", see if there is another strong or use sentence
                    if "Follow-up" in raw_title and len(raw_title) < 30:
                        rest = full_text[len(raw_title):].strip().lstrip(':').strip()
                        title = f"{raw_title}: {rest.split('.')[0][:85]}"
                    else:
                        title = raw_title[:100]
                else:
                    title = full_text.split('.')[0][:85]

                url = f"maintenance.html#{item_id}" if item_id else f"maintenance.html#{cat_id}"
                snippet = full_text[:240] + ("..." if len(full_text) > 240 else "")

                index_items.append({
                    "id": item_id or f"maint-{len(index_items)}",
                    "url": url,
                    "title": title,
                    "category": "Maintenance Log",
                    "subcategory": cat_title,
                    "snippet": snippet,
                    "content": full_text
                })

    # 2. Projects
    proj_path = os.path.join(BASE_DIR, "projects.html")
    if os.path.exists(proj_path):
        with open(proj_path, "r", encoding="utf-8") as f:
            proj_content = f.read()

        proj_blocks = re.findall(
            r'<section\s+class="[^"]*project-entry[^"]*"\s+aria-labelledby="([^"]+)">([\s\S]*?)</section>',
            proj_content
        )
        for pid, pbody in proj_blocks:
            h_match = re.search(r'<h[23][^>]*id="' + re.escape(pid) + r'"[^>]*>([\s\S]*?)</h[23]>', pbody)
            if h_match:
                title = clean_text(strip_tags(h_match.group(1)))
            else:
                title = pid.replace("-", " ").title()

            full_text = clean_text(strip_tags(pbody))
            snippet = full_text[:260] + ("..." if len(full_text) > 260 else "")

            index_items.append({
                "id": pid,
                "url": f"projects.html#{pid}",
                "title": title,
                "category": "Projects",
                "subcategory": "Featured Work",
                "snippet": snippet,
                "content": full_text
            })

    # 3. Static Pages
    static_pages = [
        ("index.html", "Home & Homelab Overview", "General", "Homelab engineering, local AI experiments, live Eastern Station Clock, and systems architecture."),
        ("about.html", "About Andrew Van Ek", "Career & About", "Background, education, computing philosophy, hands-on homelab journey, and technology stack."),
        ("job.html", "Technical Skills & Toolkit", "Career & About", "Enterprise IT skills, networking, Linux administration, Python, cloud infrastructure, and technical competencies."),
        ("resume.html", "Professional Resume", "Career & About", "Work experience at Fishbeck and GVSU IT, technical certifications, education, and homelab accomplishments."),
        ("stats.html", "Stats for Nerds & Homelab Telemetry", "Systems & Stats", "Deep architecture breakdown of the homelab, Alpine Linux NUC server, storage arrays, networking topology, and system metrics."),
        ("clock.html", "Homelab Desk Clock", "Systems & Stats", "Eastern Standard Time station clock visualizer, precision SVG analog clock dial, and live astronomical tracking."),
        ("ai-predictor.html", "Neural Coin Predictor", "AI Labs", "Dual-mode 120-epoch PyTorch neural network benchmark, live head-to-head cryptocurrency predictions, and real-time telemetry."),
        ("lab.html", "Live AI Lab", "AI Labs", "Interactive machine learning and WebGL experiments running live in the browser."),
        ("chat.html", "Class & Service Desk Bot", "AI Labs", "AI-powered IT service desk virtual assistant for college course and technical support queries."),
        ("council.html", "AI Chatroom & Council", "AI Labs", "Multi-persona AI council deliberation interface."),
        ("moltbook.html", "Moltbook Agent", "AI Labs", "Autonomous multi-step research and task execution agent."),
        ("sudoku.html", "Sudoku Vision Solver", "AI Labs", "Computer vision and backtracking algorithm Sudoku puzzle solver in the browser."),
        ("contact.html", "Contact Andrew Van Ek", "Career & About", "Get in touch for software engineering, systems administration, and IT collaboration opportunities."),
        ("privacy.html", "Privacy Policy", "General", "Local-first data privacy, cookies policy, and zero-telemetry commitment.")
    ]

    for filename, title, category, extra_desc in static_pages:
        filepath = os.path.join(BASE_DIR, filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                pcontent = f.read()

            main_match = re.search(r'<main[^>]*>([\s\S]*?)</main>', pcontent)
            body_src = main_match.group(1) if main_match else pcontent
            body_text = clean_text(strip_tags(body_src))
            full_text = f"{title}. {extra_desc} {body_text}"
            snippet = extra_desc if extra_desc else body_text[:240] + "..."

            index_items.append({
                "id": filename.replace(".html", ""),
                "url": filename,
                "title": title,
                "category": category,
                "subcategory": "Pages",
                "snippet": snippet,
                "content": full_text
            })

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(index_items, f, separators=(',', ':'), ensure_ascii=False)

    print(f"Generated {OUTPUT_PATH} with {len(index_items)} items ({os.path.getsize(OUTPUT_PATH):,} bytes).")

if __name__ == "__main__":
    build_index()
