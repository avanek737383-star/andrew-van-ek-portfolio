"""Build a dated Git history snapshot, explicitly tied to the source HEAD."""
from datetime import datetime,timezone
from pathlib import Path
import argparse,json,re,subprocess

def build(repo):
 def git(*args):return subprocess.check_output(['git','-C',str(repo),*args],text=True,encoding='utf-8').strip()
 raw=git('log','--format=%H%x1f%aI%x1f%s','HEAD')
 commits=[]
 for line in raw.splitlines():
  sha,date,subject=line.split('\x1f',2)
  text=subject.lower()
  category='Local AI' if any(k in text for k in ('model',' ai ','nemo','coin','musicgen')) else 'Fleet & Infra' if any(k in text for k in ('fleet','server','nginx','tailscale','linux','storage')) else 'UI & UX' if any(k in text for k in ('layout','mobile','css','navigation','footer','style')) else 'Maintenance' if any(k in text for k in ('maintenance','fix','refresh','audit','correct')) else 'Feature'
  commits.append({'sha':sha,'date':date,'subject':subject,'category':category})
 versions=[]
 for page in repo.glob('*.html'):
  versions.extend(tuple(map(int,v.split('.'))) for v in re.findall(r'Version v(\d+\.\d+\.\d+)',page.read_text(encoding='utf-8')))
 return {'schema':1,'generatedAt':datetime.now(timezone.utc).isoformat(timespec='seconds'),'sourceHead':git('rev-parse','HEAD'),'count':len(commits),'releaseLabel':'v'+'.'.join(map(str,max(versions))) if versions else None,'scope':'All Git commits reachable from sourceHead. This is a generated snapshot; a later metadata-only commit may follow it. Author dates are not deployment dates.','commits':commits}
def main():
 p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[1]);args=p.parse_args()
 data=build(args.repo.resolve());out=args.repo/'data/changelog.json';out.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8');print('Git snapshot:',data['count'],'commits through',data['sourceHead'][:12])
if __name__=='__main__':main()
