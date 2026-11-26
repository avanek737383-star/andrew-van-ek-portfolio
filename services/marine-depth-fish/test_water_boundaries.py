import unittest
from shapely.geometry import box, LineString, shape, mapping
import water_boundaries as wb

def feature(geom, **props):
    return {'type':'Feature','geometry':mapping(geom),'properties':props}

class WaterBoundaryTests(unittest.TestCase):
    def setUp(self): wb._cache.clear()
    def test_great_lake_mask_excludes_inland_lake_and_connecting_channel(self):
        lake=feature(box(4,4,6,6), NAME='Muskegon Lake', TYPE='lake', OBJECTID=1)
        channel=feature(box(3,4.8,4,5.2), NAME='Muskegon Lake Channel', TYPE='river', OBJECTID=2)
        def query(url, params):return [lake,channel] if url.endswith('/17') else [feature(box(0,0,10,10))]
        # Shoreline polygon intentionally includes inland lake: same provider flaw.
        source=feature(LineString([(-1,5),(11,5)]), OBJECTID=3)
        result=wb.mask_features([source],'Lake Michigan','0,0,10,10',query,'root')
        geom=shape(result[0]['geometry'])
        self.assertLess(geom.intersection(shape(lake['geometry'])).length,1e-12)
        self.assertLess(geom.intersection(shape(channel['geometry'])).length,1e-12)
        self.assertTrue(box(0,0,10,10).covers(geom))
        self.assertEqual(geom.geom_type,'MultiLineString')
    def test_inland_contour_cannot_jump_land_into_neighbor_lake(self):
        own=feature(box(0,0,4,4),NAME='Own Lake',TYPE='lake',OBJECTID=1)
        other=feature(box(5,0,6,4),NAME='Other Lake',TYPE='lake',OBJECTID=2)
        source=feature(LineString([(-1,2),(7,2)]),OBJECTID=4)
        result=wb.mask_features([source],'Michigan inland lakes','-2,-1,8,5',lambda *a:[own,other],'root')
        self.assertEqual(result[0]['properties']['water'],'Own Lake')
        self.assertTrue(shape(own['geometry']).covers(shape(result[0]['geometry'])))
        self.assertEqual(shape(result[0]['geometry']).intersection(shape(other['geometry'])).length,0)
    def test_boundary_provider_failure_never_returns_unclipped_lines(self):
        def fail(*args): raise RuntimeError('boundary unavailable')
        with self.assertRaises(RuntimeError):
            wb.mask_features([feature(LineString([(0,0),(1,1)]))], 'Lake Michigan','0,0,2,2',fail,'root')

if __name__=='__main__':unittest.main()
