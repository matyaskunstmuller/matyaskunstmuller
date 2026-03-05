import re

# Read the file
with open(r'c:\portfolio engine\engine-pro-portfolio\projects\projekty\projekty.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Pattern explanation:
# Group 1: <a href="..."> and spaces
# Group 2: <img...> or <video...></video>
# Group 3: \s* (whitespace after image)
# Group 4: <span class="projekt-title">...</span> ... </a> (everything until closing a)
# Actually, the closing </a> should be separate

def replace_item(match):
    before_a = match.group(1)
    a_tag_open = match.group(2)
    inner_content = match.group(3)
    a_tag_close = match.group(4)
    
    # Extract banner
    banner_match = re.search(r'(<(?:img|video)[^>]*class="[^"]*banner[^"]*"[^>]*>(?:</video>)?)(.*)', inner_content, flags=re.DOTALL)
    if not banner_match:
        return match.group(0)
        
    banner = banner_match.group(1)
    rest = banner_match.group(2)
    
    # Check if already wrapped
    if 'class="banner-container"' in inner_content:
        return match.group(0)
        
    new_inner = f'\n                        <div class="banner-container">\n                            {banner.strip()}\n                        </div>\n                        <div class="projekt-text-container">\n                            {rest.strip()}\n                        </div>\n                    '
    
    return f'{before_a}<a href="{a_tag_open}">{new_inner}</a>'

pattern = re.compile(r'(\s*)<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', re.DOTALL)
new_html = pattern.sub(replace_item, html)

with open(r'c:\portfolio engine\engine-pro-portfolio\projects\projekty\projekty.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
