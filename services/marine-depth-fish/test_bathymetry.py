import unittest
from unittest.mock import patch
import bathymetry as b

class BathymetryTests(unittest.TestCase):
    def setUp(self):
        b._cache.clear()

    def test_all_ids_beyond_provider_record_limit_are_loaded(self):
        def upstream(url, params):
            if params.get('returnIdsOnly'):
                return {'objectIds': list(range(2301))}
            return {'features': [{'id': int(i)} for i in params['objectIds'].split(',')]}
        with patch.object(b, 'request_json', side_effect=upstream):
            features = b.query_all('https://example.test/layer', {})
        self.assertEqual(len(features), 2301)
        self.assertEqual(features[-1]['id'], 2300)

    def test_transfer_limit_is_split_without_omitting_features(self):
        def upstream(url, params):
            if params.get('returnIdsOnly'):
                return {'objectIds': list(range(10))}
            ids = params['objectIds'].split(',')
            if len(ids) > 3:
                return {'features': [], 'exceededTransferLimit': True}
            return {'features': [{'id': int(i)} for i in ids]}
        with patch.object(b, 'request_json', side_effect=upstream):
            self.assertEqual(len(b.query_all('https://example.test/layer', {})), 10)

    def test_no_coverage_and_source_failure_have_distinct_statuses(self):
        with patch.object(b, 'query_all', return_value=[]):
            self.assertEqual(b.contours('-123,47,-122,48')['status'], 'no_coverage')
        b._cache.clear()
        with patch.object(b, 'query_all', side_effect=RuntimeError('provider offline')):
            result = b.contours('-123,47,-122,48')
            self.assertEqual(result['status'], 'unavailable')
            self.assertFalse(result['complete'])
            self.assertFalse(b._cache)

    def test_upper_crooked_alias_uses_real_polygon_bounds(self):
        features = [{'properties': {'NAME': 'Crooked Lake', 'LAKE_NAME': 'Crooked Lake', 'COUNTY': county},
                     'geometry': {'coordinates': [[[-85.44,42.48],[-85.41,42.50],[-85.44,42.48]]]}}
                    for county in ['Barry','Kalamazoo']]
        with patch.object(b, 'query_all', return_value=features):
            result = b.search_lakes('Upper Crooked Lake Delton Michigan')
        self.assertEqual(len(result), 1)
        self.assertIn('Upper Crooked Lake', result[0]['name'])
        self.assertEqual(result[0]['bbox'], [-85.44,42.48,-85.41,42.50])

    def test_invalid_bounds_rejected(self):
        for bbox in ['nan,0,1,1','0,0,1','1,2,0,3','-181,0,0,90']:
            with self.assertRaises(ValueError):
                b.validate_bbox(bbox)

if __name__ == '__main__':
    unittest.main()
