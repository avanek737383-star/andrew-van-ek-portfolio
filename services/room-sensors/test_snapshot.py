import copy
import unittest
from datetime import datetime, timedelta, timezone
from snapshot import validate, public_view


class SnapshotTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime.now(timezone.utc)
        self.sample = {'schema_version': 1, 'observed_at': self.now.isoformat(),
            'source_connected': True, 'temperature_c': 20, 'light_level': 33, 'board_uptime_s': 10,
            'mining': {'status': 'mining', 'updated_at': self.now.isoformat(),
                       'hashrate_hs': 2400, 'accepted_shares': 3}}

    def test_units_and_live_state(self):
        result = public_view(validate(self.sample, self.now), self.now)
        self.assertEqual(result['temperature_f'], 68)
        self.assertEqual(result['light_percent'], 10)
        self.assertEqual(result['status'], 'live')

    def test_stale_and_disconnected_do_not_claim_live(self):
        result = public_view(validate(self.sample, self.now), self.now+timedelta(seconds=61))
        self.assertEqual(result['status'], 'stale')
        self.sample['source_connected'] = False
        self.assertEqual(public_view(validate(self.sample, self.now), self.now)['status'], 'disconnected')

    def test_reject_extra_data_and_nonfinite_readings(self):
        for field, value in [('mining_key', 'not-accepted'), ('temperature_c', float('nan')),
                             ('light_level', 331), ('source_connected', 'true')]:
            data = copy.deepcopy(self.sample)
            data[field] = value
            with self.assertRaises(ValueError): validate(data, self.now)

    def test_reject_future_timestamp(self):
        self.sample['observed_at'] = (self.now+timedelta(minutes=6)).isoformat()
        with self.assertRaises(ValueError): validate(self.sample, self.now)


if __name__ == '__main__':
    unittest.main()
