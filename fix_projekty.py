from bs4 import BeautifulSoup
import os

filepath = r'c:\portfolio engine\engine-pro-portfolio\projects\projekty\projekty.html'
with open(filepath, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

items = soup.find_all('div', class_='projekt-item')
for item in items:
    a_tag = item.find('a')
    if not a_tag: continue
    
    # We want to wrap the img/video with class 'banner' in a div.banner-container
    # And we want to wrap the remaining contents (span.projekt-title and text) in div.projekt-text-container
    
    banner = a_tag.find(lambda t: t.has_attr('class') and 'banner' in t['class'])
    if not banner: continue
    
    # Create containers
    banner_container = soup.new_tag('div', **{'class': 'banner-container'})
    text_container = soup.new_tag('div', **{'class': 'projekt-text-container'})
    
    # Move banner
    banner.replace_with(banner_container)
    banner_container.append(banner)
    
    # Move all other children of a_tag to text_container
    for child in list(a_tag.children):
        if child == banner_container:
            continue
        text_container.append(child)
        
    a_tag.append(text_container)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(str(soup))
