"""Validation shared by the restricted SSH receiver and public read-only server."""
import math
from datetime import datetime, timezone

ALLOWED = {'schema_version', 'observed_at', 'source_connected', 'temperature_c',
           'light_level', 'board_uptime_s', 'mining'}
MINING_STATES = {'connected', 'mining', 'retrying', 'board-unavailable'}


def timestamp(value):
    if not isinstance(value, str) or len(value) > 45:
        raise ValueError('Invalid timestamp')
    result = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if result.tzinfo is None:
        raise ValueError('Timestamp needs a timezone')
    return result.astimezone(timezone.utc)


def number(value, low, high):
    if isinstance(value, bool) or not isinstance(value, (float, int)):
        raise ValueError('Expected a number')
    if not math.isfinite(value) or not low <= value <= high:
        raise ValueError('Number outside sensor range')
    return value


def validate(data, now=None):
    now = now or datetime.now(timezone.utc)
    if not isinstance(data, dict) or set(data) - ALLOWED or data.get('schema_version') != 1:
        raise ValueError('Invalid snapshot schema')
    if type(data.get('source_connected')) is not bool:
        raise ValueError('Invalid connection state')
    observed = timestamp(data.get('observed_at'))
    if not -300 <= (now-observed).total_seconds() <= 86400:
        raise ValueError('Snapshot timestamp outside the accepted window')
    clean = {'schema_version': 1, 'observed_at': observed.isoformat(),
             'source_connected': data['source_connected'],
             'temperature_c': number(data.get('temperature_c'), -40, 125),
             'light_level': number(data.get('light_level'), 0, 330),
             'board_uptime_s': number(data.get('board_uptime_s'), 0, 1e12)}
    mining = data.get('mining')
    if mining is not None:
        if not isinstance(mining, dict) or set(mining) != {'status','updated_at','hashrate_hs','accepted_shares'}:
            raise ValueError('Invalid mining status')
        if mining['status'] not in MINING_STATES:
            raise ValueError('Unknown mining state')
        updated = timestamp(mining['updated_at'])
        if not -300 <= (now-updated).total_seconds() <= 86400:
            raise ValueError('Mining timestamp outside the accepted window')
        shares = number(mining['accepted_shares'], 0, 1e12)
        if int(shares) != shares:
            raise ValueError('Share count must be an integer')
        clean['mining'] = {'status': mining['status'], 'updated_at': updated.isoformat(),
                           'hashrate_hs': number(mining['hashrate_hs'], 0, 1e8),
                           'accepted_shares': int(shares)}
    return clean


def public_view(data, now=None):
    now = now or datetime.now(timezone.utc)
    age = max(0, (now-timestamp(data['observed_at'])).total_seconds())
    state = 'live' if data['source_connected'] and age <= 60 else 'stale'
    if not data['source_connected']:
        state = 'disconnected'
    return {'schema_version': 1, 'status': state, 'age_seconds': round(age, 1),
            'observed_at': data['observed_at'], 'served_at': now.isoformat(),
            'device': 'Circuit Playground Bluefruit',
            'temperature_f': round(data['temperature_c']*1.8+32, 1),
            'light_percent': round(data['light_level']/330*100, 1),
            'light_level': data['light_level'], 'light_scale_max': 330,
            'mining': data.get('mining')}
