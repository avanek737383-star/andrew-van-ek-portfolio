"""Fetch release labels from primary sources; keep success and attempt times separate.

Each parser fails closed. A failed request never turns an old value into a fresh
one. No version numbers are guessed from the current calendar year.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
import argparse, json, re, urllib.request

ROOT=Path(__file__).resolve().parents[1]
SOURCES={
 'windows':'https://learn.microsoft.com/en-us/windows/release-health/windows11-release-information',
 'linux':'https://www.kernel.org/releases.json',
 'macos':'https://support.apple.com/en-us/100100',
 'ios':'https://support.apple.com/en-us/100100',
 'android':'https://android.googlesource.com/platform/build/+refs/tags?format=JSON',
 'freebsd':'https://www.freebsd.org/releases/'
}
class TableRows(HTMLParser):
 def __init__(self):super().__init__();self.rows=[];self.row=None;self.cell=None
 def handle_starttag(self,tag,attrs):
  if tag=='tr':self.row=[]
  if tag in ('td','th') and self.row is not None:self.cell=[]
 def handle_data(self,data):
  if self.cell is not None:self.cell.append(data)
 def handle_endtag(self,tag):
  if tag in ('td','th') and self.cell is not None:
   self.row.append(re.sub(r'\s+',' ',' '.join(self.cell)).strip());self.cell=None
  if tag=='tr' and self.row is not None:
   if self.row:self.rows.append(self.row)
   self.row=None
def plain(text):return re.sub(r'\s+',' ',unescape(re.sub('<[^>]*>',' ',text))).strip()
def numeric(value):return tuple(int(part) for part in value.split('.'))
def parse_release(key,text):
 if key=='linux':
  data=json.loads(text);value=data.get('latest_stable',{}).get('version')
  if not value:raise ValueError('Missing stable kernel version')
  return {'version':value,'label':'Linux '+value,'channel':'Latest stable listed by kernel.org'}
 if key=='windows':
  versions=re.findall(r'Version\s+(\d{2}H[12])\s*\(OS build',plain(text),re.I)
  if not versions:raise ValueError('No Windows release headings')
  value=max(versions,key=lambda v:(int(v[:2]),int(v[-1])))
  return {'version':value,'label':'Windows 11 '+value,'channel':'Newest feature version listed; hardware/channel eligibility varies'}
 if key in ('macos','ios'):
  parser=TableRows();parser.feed(text)
  pattern=r'^macOS\s+(?:[A-Za-z][A-Za-z ]*?\s+)?(\d+(?:\.\d+){0,3})(?:\b|\s)' if key=='macos' else r'^iOS\s+(\d+(?:\.\d+){0,3})(?:\b|\s)'
  matches=[]
  for row in parser.rows:
   m=re.search(pattern,row[0])
   if m:matches.append((m[1],row[0],row[-1]))
  if not matches:raise ValueError('No product release rows')
  value,title,date=max(matches,key=lambda v:numeric(v[0]))
  return {'version':value,'label':('macOS ' if key=='macos' else 'iOS ')+value,'channel':'Newest product version in Apple security releases; device support varies','releaseDateText':date}
 if key=='android':
  if text.startswith(")]}'"):text=text.split('\n',1)[1]
  refs=json.loads(text)
  tags=[]
  for tag in refs:
   m=re.fullmatch(r'(?:refs/tags/)?android-(\d+\.\d+\.\d+)_r(\d+)',tag)
   if m:tags.append((m[1],int(m[2])))
  if not tags:raise ValueError('No numbered AOSP release tags')
  value,revision=max(tags,key=lambda item:(numeric(item[0]),item[1]))
  return {'version':value+'_r'+str(revision),'label':'Android '+value+' · AOSP r'+str(revision),'channel':'Latest numbered AOSP platform tag; this is not a handset rollout tracker'}
 if key=='freebsd':
  # Match the production heading itself, rather than a prose reference to it.
  section=re.search(r'<h[23][^>]*>\s*(?:<[^>]+>\s*)*Production Releases\s*(?:</[^>]+>\s*)*</h[23]>([\s\S]*?)(?=<h[23]\b|$)',text,re.I)
  if not section:raise ValueError('Production release section missing')
  versions=re.findall(r'(?:Release\s+|/releases/)(\d+\.\d+)(?:R/|\b)',plain(section[1])+' '+section[1])
  if not versions:raise ValueError('Production release value missing')
  value=max(versions,key=numeric)
  return {'version':value,'label':'FreeBSD '+value+'-RELEASE','channel':'Production release listed by FreeBSD'}
 raise ValueError('Unknown platform')
def get_text(url):
 request=urllib.request.Request(url,headers={'User-Agent':'AndrewVanEkPortfolioReleaseChecker/1.0 (public release metadata)','Accept':'application/json,text/html;q=0.9,*/*;q=0.1'})
 with urllib.request.urlopen(request,timeout=30) as response:
  payload=response.read(12_000_001)
  if len(payload)>12_000_000:raise ValueError('Source too large')
  return payload.decode('utf-8')
def refresh(previous=None,fetch=get_text):
 previous=previous or {};now=datetime.now(timezone.utc).isoformat(timespec='seconds');results={}
 def one(key):
  old=previous.get('platforms',{}).get(key,{})
  try:return key,{**parse_release(key,fetch(SOURCES[key])),'source':SOURCES[key],'checkedAt':now,'lastAttemptAt':now,'status':'ok'}
  except Exception as error:
   # Do not store exception URLs, IPs, credentials, or provider response bodies.
   kept={k:v for k,v in old.items() if k in ('version','label','channel','releaseDateText','checkedAt')}
   return key,{**kept,'source':SOURCES[key],'lastAttemptAt':now,'status':'error','errorType':type(error).__name__}
 with ThreadPoolExecutor(max_workers=6) as pool:
  for key,result in pool.map(one,SOURCES):results[key]=result
 return {'schema':1,'lastAttemptAt':now,'platforms':results,'scope':'Primary-source snapshots. checkedAt changes only after a successful fetch and parse. Source layout changes or network failures keep the last verified value visibly stale.'}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=ROOT/'data/releases.json');args=parser.parse_args()
 old=json.loads(args.output.read_text(encoding='utf-8')) if args.output.exists() else {}
 data=refresh(old);args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
 for key,value in data['platforms'].items():print(key,value['status'],value.get('label','No verified value'))
if __name__=='__main__':main()
