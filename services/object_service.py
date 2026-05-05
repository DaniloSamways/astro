from __future__ import annotations

from datetime import datetime

from astropy.coordinates import AltAz, EarthLocation, SkyCoord, get_body
from astropy.time import Time
from astroquery.simbad import Simbad
import astropy.units as u

from config import CATALOG_OBJECTS, PLANET_ALIASES, SOLAR_SYSTEM_OBJECTS


def create_simbad_client() -> Simbad:
    simbad = Simbad()
    simbad.add_votable_fields("V")
    return simbad


def normalize_object_name(object_name: str) -> str:
    return object_name.strip().lower()


def resolve_solar_system_object(object_name: str) -> str | None:
    return PLANET_ALIASES.get(normalize_object_name(object_name))


def create_location(latitude: float, longitude: float, height_m: float) -> EarthLocation:
    return EarthLocation(
        lat=latitude * u.deg,
        lon=longitude * u.deg,
        height=height_m * u.m,
    )


def get_solar_system_object_data(
    object_name: str,
    observation_time: datetime,
    latitude: float,
    longitude: float,
    height_m: float,
) -> dict:
    body_name = resolve_solar_system_object(object_name)
    if body_name is None:
        raise ValueError(f'"{object_name}" não é um objeto do Sistema Solar suportado.')

    location = create_location(latitude, longitude, height_m)
    body_coord = get_body(body_name, Time(observation_time), location)

    return {
        "name": object_name.title(),
        "ra": body_coord.ra.to_string(unit=u.hourangle, sep=" ", precision=2),
        "dec": body_coord.dec.to_string(unit=u.deg, sep=" ", precision=2),
        "magnitude": None,
        "source": "Efemérides do Sistema Solar",
        "kind": "solar_system",
        "body_name": body_name,
    }


def get_deep_sky_object_data(object_name: str) -> dict:
    result = create_simbad_client().query_object(object_name)

    if result is not None and len(result) > 0:
        magnitude = result["V"][0]
        clean_magnitude = (
            None
            if magnitude is None or getattr(magnitude, "mask", False)
            else float(magnitude)
        )
        return {
            "name": str(result["matched_id"][0]).replace("NAME ", ""),
            "ra": result["ra"][0],
            "dec": result["dec"][0],
            "magnitude": clean_magnitude,
            "source": "SIMBAD",
            "kind": "fixed",
        }

    try:
        fallback_coord = SkyCoord.from_name(object_name)
    except Exception as error:
        raise ValueError(
            f'Nenhum objeto foi encontrado para o nome "{object_name}". '
            f"Detalhes da busca: {error}"
        ) from error

    return {
        "name": object_name,
        "ra": fallback_coord.ra.to_string(unit=u.hourangle, sep=" ", precision=2),
        "dec": fallback_coord.dec.to_string(unit=u.deg, sep=" ", precision=2),
        "magnitude": None,
        "source": "Resolvedor de nomes",
        "kind": "fixed",
    }


def get_object_data(
    object_name: str,
    observation_time: datetime,
    latitude: float,
    longitude: float,
    height_m: float,
) -> dict:
    if resolve_solar_system_object(object_name) is not None:
        return get_solar_system_object_data(
            object_name=object_name,
            observation_time=observation_time,
            latitude=latitude,
            longitude=longitude,
            height_m=height_m,
        )
    return get_deep_sky_object_data(object_name)


def calculate_local_coordinates(
    object_data: dict,
    latitude: float,
    longitude: float,
    height_m: float,
    observation_time: datetime,
) -> dict:
    location = create_location(latitude, longitude, height_m)
    astropy_time = Time(observation_time)

    if object_data["kind"] == "solar_system":
        sky_object = get_body(object_data["body_name"], astropy_time, location)
    else:
        sky_object = SkyCoord(
            object_data["ra"],
            object_data["dec"],
            unit=(u.hourangle, u.deg),
        )

    altaz = sky_object.transform_to(AltAz(obstime=astropy_time, location=location))
    return {
        "altitude": altaz.alt.degree,
        "azimuth": altaz.az.degree,
    }


def list_reference_visible_objects(location_data: dict, observation_time: datetime) -> list[tuple[dict, dict]]:
    visible_objects = []
    for object_name in SOLAR_SYSTEM_OBJECTS + CATALOG_OBJECTS:
        try:
            object_data = get_object_data(
                object_name=object_name,
                observation_time=observation_time,
                latitude=location_data["latitude"],
                longitude=location_data["longitude"],
                height_m=location_data["height_m"],
            )
            sky_position = calculate_local_coordinates(
                object_data=object_data,
                latitude=location_data["latitude"],
                longitude=location_data["longitude"],
                height_m=location_data["height_m"],
                observation_time=observation_time,
            )
            if sky_position["altitude"] > 0:
                visible_objects.append((object_data, sky_position))
        except Exception:
            continue

    visible_objects.sort(key=lambda item: item[1]["altitude"], reverse=True)
    return visible_objects
