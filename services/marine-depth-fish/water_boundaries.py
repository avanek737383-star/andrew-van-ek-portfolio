"""Clip surveys to source-specific water bodies; never draw without a valid mask."""
import copy
import threading
import time
from shapely import make_valid
from shapely.geometry import shape, mapping, box
from shapely.ops import unary_union
from shapely.strtree import STRtree

_cache = {}
_lock = threading.Lock()
GREAT_LAKES = {'lake michigan', 'lake erie', 'lake st. clair', 'saginaw bay'}


def valid_polygon(feature):
    geom = shape(feature['geometry'])
    return geom if geom.is_valid else make_valid(geom)


def inland_boundaries(bbox, query_all, root):
    with _lock:
        cached = _cache.get(('inland', bbox))
        if cached and time.monotonic()-cached[0] < 3600:
            return cached[1]
        params = {'where': '1=1', 'geometry': bbox, 'geometryType': 'esriGeometryEnvelope',
                  'inSR': 4326, 'spatialRel': 'esriSpatialRelIntersects'}
        features = query_all(root+'/hydro/MapServer/17', params)
        boundaries = [(valid_polygon(f), f['properties']) for f in features
                      if (f['properties'].get('NAME') or '').strip().lower() not in GREAT_LAKES]
        if len(_cache) >= 32:
            _cache.pop(next(iter(_cache)))
        _cache[('inland', bbox)] = (time.monotonic(), boundaries)
        return boundaries


def linear_parts(geom):
    if geom.geom_type == 'LineString':
        if geom.length:
            yield geom
    elif hasattr(geom, 'geoms'):
        for part in geom.geoms:
            yield from linear_parts(part)


def mask_features(features, source_name, bbox, query_all, root):
    if not features:
        return []
    viewport = box(*map(float, bbox.split(',')))
    mask_bbox = bbox
    if source_name == 'Michigan inland lakes':
        extents = [shape(f['geometry']).bounds for f in features]
        mask_bbox = ','.join(map(str, [min(g[0] for g in extents), min(g[1] for g in extents),
                                      max(g[2] for g in extents), max(g[3] for g in extents)]))
    inland = inland_boundaries(mask_bbox, query_all, root)
    if source_name == 'Michigan inland lakes':
        candidates = [(g, p) for g, p in inland if p.get('TYPE') == 'lake']
        geoms = [g for g, _ in candidates]
        tree = STRtree(geoms)
        mask = None
    else:
        layer = {'Lake Erie': 11, 'Lake Michigan': 12, 'Lake St. Clair': 13,
                 'Saginaw Bay (Lake Huron)': 14}[source_name]
        key = ('great', layer)
        with _lock:
            cached = _cache.get(key)
            if cached and time.monotonic()-cached[0] < 3600:
                shoreline = cached[1]
            else:
                fs = query_all(root+f'/hydro/MapServer/{layer}', {'where': '1=1'})
                if not fs:
                    raise RuntimeError('No shoreline boundary available; contours withheld')
                shoreline = unary_union([valid_polygon(f) for f in fs])
                _cache[key] = (time.monotonic(), shoreline)
        # The provider's Great Lakes shoreline includes connected inland waters.
        # Explicitly subtract those lakes AND channels before clipping the survey.
        excluded = unary_union([g.intersection(viewport) for g, _ in inland])
        mask = shoreline.intersection(viewport).difference(excluded)
    clipped = []
    for feature in features:
        geom = shape(feature['geometry'])
        water_name = source_name
        water_id = None
        if source_name == 'Michigan inland lakes':
            # Inland survey features lack a lake ID. Assign each feature to the
            # single intersecting lake with greatest contour length, rather than
            # unioning adjacent lakes and admitting stray pieces in another lake.
            overlaps = [(geom.intersection(geoms[int(i)]), int(i)) for i in tree.query(geom, predicate='intersects')]
            if not overlaps:
                continue
            _, index = max(overlaps, key=lambda pair: pair[0].length)
            lake, props = candidates[index]
            result = geom.intersection(lake).intersection(viewport)
            water_name = (props.get('NAME') or '').strip() or 'Michigan inland lake'
            water_id = props.get('OBJECTID')
        else:
            result = geom.intersection(mask)
        parts = list(linear_parts(result))
        if not parts:
            continue
        result = parts[0] if len(parts) == 1 else unary_union(parts)
        output = copy.deepcopy(feature)
        output['geometry'] = mapping(result)
        output['properties'].update({'water': water_name, 'waterbody_id': water_id,
                                     'boundary_clipped': True, 'boundary_source': root+'/hydro/MapServer'})
        clipped.append(output)
    return clipped
