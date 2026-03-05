import re
import sys

file_path = r'c:\portfolio engine\engine-pro-portfolio\projects\projekty\projekty.html'
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace CSS
    new_css = '''/* MASONRY KONTEJNER - Vše v jednom, aby se nic neztrácelo */
        .masonry-container {
            display: flex;
            flex-direction: column;
            gap: 60px;
            width: 100%;
        }

        /* JEDNOTLIVÝ PROJEKT - Stabilní a zapečený */
        .projekt-item {
            width: 100%;
            line-height: 1.4;
            color: #ccc;
            font-size: 0.85rem;
        }

        .projekt-item a {
            display: flex;
            flex-direction: row;
            gap: 30px;
            color: #fff;
            text-decoration: none;
            transition: opacity 0.2s;
            align-items: flex-start;
        }

        .projekt-item a:hover {
            opacity: 0.8;
        }

        .banner-container {
            flex: 0 0 55%;
            max-width: 55%;
        }

        .banner {
            width: 100%;
            height: auto;
            display: block;
            margin-bottom: 0;
            pointer-events: none;
            object-fit: contain;
        }

        .projekt-text-container {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .projekt-title {
            font-weight: bold;
            display: block;
            color: #fff;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }

        /* RESPONZIVITA - Automatické přeskládání bez mizení obsahu */
        @media (max-width: 768px) {
            .projekt-item a {
                flex-direction: column;
                gap: 15px;
            }
            .banner-container {
                flex: 0 0 100%;
                max-width: 100%;
            }
            .projekty-text-wrapper {
                padding: 5rem 1.5rem 2rem 1.5rem;
            }
        }'''

    # Replace CSS logic
    content = re.sub(r'/\*\s*MASONRY KONTEJNER.*?(?=</style>)', new_css + '\n    ', content, flags=re.DOTALL)

    # Replace HTML wrappers
    # Iterate through each .projekt-item and reformat inner HTML
    def wrap_item(match):
        inner = match.group(1)
        
        # We want to separate the media (img/video) from the text.
        media_match = re.search(r'(<(?:img|video)[^>]+class="[^"]*banner[^"]*"[^>]*>)(?:\s*</video>)?', inner, re.IGNORECASE)
        
        if media_match:
            media_tag = media_match.group(0)
            
            # Text is everything else after media
            rest = inner.replace(media_tag, '')
            
            # Strip trailing/leading spaces
            media_tag = media_tag.strip()
            rest = rest.strip()
            
            return f'<a {match.group(2)}>\n                        <div class="banner-container">\n                            {media_tag}\n                        </div>\n                        <div class="projekt-text-container">\n                            {rest}\n                        </div>\n                    </a>'
        return match.group(0)

    # match `<a href="...">...</a>` inside .projekt-item
    content = re.sub(r'<a ([^>]+)>(.*?)</a>', wrap_item, content, flags=re.DOTALL)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated projekty.html")
except Exception as e:
    print(e)
