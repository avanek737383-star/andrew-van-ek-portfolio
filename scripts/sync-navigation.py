from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
template=(ROOT/'scripts/templates/site-navigation.html').read_text(encoding='utf-8').strip()
for page in ROOT.glob('*.html'):
 text=page.read_text(encoding='utf-8')
 nav=template.replace('href="'+page.name+'"','href="'+page.name+'" aria-current="page"')
 updated,count=re.subn(r'<nav class="tablet-desktop">.*?</nav>',lambda m:nav,text,count=1,flags=re.S)
 if count!=1:raise SystemExit('Missing shared navigation: '+page.name)
 if updated!=text:page.write_text(updated,encoding='utf-8')
print('Navigation synchronized from scripts/templates/site-navigation.html')
