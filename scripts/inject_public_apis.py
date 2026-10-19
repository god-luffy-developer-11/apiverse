import os
import json
import re
import urllib.parse

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    temp_readme = os.path.join(base_dir, "apps", "api", "data", "public-apis-repo", "README.md")
    if not os.path.exists(temp_readme):
        temp_readme = os.path.join(os.path.dirname(base_dir), "public-apis-temp", "README.md")
    
    if not os.path.exists(temp_readme):
        print(f"ERROR: Cannot find {temp_readme}")
        return

    with open(temp_readme, "r", encoding="utf-8") as f:
        lines = f.readlines()

    category_icons = {
        'Animals': '🐾', 'Anime': '⛩️', 'Anti-Malware': '🛡️', 'Art & Design': '🎨',
        'Authentication': '🔐', 'Blockchain': '⛓️', 'Books': '📚', 'Business': '💼',
        'Calendar': '📅', 'Cloud Storage & File Sharing': '☁️', 'Continuous Integration': '🔄',
        'Cryptocurrency': '🪙', 'Currency Exchange': '💱', 'Data Validation': '✅',
        'Development': '💻', 'Dictionaries': '📖', 'Documents & Productivity': '📝',
        'Email': '✉️', 'Entertainment': '🍿', 'Environment': '🌱', 'Events': '🎟️',
        'Finance': '💰', 'Food & Drink': '🍔', 'Games & Comics': '🎮', 'Geocoding': '🗺️',
        'Government': '🏛️', 'Health': '🏥', 'Jobs': '💼', 'Machine Learning': '🧠',
        'Music': '🎵', 'News': '📰', 'Open Data': '🌐', 'Open Source Projects': '🐙',
        'Patent': '📜', 'Personality': '👤', 'Phone': '📱', 'Photography': '📷',
        'Programming': '⌨️', 'Science & Math': '🔬', 'Security': '🔒', 'Shopping': '🛍️',
        'Social': '💬', 'Sports & Fitness': '⚽', 'Test Data': '🧪', 'Text Analysis': '📊',
        'Tracking': '📦', 'Transportation': '🚆', 'URL Shorteners': '🔗', 'Vehicle': '🚗',
        'Video': '🎥', 'Weather': '⛅', 'MCP Servers': '🤖'
    }

    constellations = [
        'Orion', 'Cygnus', 'Centaurus', 'Pegasus', 'Lyra', 'Cassiopeia',
        'Phoenix', 'Andromeda', 'Ursa Major', 'Draco', 'Crux', 'Vela',
        'Aquila', 'Scorpius', 'Sagittarius', 'Canis Major', 'Taurus', 'Auriga'
    ]

    apis = []
    current_category = 'General'
    link_pattern = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')

    for idx, line in enumerate(lines):
        line_s = line.strip()
        if line_s.startswith('## MCP Servers'):
            current_category = 'MCP Servers'
            continue
        elif line_s.startswith('### '):
            current_category = line_s[4:].strip()
            continue
        elif line_s.startswith('## '):
            continue

        if not line_s.startswith('|') or line_s.startswith('|---') or '| API |' in line_s or '| Name |' in line_s:
            continue

        parts = [p.strip() for p in line_s.split('|')[1:-1]]
        if len(parts) < 3:
            continue

        raw_title = parts[0]
        match = link_pattern.search(raw_title)
        if not match:
            continue

        name = match.group(1).strip()
        url = match.group(2).strip()
        desc = parts[1].strip() if len(parts) > 1 else ''
        raw_auth = parts[2].strip() if len(parts) > 2 else 'No'
        raw_https = parts[3].strip() if len(parts) > 3 else 'Yes'
        raw_cors = parts[4].strip() if len(parts) > 4 else 'Unknown'

        auth_clean = raw_auth.replace('`', '').strip()
        auth_clean = re.sub(r'<[^>]+>', '', auth_clean)
        auth_clean = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', auth_clean).strip()
        if not auth_clean or auth_clean.lower() in ('no', 'none'):
            auth_clean = 'No'
            auth_type = 'NONE'
            pricing = 'FREE'
            free_tier = 'Open public access (No auth required)'
        elif 'oauth' in auth_clean.lower():
            auth_type = 'OAUTH'
            pricing = 'FREEMIUM'
            free_tier = 'Free developer credentials with OAuth 2.0'
        elif 'postman' in auth_clean.lower() or not auth_clean:
            auth_clean = 'apiKey'
            auth_type = 'API_KEY'
            pricing = 'FREEMIUM'
            free_tier = 'Free developer API key tier'
        else:
            auth_type = 'API_KEY'
            pricing = 'FREEMIUM'
            free_tier = f"Requires {auth_clean} for authentication"

        is_https = raw_https.replace('`', '').strip().lower() == 'yes'
        cors_val = raw_cors.replace('`', '').strip()

        slug = re.sub(r'[^a-zA-Z0-9]+', '-', name).strip('-').lower()
        if not slug:
            slug = f"api-{len(apis)+1}"
        api_id = f"{slug}-{len(apis)+1}"
        constellation = constellations[len(apis) % len(constellations)]
        icon = category_icons.get(current_category, '✨')
        
        latency = 35 + ((len(apis) * 17) % 180)
        uptime = 99.80 + (((len(apis) * 7) % 20) / 100.0)
        endpoints = 5 + ((len(apis) * 11) % 65)
        popularity = 82 + ((len(apis) * 3) % 18)

        parsed_domain = urllib.parse.urlparse(url).netloc or url
        portal_url = f"https://{parsed_domain}" if not url.startswith("http") else url

        apis.append({
            'id': api_id,
            'name': name,
            'category': current_category,
            'constellation': constellation,
            'description': desc,
            'authType': auth_type,
            'authRaw': auth_clean,
            'pricing': pricing,
            'latencyMs': latency,
            'uptime99': round(uptime, 2),
            'freeTierLimit': free_tier,
            'icon': icon,
            'endpointsCount': endpoints,
            'popularityRank': popularity,
            'url': url,
            'apiKeyUrl': url,
            'docsUrl': url,
            'portalUrl': portal_url,
            'https': is_https,
            'cors': cors_val,
            'quickSetupSnippet': f"curl -X GET \"{url}\"" + (f" -H \"Authorization: Bearer YOUR_KEY\"" if auth_type != "NONE" else "")
        })

    print(f"Successfully parsed {len(apis)} APIs across {len(set(a['category'] for a in apis))} categories!")

    # Target output paths
    api_data_dir = os.path.join(base_dir, "apps", "api", "data")
    web_data_dir = os.path.join(base_dir, "apps", "web", "src", "data")
    
    os.makedirs(api_data_dir, exist_ok=True)
    os.makedirs(web_data_dir, exist_ok=True)

    api_out_file = os.path.join(api_data_dir, "public_apis.json")
    web_out_file = os.path.join(web_data_dir, "public_apis.json")

    with open(api_out_file, "w", encoding="utf-8") as f:
        json.dump(apis, f, indent=2, ensure_ascii=False)
    print(f"Wrote to {api_out_file} ({os.path.getsize(api_out_file)} bytes)")

    with open(web_out_file, "w", encoding="utf-8") as f:
        json.dump(apis, f, indent=2, ensure_ascii=False)
    print(f"Wrote to {web_out_file} ({os.path.getsize(web_out_file)} bytes)")

    # Also save a categories summary file
    categories = sorted(list(set(a['category'] for a in apis)))
    cat_summary = {
        "total_apis": len(apis),
        "total_categories": len(categories),
        "categories": [
            {
                "name": cat,
                "icon": category_icons.get(cat, '✨'),
                "count": sum(1 for a in apis if a['category'] == cat)
            }
            for cat in categories
        ]
    }
    with open(os.path.join(web_data_dir, "categories.json"), "w", encoding="utf-8") as f:
        json.dump(cat_summary, f, indent=2, ensure_ascii=False)
    with open(os.path.join(api_data_dir, "categories.json"), "w", encoding="utf-8") as f:
        json.dump(cat_summary, f, indent=2, ensure_ascii=False)

    print("Categories summary saved!")

if __name__ == "__main__":
    main()
