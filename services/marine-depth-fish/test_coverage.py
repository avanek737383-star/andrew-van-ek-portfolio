import unittest
from unittest.mock import patch
from shapely.geometry import box
import bathymetry as b

class FocusCoverageTests(unittest.TestCase):
    def test_gap_visible_despite_neighboring_contours(self):
        lakes=[(box(0,0,10,10),{'TYPE':'lake','NAME':'Muskegon Lake','OBJECTID':35594})]
        with patch.object(b,'inland_boundaries',return_value=lakes):
            gap=b.focused_lake_coverage('2,2,8,8',[{'properties':{'water':'Lake Michigan','waterbody_id':None}}],True)
        self.assertEqual(gap['status'],'coverage_gap')
        self.assertIn('Muskegon Lake',gap['message'])
    def test_own_contours_clear_gap(self):
        with patch.object(b,'inland_boundaries',return_value=[(box(0,0,10,10),{'TYPE':'lake','NAME':'Muskegon Lake','OBJECTID':35594})]):
            result=b.focused_lake_coverage('2,2,8,8',[{'properties':{'waterbody_id':35594}}],True)
        self.assertEqual(result['status'],'surveyed_in_view')
        self.assertEqual(result['message'],'')
    def test_off_lake_no_named_gap(self):
        with patch.object(b,'inland_boundaries',return_value=[(box(0,0,1,1),{'TYPE':'lake','NAME':'Other'})]):
            self.assertIsNone(b.focused_lake_coverage('2,2,8,8',[],True))
    def test_provider_failure_is_not_coverage_gap(self):
        self.assertIsNone(b.focused_lake_coverage('2,2,8,8',[],False))
        with patch.object(b,'inland_boundaries',side_effect=RuntimeError('offline')):
            self.assertEqual(b.focused_lake_coverage('2,2,8,8',[],True)['status'],'unknown')

if __name__=='__main__':unittest.main()
