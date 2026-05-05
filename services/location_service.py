from __future__ import annotations

from datetime import datetime

import requests

from config import (
    DEFAULT_LOCATION,
    GEOCODING_TIMEOUT_SECONDS,
    IP_GEOLOCATION_TIMEOUT_SECONDS,
    OPEN_METEO_TIMEOUT_SECONDS,
)


def fetch_elevation(latitude: float, longitude: float) -> float | None:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m",
    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=OPEN_METEO_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        elevation = response.json().get("elevation")
        return None if elevation is None else float(elevation)
    except requests.RequestException:
        return None


def fetch_device_location() -> dict:
    url = "http://ip-api.com/json/"

    try:
        response = requests.get(url, timeout=IP_GEOLOCATION_TIMEOUT_SECONDS)
        response.raise_for_status()
        data = response.json()

        if data.get("status") != "success":
            return {
                "available": False,
                "message": "Não foi possível obter a localização automática.",
            }

        latitude = float(data["lat"])
        longitude = float(data["lon"])
        elevation = fetch_elevation(latitude, longitude)
        city_parts = [data.get("city"), data.get("regionName"), data.get("country")]

        return {
            "available": True,
            "city": ", ".join(part for part in city_parts if part)
            or DEFAULT_LOCATION["city"],
            "latitude": latitude,
            "longitude": longitude,
            "height_m": elevation if elevation is not None else DEFAULT_LOCATION["height_m"],
        }
    except requests.RequestException as error:
        return {
            "available": False,
            "message": (
                "Não foi possível consultar a localização automática. "
                f"Detalhes: {error}"
            ),
        }


def geocode_city(city_name: str) -> dict:
    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": city_name,
        "count": 1,
        "language": "pt",
        "format": "json",
    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=GEOCODING_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        results = response.json().get("results", [])

        if not results:
            return {
                "available": False,
                "message": f'Não foi possível encontrar a cidade "{city_name}".',
            }

        result = results[0]
        latitude = float(result["latitude"])
        longitude = float(result["longitude"])
        elevation = fetch_elevation(latitude, longitude)
        city_parts = [result.get("name"), result.get("admin1"), result.get("country")]

        return {
            "available": True,
            "city": ", ".join(part for part in city_parts if part),
            "latitude": latitude,
            "longitude": longitude,
            "height_m": elevation if elevation is not None else DEFAULT_LOCATION["height_m"],
        }
    except requests.RequestException as error:
        return {
            "available": False,
            "message": (
                "Não foi possível consultar a cidade informada. "
                f"Detalhes: {error}"
            ),
        }


def fetch_cloud_cover(
    latitude: float,
    longitude: float,
    observation_time: datetime,
) -> dict:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "cloud_cover",
        "timezone": "auto",
    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=OPEN_METEO_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        hourly_data = response.json().get("hourly", {})
        times = hourly_data.get("time", [])
        cloud_cover_values = hourly_data.get("cloud_cover", [])

        if not times or not cloud_cover_values:
            return {
                "available": False,
                "message": "Não foi possível obter a previsão de nuvens.",
            }

        target_time = observation_time.replace(minute=0, second=0, microsecond=0)
        target_tzinfo = target_time.tzinfo

        def parse_forecast_time(raw_time: str) -> datetime:
            parsed_time = datetime.fromisoformat(raw_time)
            if parsed_time.tzinfo is None and target_tzinfo is not None:
                return parsed_time.replace(tzinfo=target_tzinfo)
            if parsed_time.tzinfo is not None and target_tzinfo is None:
                return parsed_time.replace(tzinfo=None)
            return parsed_time

        best_index = min(
            range(len(times)),
            key=lambda index: abs(parse_forecast_time(times[index]) - target_time),
        )
        best_time = parse_forecast_time(times[best_index])

        if abs(best_time - target_time).total_seconds() > 12 * 3600:
            return {
                "available": False,
                "message": (
                    "Não há previsão de nuvens suficientemente próxima do "
                    "horário informado."
                ),
            }

        cloud_cover = cloud_cover_values[best_index]
        if cloud_cover is None:
            return {
                "available": False,
                "message": "Não foi possível obter a cobertura de nuvens.",
            }

        return {
            "available": True,
            "cloud_cover": float(cloud_cover),
            "time": times[best_index],
        }
    except requests.RequestException as error:
        return {
            "available": False,
            "message": (
                "Não foi possível consultar a previsão do clima agora. "
                f"Detalhes: {error}"
            ),
        }


def describe_cloud_cover(cloud_cover: float | None) -> str:
    if cloud_cover is None:
        return "Cobertura de nuvens indisponível."
    if cloud_cover < 25:
        return "Céu limpo ou com poucas nuvens."
    if cloud_cover < 60:
        return "Há nuvens moderadas no céu."
    if cloud_cover < 85:
        return "O céu está bastante nublado."
    return "O céu está muito nublado."
