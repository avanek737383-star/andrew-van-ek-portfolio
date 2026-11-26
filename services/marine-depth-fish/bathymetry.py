"""Viewport bathymetry and lake-name search using Michigan's existing GIS provider."""
import json
import math
import re
import threading
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from water_boundaries import mask_features, inland_boundaries
from shapely.geometry import Point

ROOT = 'https://gisagocss.state.mi.us/arcgis/rest/services/OpenData'
SOURCES = [(f'{ROOT}/elevation/MapServer/{i}', name) for i, name in enumerate(
    ['Lake Erie', 'Lake Michigan', 'Lake St. Clair', 'Saginaw Bay (Lake Huron)'])]
SOURCES.append((f'{ROOT}/hydro/MapServer/4', 'Michigan inland lakes'))
COVERAGE = ('Available surveys: Lake Michigan, Lake Erie, Lake St. Clair, Saginaw Bay '
            'and surveyed Michigan inland lakes. Coverage has gaps; this source does not '
            'provide worldwide bathymetry. No contours are invented for missing areas.')
_cache = {}
_lock = threading.Lock()


def request_json(url, params):
    req = urllib.request.Request(url + '?' + urllib.parse.urlencode(params),
                                 headers={'User-Agent': 'FishDepth/2.0', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=25) as response:
        data = json.load(response)
    if 'error' in data:
        raise RuntimeError(str(data['error']))
    return data


def validate_bbox(raw):
    values = [float(v) for v in raw.split(',')]
    if len(values) != 4 or not all(math.isfinite(v) for v in values):
        raise ValueError('bbox must contain four finite coordinates')
    w, s, e, n = values
    if not (-180 <= w < e <= 180 and -90 <= s < n <= 90):
        raise ValueError('bbox must be west,south,east,north in geographic bounds')
    return ','.join(str(v) for v in values)


def query_all(url, params):
    # Object ID queries are not subject to ArcGIS's feature transfer limit.
    # Fetch every matching ID in small batches instead of silently losing the
    # remainder of a viewport after the server's 1000-feature cap.
    result = request_json(url + '/query', dict(params, f='json', returnIdsOnly='true'))
    ids = sorted(set(result.get('objectIds') or []))
    features = []
    def fetch_ids(batch):
        data = request_json(url + '/query', {
            'objectIds': ','.join(map(str, batch)), 'outFields': '*',
            'outSR': 4326, 'f': 'geojson'})
        if data.get('exceededTransferLimit') or len(data.get('features', [])) != len(batch):
            if len(batch) == 1:
                raise RuntimeError('Incomplete GIS feature response')
            mid = len(batch) // 2
            return fetch_ids(batch[:mid]) + fetch_ids(batch[mid:])
        return data.get('features', [])
    batches = [ids[start:start + 200] for start in range(0, len(ids), 200)]
    with ThreadPoolExecutor(max_workers=4) as pool:
        for batch_features in pool.map(fetch_ids, batches):
            features.extend(batch_features)
    return features


def focused_lake_coverage(bbox, features, complete):
    """Describe the lake at the viewport center, even when neighbors have lines.

    This describes the current view, not an assertion about a whole-lake survey.
    Never turn a failed provider request into a coverage-gap claim.
    """
    if not complete:
        return None
    w, south, e, north = map(float, bbox.split(','))
    center = Point((w+e)/2, (south+north)/2)
    try:
        lakes = [(geom, props) for geom, props in inland_boundaries(bbox, query_all, ROOT)
                 if props.get('TYPE') == 'lake' and geom.covers(center)]
        if not lakes:
            return None
        _, props = min(lakes, key=lambda item: item[0].area)
        name = (props.get('NAME') or '').strip() or 'This lake'
        water_id = props.get('OBJECTID')
        has_contours = any(f.get('properties', {}).get('waterbody_id') == water_id
                           for f in features) if water_id is not None else False
        return {'name': name, 'waterbody_id': water_id,
                'status': 'surveyed_in_view' if has_contours else 'coverage_gap',
                'message': '' if has_contours else
                f'Coverage gap — {name}: no surveyed depth contours in this view from the current source. Neighboring waters may still show contours.'}
    except Exception:
        return {'status': 'unknown', 'message': 'Lake coverage check unavailable. Pan or reload to retry.'}


def contours(raw_bbox):
    bbox = validate_bbox(raw_bbox)
    now = time.monotonic()
    with _lock:
        cached = _cache.get(bbox)
        if cached and now - cached[0] < 900:
            return cached[1]
    params = {'where': '1=1', 'geometry': bbox, 'geometryType': 'esriGeometryEnvelope',
              'inSR': 4326, 'spatialRel': 'esriSpatialRelIntersects'}
    def load(source):
        url, name = source
        try:
            features = query_all(url, params)
            normalized = []
            for feature in features:
                p = feature.setdefault('properties', {})
                depth = p.get('DEPTH_FT', p.get('DEPTH'))
                if depth is None and p.get('DEPTH_M') is not None:
                    depth = float(p['DEPTH_M']) * 3.28084
                if depth is None or not feature.get('geometry'):
                    continue
                p['DEPTH_FT'] = round(float(depth), 1)
                p['water'] = name
                p['source'] = url
                normalized.append(feature)
            raw_count = len(normalized)
            normalized = mask_features(normalized, name, bbox, query_all, ROOT)
            return normalized, {'name': name, 'url': url, 'count': len(normalized),
                                'survey_count': raw_count, 'boundary_clipped': True, 'status': 'ok'}
        except Exception as exc:
            return [], {'name': name, 'url': url, 'count': 0, 'status': 'error', 'error': str(exc)}
    with ThreadPoolExecutor(max_workers=len(SOURCES)) as pool:
        results = list(pool.map(load, SOURCES))
    features = [f for fs, _ in results for f in fs]
    sources = [status for _, status in results]
    complete = all(s['status'] == 'ok' for s in sources)
    result = {'type': 'FeatureCollection', 'bbox': bbox, 'count': len(features),
              'features': features, 'sources': sources, 'complete': complete,
              'coverage': COVERAGE, 'status': 'ok' if features else 'no_coverage'}
    if not complete:
        result['status'] = 'partial' if features else 'unavailable'
    result['focus_coverage'] = focused_lake_coverage(bbox, features, complete)
    # Never cache a failed provider response as a successful empty viewport.
    if complete and (result['focus_coverage'] or {}).get('status') != 'unknown':
        with _lock:
            if len(_cache) >= 64:
                _cache.pop(min(_cache, key=lambda k: _cache[k][0]))
            _cache[bbox] = (now, result)
    return result


def points(coords):
    if coords and isinstance(coords[0], (float, int)):
        yield coords
    else:
        for child in coords:
            yield from points(child)


def search_lakes(query):
    words = re.findall(r'[a-z0-9]+', query.lower())
    if not words or len(query) > 160:
        raise ValueError('Enter a lake or place name (up to 160 characters)')
    # The state calls Upper Crooked Lake simply "Crooked Lake". Search the
    # distinctive name, then rank full names, counties, and known local aliases.
    ignored = {'lake', 'lakes', 'upper', 'lower', 'north', 'south', 'east', 'west',
               'big', 'little', 'michigan', 'mi', 'in', 'near', 'county', 'delton'}
    names = [w for w in words if w not in ignored]
    if not names:
        names = [w for w in words if w not in {'lake', 'mi', 'michigan'}]
    if not names:
        return []
    term = names[0].upper()  # alphanumeric only: safe in SQL LIKE
    url = f'{ROOT}/hydro/MapServer/23'
    features = query_all(url, {'where': f"UPPER(NAME) LIKE '%{term}%' OR UPPER(LAKE_NAME) LIKE '%{term}%'"})
    results = []
    for f in features:
        p = f['properties']
        name = (p.get('NAME') or '').strip() or (p.get('LAKE_NAME') or '').strip()
        county = (p.get('COUNTY') or '').strip()
        aliases = ''
        if county.lower() == 'barry' and name.lower() == 'crooked lake':
            name = 'Upper Crooked Lake'
            aliases = 'Crooked Lake Delton'
        text = f'{name} {p.get("LAKE_NAME", "")} {county} county michigan mi {aliases}'.lower()
        if not all(w in text for w in names):
            continue
        pts = list(points(f['geometry']['coordinates']))
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        bounds = [min(xs), min(ys), max(xs), max(ys)]
        results.append({'name': f'{name} — {county} County, Michigan',
                        'bbox': bounds, 'lat': (bounds[1]+bounds[3])/2,
                        'lon': (bounds[0]+bounds[2])/2, 'source': url,
                        '_score': sum(w in text for w in words)})
    exact = [r for r in results if r['_score'] == len(words)]
    if exact:
        results = exact
    results.sort(key=lambda r: (-r['_score'], r['name']))
    for r in results:
        r.pop('_score')
    return results[:20]
