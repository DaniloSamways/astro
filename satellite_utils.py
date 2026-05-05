from __future__ import annotations

from datetime import datetime, timedelta, timezone

from skyfield.api import EarthSatellite, load, wgs84
import requests


CELESTRAK_VISUAL_URL = "https://celestrak.org/NORAD/elements/gp.php"
CELESTRAK_TIMEOUT_SECONDS = 20
MIN_VISUAL_ALTITUDE_DEGREES = 15.0
LOOKAHEAD_HOURS = 12
MAX_RESULTS = 10
SUN_ALTITUDE_LIMIT_DEGREES = -4.0
MIN_PASS_ALTITUDE_DEGREES = 10.0


def fetch_visual_satellites() -> list[dict]:
    params = {
        "GROUP": "visual",
        "FORMAT": "json",
    }

    response = requests.get(
        CELESTRAK_VISUAL_URL,
        params=params,
        timeout=CELESTRAK_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    data = response.json()
    if not isinstance(data, list):
        raise ValueError("Resposta inesperada ao buscar satélites visuais.")
    return data


def build_satellite_objects(satellites_data: list[dict]):
    ts = load.timescale()
    satellites = []
    for fields in satellites_data:
        try:
            satellites.append(EarthSatellite.from_omm(ts, fields))
        except Exception:
            continue
    return ts, satellites


def _load_ephemeris():
    return load("de421.bsp")


def _satellite_passes_for_observer(
    satellite: EarthSatellite,
    observer,
    ts,
    eph,
    start_time_utc: datetime,
    end_time_utc: datetime,
) -> dict[str, list[dict]]:
    t0 = ts.from_datetime(start_time_utc)
    t1 = ts.from_datetime(end_time_utc)
    times, events = satellite.find_events(
        observer,
        t0,
        t1,
        altitude_degrees=MIN_PASS_ALTITUDE_DEGREES,
    )

    if len(times) == 0:
        return {"all_passes": [], "visual_passes": []}

    event_names = {
        0: "rise",
        1: "culminate",
        2: "set",
    }
    all_passes = []
    visual_passes = []
    current_pass: dict = {}

    for time_value, event_code in zip(times, events):
        event_name = event_names[event_code]
        current_pass[event_name] = time_value

        if event_name == "set":
            if {"rise", "culminate", "set"} <= current_pass.keys():
                culminate_time = current_pass["culminate"]
                sunlit = bool(satellite.at(culminate_time).is_sunlit(eph))
                sun_alt, _, _ = (
                    (eph["earth"] + observer)
                    .at(culminate_time)
                    .observe(eph["sun"])
                    .apparent()
                    .altaz()
                )
                topocentric = (satellite - observer).at(culminate_time)
                alt, az, _ = topocentric.altaz()
                pass_data = {
                    "name": satellite.name,
                    "rise_time": current_pass["rise"].utc_datetime(),
                    "peak_time": culminate_time.utc_datetime(),
                    "set_time": current_pass["set"].utc_datetime(),
                    "peak_altitude": alt.degrees,
                    "peak_azimuth": az.degrees,
                    "sunlit": sunlit,
                    "sun_altitude": sun_alt.degrees,
                }
                all_passes.append(pass_data)

                if (
                    alt.degrees >= MIN_VISUAL_ALTITUDE_DEGREES
                    and sunlit
                    and sun_alt.degrees <= SUN_ALTITUDE_LIMIT_DEGREES
                ):
                    visual_passes.append(pass_data)
            current_pass = {}

    return {
        "all_passes": all_passes,
        "visual_passes": visual_passes,
    }


def find_satellite_passes(
    latitude: float,
    longitude: float,
    height_m: float,
    when_local: datetime,
) -> dict[str, list[dict]]:
    if when_local.tzinfo is None:
        local_aware = when_local.astimezone()
    else:
        local_aware = when_local

    start_time_utc = local_aware.astimezone(timezone.utc)
    end_time_utc = start_time_utc + timedelta(hours=LOOKAHEAD_HOURS)

    satellites_data = fetch_visual_satellites()
    ts, satellites = build_satellite_objects(satellites_data)
    eph = _load_ephemeris()
    observer = wgs84.latlon(latitude, longitude, elevation_m=height_m)

    all_passes = []
    visual_passes = []
    for satellite in satellites:
        satellite_passes = _satellite_passes_for_observer(
            satellite=satellite,
            observer=observer,
            ts=ts,
            eph=eph,
            start_time_utc=start_time_utc,
            end_time_utc=end_time_utc,
        )
        all_passes.extend(satellite_passes["all_passes"])
        visual_passes.extend(satellite_passes["visual_passes"])

    all_passes.sort(key=lambda item: item["peak_time"])
    visual_passes.sort(key=lambda item: item["peak_time"])
    return {
        "all_passes": all_passes[:MAX_RESULTS],
        "visual_passes": visual_passes[:MAX_RESULTS],
    }
