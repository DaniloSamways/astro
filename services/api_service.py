from __future__ import annotations

from datetime import datetime

from config import DEFAULT_LOCATION
from services.location_service import (
    describe_cloud_cover,
    fetch_cloud_cover,
    fetch_device_location,
    geocode_city,
)


def resolve_location_for_api(city: str | None = None, auto: bool = False) -> dict:
    if auto:
        location_data = fetch_device_location()
        if location_data.get("available"):
            return location_data
        raise ValueError(location_data["message"])

    if city:
        location_data = geocode_city(city)
        if location_data.get("available"):
            return location_data
        raise ValueError(location_data["message"])

    default_location = geocode_city(DEFAULT_LOCATION["city"])
    if default_location.get("available"):
        return default_location
    raise ValueError("Não foi possível resolver a localização padrão.")


def _serialize_satellite_pass(satellite_pass: dict) -> dict:
    return {
        **satellite_pass,
        "rise_time": satellite_pass["rise_time"].isoformat(),
        "peak_time": satellite_pass["peak_time"].isoformat(),
        "set_time": satellite_pass["set_time"].isoformat(),
    }


def get_object_report(
    *,
    object_name: str,
    city: str,
    latitude: float,
    longitude: float,
    height_m: float,
    observation_time: datetime,
) -> dict:
    from services.object_service import (
        calculate_local_coordinates,
        get_object_data,
    )
    from services.visibility_service import verify_visibility

    object_data = get_object_data(
        object_name=object_name,
        observation_time=observation_time,
        latitude=latitude,
        longitude=longitude,
        height_m=height_m,
    )
    sky_position = calculate_local_coordinates(
        object_data=object_data,
        latitude=latitude,
        longitude=longitude,
        height_m=height_m,
        observation_time=observation_time,
    )
    weather = fetch_cloud_cover(
        latitude=latitude,
        longitude=longitude,
        observation_time=observation_time,
    )
    cloud_cover = weather.get("cloud_cover") if weather.get("available") else None

    return {
        "city": city,
        "observation_time": observation_time.isoformat(),
        "object": object_data,
        "sky_position": sky_position,
        "weather": {
            **weather,
            "description": describe_cloud_cover(cloud_cover),
        },
        "visibility_messages": verify_visibility(
            altitude=sky_position["altitude"],
            magnitude=object_data["magnitude"],
            cloud_cover=cloud_cover,
        ),
    }


def get_visible_objects_report(
    *,
    city: str,
    latitude: float,
    longitude: float,
    height_m: float,
    observation_time: datetime,
) -> dict:
    from services.object_service import list_reference_visible_objects
    from services.visibility_service import build_visibility_summary

    visible_objects = list_reference_visible_objects(
        {
            "city": city,
            "latitude": latitude,
            "longitude": longitude,
            "height_m": height_m,
        },
        observation_time,
    )
    weather = fetch_cloud_cover(
        latitude=latitude,
        longitude=longitude,
        observation_time=observation_time,
    )
    return {
        "city": city,
        "observation_time": observation_time.isoformat(),
        "weather": weather,
        "weather_description": describe_cloud_cover(
            weather.get("cloud_cover") if weather.get("available") else None
        ),
        "objects": [
            {
                "object": object_data,
                "sky_position": sky_position,
                "summary": build_visibility_summary(object_data, sky_position),
            }
            for object_data, sky_position in visible_objects
        ],
    }


def get_satellite_passes_report(
    *,
    city: str,
    latitude: float,
    longitude: float,
    height_m: float,
    observation_time: datetime,
) -> dict:
    from services.satellite_service import find_satellite_passes

    satellite_passes = find_satellite_passes(
        latitude=latitude,
        longitude=longitude,
        height_m=height_m,
        when_local=observation_time,
    )
    return {
        "city": city,
        "observation_time": observation_time.isoformat(),
        "lookahead_hours": 12,
        "all_passes": [
            _serialize_satellite_pass(item) for item in satellite_passes["all_passes"]
        ],
        "visual_passes": [
            _serialize_satellite_pass(item)
            for item in satellite_passes["visual_passes"]
        ],
    }
