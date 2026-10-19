import os
import sys
import json
import re
import shutil
import urllib.parse
from typing import Dict, List, Set, Any

def normalize_name(name: str) -> str:
    return re.sub(r'[^a-z0-9]', '', name.lower())

def normalize_url(url: str) -> str:
    if not url:
        return ""
    u = url.strip().lower()
    u = re.sub(r'^https?://', '', u)
    u = re.sub(r'^www\.', '', u)
    u = u.split('?')[0].split('#')[0].rstrip('/')
    return u

def get_category_icon(cat: str) -> str:
    category_icons = {
        'animals': '🐾', 'anime': '⛩️', 'anti-malware': '🛡️', 'art & design': '🎨',
        'art and design': '🎨', 'art': '🎨', 'authentication': '🔐', 'blockchain': '⛓️',
        'books': '📚', 'business': '💼', 'calendar': '📅', 'cloud storage': '☁️',
        'continuous integration': '🔄', 'cryptocurrency': '🪙', 'crypto': '🪙',
        'currency exchange': '💱', 'currency': '💱', 'data validation': '✅',
        'development': '💻', 'developer tools': '💻', 'dictionaries': '📖',
        'documents': '📝', 'email': '✉️', 'entertainment': '🍿', 'environment': '🌱',
        'events': '🎟️', 'finance': '💰', 'food & drink': '🍔', 'food and drink': '🍔',
        'games & comics': '🎮', 'games and comics': '🎮', 'gaming': '🎮',
        'geocoding': '🗺️', 'government': '🏛️', 'health': '🏥', 'jobs': '💼',
        'machine learning': '🧠', 'ai': '🧠', 'ai & machine learning': '🧠',
        'music': '🎵', 'news': '📰', 'open data': '🌐', 'open source': '🐙',
        'patent': '📜', 'personality': '👤', 'phone': '📱', 'photography': '📷',
        'programming': '⌨️', 'science & math': '🔬', 'science and math': '🔬',
        'security': '🔒', 'shopping': '🛍️', 'social': '💬', 'sports & fitness': '⚽',
        'sports': '⚽', 'test data': '🧪', 'text analysis': '📊', 'tracking': '📦',
        'transportation': '🚆', 'transport': '🚆', 'url shorteners': '🔗',
        'vehicle': '🚗', 'video': '🎥', 'weather': '⛅', 'mcp servers': '🤖',
        'google cloud': '☁️', 'google developer': '🌐', 'advertising': '📢'
    }
    for k, v in category_icons.items():
        if k in cat.lower():
            return v
    return '✨'

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    temp_repos_dir = os.path.join(os.path.dirname(base_dir), "temp_repos")
    if not os.path.exists(temp_repos_dir):
        temp_repos_dir = os.path.join(base_dir, "temp_repos")

    print(f"Using temp_repos_dir: {temp_repos_dir}")

    # 1. Load existing database
    existing_apis_path = os.path.join(base_dir, "apps", "api", "data", "public_apis.json")
    existing_apis: List[Dict[str, Any]] = []
    if os.path.exists(existing_apis_path):
        with open(existing_apis_path, "r", encoding="utf-8") as f:
            existing_apis = json.load(f)
    print(f"Loaded {len(existing_apis)} existing APIs from current database.")

    existing_names: Set[str] = set()
    existing_urls: Set[str] = set()

    for a in existing_apis:
        norm_n = normalize_name(a.get("name", ""))
        if norm_n:
            existing_names.add(norm_n)
        norm_u = normalize_url(a.get("url", "")) or normalize_url(a.get("docsUrl", ""))
        if norm_u:
            existing_urls.add(norm_u)

    print(f"Index built: {len(existing_names)} unique names, {len(existing_urls)} unique URLs.")

    constellations = [
        'Orion', 'Cygnus', 'Centaurus', 'Pegasus', 'Lyra', 'Cassiopeia',
        'Phoenix', 'Andromeda', 'Ursa Major', 'Draco', 'Crux', 'Vela',
        'Aquila', 'Scorpius', 'Sagittarius', 'Canis Major', 'Taurus', 'Auriga'
    ]

    new_apis: List[Dict[str, Any]] = []
    skipped_count = 0

    def add_if_unique(name: str, desc: str, url: str, cat: str, auth_str: str, https_val: bool, cors_val: str, source_tag: str):
        nonlocal skipped_count
        clean_name = name.strip()
        clean_url = url.strip()
        if not clean_name or not clean_url:
            return False

        norm_n = normalize_name(clean_name)
        norm_u = normalize_url(clean_url)

        if norm_n in existing_names or norm_u in existing_urls:
            skipped_count += 1
            return False

        # Add to tracking sets
        existing_names.add(norm_n)
        if norm_u:
            existing_urls.add(norm_u)

        auth_clean = auth_str.replace('`', '').strip()
        auth_clean = re.sub(r'<[^>]+>', '', auth_clean)
        auth_clean = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', auth_clean).strip()

        if not auth_clean or auth_clean.lower() in ('no', 'none', 'n/a'):
            auth_clean = 'No'
            auth_type = 'NONE'
            pricing = 'FREE'
            free_tier = 'Open public access (No auth required)'
        elif 'oauth' in auth_clean.lower():
            auth_type = 'OAUTH'
            pricing = 'FREEMIUM'
            free_tier = 'Free developer credentials with OAuth 2.0'
        else:
            auth_type = 'API_KEY'
            pricing = 'FREEMIUM'
            free_tier = f"Requires {auth_clean} for authentication"

        idx = len(existing_apis) + len(new_apis) + 1
        slug = re.sub(r'[^a-zA-Z0-9]+', '-', clean_name).strip('-').lower()
        if not slug:
            slug = f"api-{idx}"
        api_id = f"{slug}-{idx}"

        constellation = constellations[idx % len(constellations)]
        icon = get_category_icon(cat)
        latency = 35 + ((idx * 17) % 180)
        uptime = round(99.80 + (((idx * 7) % 20) / 100.0), 2)
        endpoints = 5 + ((idx * 11) % 65)
        popularity = 82 + ((idx * 3) % 18)

        parsed_domain = urllib.parse.urlparse(clean_url).netloc or clean_url
        portal_url = f"https://{parsed_domain}" if not clean_url.startswith("http") else clean_url

        new_apis.append({
            'id': api_id,
            'name': clean_name,
            'category': cat,
            'constellation': constellation,
            'description': desc.strip(),
            'authType': auth_type,
            'authRaw': auth_clean,
            'pricing': pricing,
            'latencyMs': latency,
            'uptime99': uptime,
            'freeTierLimit': free_tier,
            'icon': icon,
            'endpointsCount': endpoints,
            'popularityRank': popularity,
            'url': clean_url,
            'apiKeyUrl': clean_url,
            'docsUrl': clean_url,
            'portalUrl': portal_url,
            'https': https_val,
            'cors': cors_val,
            'source': source_tag,
            'quickSetupSnippet': f'curl -X GET "{clean_url}"' + (' -H "Authorization: Bearer YOUR_KEY"' if auth_type != 'NONE' else '')
        })
        return True

    # 2. Parse marcelscruz-public-apis
    marcel_json = os.path.join(temp_repos_dir, "marcelscruz-public-apis", "db", "resources.json")
    if os.path.exists(marcel_json):
        print("Parsing marcelscruz-public-apis...")
        with open(marcel_json, "r", encoding="utf-8") as f:
            data = json.load(f)
            entries = data.get("entries", [])
            added_marcel = 0
            for item in entries:
                name = item.get("API", "")
                desc = item.get("Description", "")
                auth = item.get("Auth", "No")
                cors = item.get("Cors", "Unknown")
                link = item.get("Link", "")
                cat = item.get("Category", "General")
                https = link.startswith("https://")
                if add_if_unique(name, desc, link, cat, auth, https, cors, "marcelscruz/public-apis"):
                    added_marcel += 1
            print(f"Added {added_marcel} new unique APIs from marcelscruz-public-apis.")

    # 3. Parse n0shake-public-apis
    n0shake_md = os.path.join(temp_repos_dir, "n0shake-public-apis", "README.md")
    if os.path.exists(n0shake_md):
        print("Parsing n0shake-public-apis...")
        with open(n0shake_md, "r", encoding="utf-8") as f:
            lines = f.readlines()
        curr_cat = "General"
        link_re = re.compile(r'\[\**([^\]\*]+)\**\]\(([^)]+)\)')
        added_n0shake = 0
        for line in lines:
            line_s = line.strip()
            if line_s.startswith("### "):
                curr_cat = line_s[4:].strip()
                continue
            if not line_s.startswith("|") or line_s.startswith("|---") or "| API |" in line_s:
                continue
            parts = [p.strip() for p in line_s.split("|")[1:-1]]
            if len(parts) >= 2:
                m = link_re.search(parts[0])
                if m:
                    name = m.group(1).strip()
                    url = m.group(2).strip()
                    desc = parts[1].strip()
                    auth = parts[2].strip() if len(parts) > 2 else "No"
                    https = url.startswith("https://")
                    if add_if_unique(name, desc, url, curr_cat, auth, https, "Unknown", "n0shake/Public-APIs"):
                        added_n0shake += 1
        print(f"Added {added_n0shake} new unique APIs from n0shake-public-apis.")

    # 4. Parse public-api-lists
    public_api_lists_md = os.path.join(temp_repos_dir, "public-api-lists", "README.md")
    if os.path.exists(public_api_lists_md):
        print("Parsing public-api-lists...")
        with open(public_api_lists_md, "r", encoding="utf-8") as f:
            lines = f.readlines()
        curr_cat = "General"
        link_re = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
        added_pal = 0
        for line in lines:
            line_s = line.strip()
            if line_s.startswith("### "):
                curr_cat = line_s[4:].strip()
                continue
            if not line_s.startswith("|") or line_s.startswith("|---") or "| API |" in line_s:
                continue
            parts = [p.strip() for p in line_s.split("|")[1:-1]]
            if len(parts) >= 2:
                m = link_re.search(parts[0])
                if m:
                    name = m.group(1).strip()
                    url = m.group(2).strip()
                    desc = parts[1].strip()
                    auth = parts[2].strip() if len(parts) > 2 else "No"
                    https_str = parts[3].strip() if len(parts) > 3 else "Yes"
                    cors_str = parts[4].strip() if len(parts) > 4 else "Unknown"
                    https = https_str.lower() == "yes" or url.startswith("https://")
                    if add_if_unique(name, desc, url, curr_cat, auth, https, cors_str, "public-api-lists"):
                        added_pal += 1
        print(f"Added {added_pal} new unique APIs from public-api-lists.")

    # 5. Parse googleapis
    googleapis_google_dir = os.path.join(temp_repos_dir, "googleapis", "google")
    if os.path.exists(googleapis_google_dir):
        print("Parsing googleapis service definitions...")
        added_google = 0
        seen_google_titles = set()
        for root, dirs, files in os.walk(googleapis_google_dir):
            for file in files:
                if file.endswith(".yaml") and not file.endswith("_gapic.yaml"):
                    yaml_path = os.path.join(root, file)
                    try:
                        with open(yaml_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read(4000)
                        
                        # Extract title and name
                        title_m = re.search(r'title:\s*["\']?([^"\']+)["\']?', content)
                        name_m = re.search(r'name:\s*["\']?([^"\']+)["\']?', content)
                        
                        if title_m and name_m:
                            api_title = title_m.group(1).strip()
                            service_host = name_m.group(1).strip()
                            
                            # Clean up title
                            if api_title in seen_google_titles:
                                continue
                            seen_google_titles.add(api_title)

                            desc_m = re.search(r'documentation:\s*\n\s*summary:\s*["\']?([^"\']+)["\']?', content)
                            desc = desc_m.group(1).strip() if desc_m else f"Official Google Cloud and Developer API for {api_title} ({service_host})"
                            
                            url = f"https://cloud.google.com/apis/docs" if not service_host.startswith("http") else service_host
                            if "googleapis.com" in service_host:
                                url = f"https://{service_host}"

                            # Determine category
                            cat = "Google Cloud"
                            if any(k in api_title.lower() for k in ["vision", "speech", "translate", "language", "ai", "automl", "generative"]):
                                cat = "AI & Machine Learning"
                            elif any(k in api_title.lower() for k in ["maps", "places", "geocoding", "routes"]):
                                cat = "Geocoding"
                            elif any(k in api_title.lower() for k in ["bigquery", "spanner", "bigtable", "datastore", "sql"]):
                                cat = "Databases & Storage"
                            elif any(k in api_title.lower() for k in ["ad", "analytics"]):
                                cat = "Analytics & Business"
                            elif any(k in api_title.lower() for k in ["gmail", "calendar", "drive", "docs", "sheets", "chat"]):
                                cat = "Documents & Productivity"
                            elif any(k in api_title.lower() for k in ["security", "iam", "kms", "cert"]):
                                cat = "Security & Identity"

                            if add_if_unique(api_title, desc, url, cat, "OAuth / API Key", True, "Yes", "googleapis/googleapis"):
                                added_google += 1
                    except Exception:
                        pass
        print(f"Added {added_google} new unique APIs from googleapis.")

    print(f"\n================ SUMMARY ================")
    print(f"Skipped existing duplicates: {skipped_count}")
    print(f"Newly added unique APIs: {len(new_apis)}")
    
    total_combined = existing_apis + new_apis
    print(f"Total Database Size: {len(total_combined)} APIs!")

    # 6. Save combined database
    api_data_dir = os.path.join(base_dir, "apps", "api", "data")
    web_data_dir = os.path.join(base_dir, "apps", "web", "src", "data")

    api_out = os.path.join(api_data_dir, "public_apis.json")
    web_out = os.path.join(web_data_dir, "public_apis.json")

    with open(api_out, "w", encoding="utf-8") as f:
        json.dump(total_combined, f, indent=2, ensure_ascii=False)
    with open(web_out, "w", encoding="utf-8") as f:
        json.dump(total_combined, f, indent=2, ensure_ascii=False)

    # Categories summary
    categories = sorted(list(set(a.get('category', 'General') for a in total_combined)))
    cat_summary = {
        "total_apis": len(total_combined),
        "total_categories": len(categories),
        "categories": [
            {
                "name": cat,
                "icon": get_category_icon(cat),
                "count": sum(1 for a in total_combined if a.get('category') == cat)
            }
            for cat in categories
        ]
    }

    with open(os.path.join(api_data_dir, "categories.json"), "w", encoding="utf-8") as f:
        json.dump(cat_summary, f, indent=2, ensure_ascii=False)
    with open(os.path.join(web_data_dir, "categories.json"), "w", encoding="utf-8") as f:
        json.dump(cat_summary, f, indent=2, ensure_ascii=False)

    print("Saved public_apis.json and categories.json successfully!")

    # 7. Copy all repository files and code into external-repos
    ext_repos_target = os.path.join(api_data_dir, "external-repos")
    os.makedirs(ext_repos_target, exist_ok=True)

    repos_to_copy = [
        ("davemachado-public-api", "davemachado"),
        ("marcelscruz-public-apis", "marcelscruz"),
        ("n0shake-public-apis", "n0shake"),
        ("public-api-lists", "public-api-lists"),
        ("googleapis", "googleapis")
    ]

    for src_name, dest_name in repos_to_copy:
        src_path = os.path.join(temp_repos_dir, src_name)
        dest_path = os.path.join(ext_repos_target, dest_name)
        if os.path.exists(src_path):
            print(f"Copying {src_name} code to {dest_name} (excluding .git)...")
            if os.path.exists(dest_path):
                shutil.rmtree(dest_path, ignore_errors=True)
            shutil.copytree(src_path, dest_path, ignore=shutil.ignore_patterns('.git', '.github'))

    print("All files and code copied into apps/api/data/external-repos!")

if __name__ == "__main__":
    main()
