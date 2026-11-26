import importlib.util,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('releases',Path(__file__).resolve().parents[1]/'scripts/refresh-release-data.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class ReleaseTests(unittest.TestCase):
 def test_windows_rejects_missing_headings(self):
  with self.assertRaises(ValueError):module.parse_release('windows','Copyright 2026')
 def test_apple_reads_product_rows_not_dates_or_support_requirements(self):
  text='<table><tr><td>macOS Example 27.2.1</td><td>macOS 26 or later</td><td>9 Nov 2026</td></tr><tr><td>iOS 27.2 and iPadOS 27.2</td><td>iPhone</td><td>26 Oct 2026</td></tr></table>'
  self.assertEqual(module.parse_release('macos',text)['version'],'27.2.1')
  self.assertEqual(module.parse_release('ios',text)['version'],'27.2')
 def test_aosp_ignores_preview_tags(self):
  self.assertEqual(module.parse_release('android',')]}\'\n{"android-16.0.0_r12":{},"android-17-beta1":{}}')['version'],'16.0.0_r12')
 def test_failure_preserves_success_time(self):
  previous={'platforms':{'linux':{'label':'Linux 1.2.3','checkedAt':'2020-01-01T00:00:00Z'}}}
  result=module.refresh(previous,fetch=lambda url:(_ for _ in ()).throw(OSError('network')))
  self.assertEqual(result['platforms']['linux']['checkedAt'],'2020-01-01T00:00:00Z')
  self.assertEqual(result['platforms']['linux']['status'],'error')
if __name__=='__main__':unittest.main()
