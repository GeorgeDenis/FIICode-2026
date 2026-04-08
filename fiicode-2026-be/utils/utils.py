import datetime
import math


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def is_in_quiet_hours(start_time, end_time, current_time=None):
    if not start_time or not end_time:
        return False

    if current_time is None:
        current_time = datetime.now().time()

    if start_time < end_time:
        return start_time <= current_time <= end_time
    else:
        return current_time >= start_time or current_time <= end_time