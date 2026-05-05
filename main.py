from __future__ import annotations

from datetime import datetime

from astropy.coordinates import AltAz, EarthLocation, SkyCoord, get_body
from astropy.time import Time
from astroquery.simbad import Simbad
import astropy.units as u

from satellite_utils import find_visible_satellite_passes
from utils import (
    DEFAULT_LOCATION,
    describe_cloud_cover,
    fetch_device_location,
    fetch_cloud_cover,
    geocode_city,
    prompt_menu_choice,
    prompt_menu_with_body,
    prompt_observation_datetime,
    prompt_text,
    render_screen,
    verify_visibility,
)


PLANET_ALIASES = {
    "mercurio": "mercury",
    "mercúrio": "mercury",
    "venus": "venus",
    "vênus": "venus",
    "terra": "earth",
    "marte": "mars",
    "jupiter": "jupiter",
    "júpiter": "jupiter",
    "saturno": "saturn",
    "urano": "uranus",
    "urânio": "uranus",
    "netuno": "neptune",
    "lua": "moon",
    "sol": "sun",
}

SOLAR_SYSTEM_OBJECTS = [
    "Mercúrio",
    "Vênus",
    "Lua",
    "Marte",
    "Júpiter",
    "Saturno",
    "Urano",
    "Netuno",
]

CATALOG_OBJECTS = [
    "Sirius",
    "Canopus",
    "Arcturus",
    "Vega",
    "Capella",
    "Rigel",
    "Betelgeuse",
    "Aldebaran",
    "Antares",
    "Spica",
    "Procyon",
    "Pollux",
    "Fomalhaut",
    "Achernar",
]


def create_simbad_client() -> Simbad:
    simbad = Simbad()
    simbad.add_votable_fields("V")
    return simbad


def normalize_object_name(object_name: str) -> str:
    return object_name.strip().lower()


def resolve_solar_system_object(object_name: str) -> str | None:
    return PLANET_ALIASES.get(normalize_object_name(object_name))


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

    location = EarthLocation(
        lat=latitude * u.deg,
        lon=longitude * u.deg,
        height=height_m * u.m,
    )
    astropy_time = Time(observation_time)
    body_coord = get_body(body_name, astropy_time, location)

    ra = body_coord.ra.to_string(unit=u.hourangle, sep=" ", precision=2)
    dec = body_coord.dec.to_string(unit=u.deg, sep=" ", precision=2)

    return {
        "name": object_name.title(),
        "ra": ra,
        "dec": dec,
        "magnitude": None,
        "source": "Efemérides do Sistema Solar",
        "kind": "solar_system",
        "body_name": body_name,
    }


def get_deep_sky_object_data(object_name: str) -> dict:
    simbad = create_simbad_client()
    result = simbad.query_object(object_name)

    if result is not None and len(result) > 0:
        name = str(result["matched_id"][0]).replace("NAME ", "")
        ra = result["ra"][0]
        dec = result["dec"][0]
        magnitude = result["V"][0]

        clean_magnitude = (
            None
            if magnitude is None or getattr(magnitude, "mask", False)
            else float(magnitude)
        )

        return {
            "name": name,
            "ra": ra,
            "dec": dec,
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

    ra = fallback_coord.ra.to_string(unit=u.hourangle, sep=" ", precision=2)
    dec = fallback_coord.dec.to_string(unit=u.deg, sep=" ", precision=2)
    return {
        "name": object_name,
        "ra": ra,
        "dec": dec,
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
    solar_system_name = resolve_solar_system_object(object_name)
    if solar_system_name is not None:
        return get_solar_system_object_data(
            object_name=object_name,
            observation_time=observation_time,
            latitude=latitude,
            longitude=longitude,
            height_m=height_m,
        )

    return get_deep_sky_object_data(object_name)


def create_location(latitude: float, longitude: float, height_m: float) -> EarthLocation:
    return EarthLocation(
        lat=latitude * u.deg,
        lon=longitude * u.deg,
        height=height_m * u.m,
    )


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

    altaz = sky_object.transform_to(
        AltAz(obstime=astropy_time, location=location)
    )

    return {
        "altitude": altaz.alt.degree,
        "azimuth": altaz.az.degree,
    }


def collect_location_preferences() -> dict:
    location_mode = prompt_menu_with_body(
        "Local da Observação",
        ["Como você quer informar o local da observação?"],
        [
            "Usar minha cidade automaticamente",
            "Informar outra cidade",
        ],
    )

    if location_mode == 1:
        render_screen(
            "Local da Observação",
            ["Tentando detectar sua cidade automaticamente..."],
        )
        device_location = fetch_device_location()
        if device_location["available"]:
            selected_city = device_location["city"]
            confirm_choice = prompt_menu_with_body(
                "Local da Observação",
                [f"Cidade detectada: {selected_city}", "Deseja usar esta cidade?"],
                [
                    "Sim, usar esta cidade",
                    "Não, quero informar outra cidade",
                ],
            )
            if confirm_choice == 1:
                return device_location

            city_name = prompt_text(
                "Digite o nome da cidade para a observação.",
                DEFAULT_LOCATION["city"],
                title="Local da Observação",
            )
            return prompt_city_until_valid(city_name)

        render_screen(
            "Local da Observação",
            [device_location["message"], "", "Vamos informar a cidade manualmente."],
        )
        input("Pressione Enter para continuar...")

    city_name = prompt_text(
        "Digite o nome da cidade para a observação.",
        DEFAULT_LOCATION["city"],
        title="Local da Observação",
    )
    return prompt_city_until_valid(city_name)


def prompt_city_until_valid(initial_city_name: str) -> dict:
    city_name = initial_city_name

    while True:
        render_screen(
            "Local da Observação",
            [f"Buscando a cidade: {city_name}"],
        )
        location_data = geocode_city(city_name)
        if location_data["available"]:
            render_screen(
                "Local da Observação",
                [f"Cidade selecionada: {location_data['city']}"],
            )
            input("Pressione Enter para continuar...")
            return location_data

        render_screen(
            "Local da Observação",
            [location_data["message"]],
        )
        input("Pressione Enter para tentar outra cidade...")
        city_name = prompt_text(
            "Digite o nome da cidade para a observação.",
            DEFAULT_LOCATION["city"],
            title="Local da Observação",
        )


def collect_search_preferences() -> dict:
    location_data = collect_location_preferences()
    observation_time = prompt_observation_datetime()

    while True:
        object_name = prompt_text(
            "Qual estrela, planeta ou objeto você quer procurar?",
            "Sirius",
            title="Buscar Objeto",
        )
        render_screen(
            "Buscar Objeto",
            [f'Consultando "{object_name}"...'],
        )
        try:
            object_data = get_object_data(
                object_name=object_name,
                observation_time=observation_time,
                latitude=location_data["latitude"],
                longitude=location_data["longitude"],
                height_m=location_data["height_m"],
            )
            return {
                "object_name": object_name,
                "object_data": object_data,
                "observation_time": observation_time,
                **location_data,
            }
        except ValueError:
            render_screen(
                "Buscar Objeto",
                ["Objeto não encontrado. Tente outro nome."],
            )
            input("Pressione Enter para continuar...")


def print_report(user_input: dict, object_data: dict, sky_position: dict, weather: dict) -> None:
    cloud_cover = weather.get("cloud_cover") if weather.get("available") else None
    visibility_messages = verify_visibility(
        altitude=sky_position["altitude"],
        magnitude=object_data["magnitude"],
        cloud_cover=cloud_cover,
    )

    lines = [
        f"Objeto: {object_data['name']}",
        f"Cidade: {user_input['city']}",
        f"Fonte da consulta: {object_data['source']}",
        f"Ascensão reta: {object_data['ra']}",
        f"Declinação: {object_data['dec']}",
        (
            "Magnitude visual: não disponível"
            if object_data["magnitude"] is None
            else f"Magnitude visual: {object_data['magnitude']:.2f}"
        ),
        f"Horário da observação: {user_input['observation_time']}",
        f"Altitude no céu: {sky_position['altitude']:.2f} graus",
        f"Azimute: {sky_position['azimuth']:.2f} graus",
    ]

    if weather.get("available"):
        lines.extend(
            [
                f"Cobertura de nuvens: {weather['cloud_cover']:.1f}%",
                describe_cloud_cover(weather["cloud_cover"]),
            ]
        )
        if weather.get("time"):
            lines.append(f"Horário do dado meteorológico: {weather['time']}")
    else:
        lines.append(weather["message"])

    lines.extend(["", "Análise de visibilidade:"])
    lines.extend(visibility_messages)

    render_screen("Resultado da Consulta", lines)
    input("\nPressione Enter para voltar ao terminal...")


def build_visibility_summary(
    object_data: dict,
    sky_position: dict,
) -> str:
    altitude = sky_position["altitude"]
    magnitude = object_data["magnitude"]

    if altitude < 0:
        status = "❌ Não visível"
    elif altitude < 10:
        status = "⚠️ Muito baixo"
    elif magnitude is not None and magnitude > 6:
        status = "⚠️ Fraco"
    else:
        status = "✅ Visível"

    magnitude_text = "N/D" if magnitude is None else f"{magnitude:.2f}"
    return (
        f"{status} | {object_data['name']} | "
        f"Altitude: {altitude:.2f}° | Azimute: {sky_position['azimuth']:.2f}° | "
        f"Magnitude: {magnitude_text}"
    )


def list_visible_objects_now() -> None:
    location_data = collect_location_preferences()
    observation_time = datetime.now()

    render_screen(
        "Objetos Visíveis no Momento",
        [f"Buscando objetos visíveis para {location_data['city']}..."],
    )

    weather = fetch_cloud_cover(
        latitude=location_data["latitude"],
        longitude=location_data["longitude"],
        observation_time=observation_time,
    )

    visible_objects = []
    candidate_names = SOLAR_SYSTEM_OBJECTS + CATALOG_OBJECTS

    for object_name in candidate_names:
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

    lines = [
        f"Cidade: {location_data['city']}",
        f"Horário da observação: {observation_time}",
    ]

    if weather.get("available"):
        lines.append(f"Cobertura de nuvens: {weather['cloud_cover']:.1f}%")
        lines.append(describe_cloud_cover(weather["cloud_cover"]))
    else:
        lines.append(weather["message"])

    lines.append("")
    if not visible_objects:
        lines.append("❌ Nenhum objeto da lista de referência está acima do horizonte agora.")
    else:
        lines.append("Objetos acima do horizonte:")
        lines.extend(
            build_visibility_summary(object_data, sky_position)
            for object_data, sky_position in visible_objects
        )

    render_screen("Objetos Visíveis no Momento", lines)
    input("\nPressione Enter para voltar ao terminal...")


def list_visible_satellites() -> None:
    location_data = collect_location_preferences()
    observation_time = datetime.now()

    render_screen(
        "Satélites Visíveis",
        [
            f"Buscando próximas passagens visíveis para {location_data['city']}...",
            "Isso pode levar alguns segundos.",
        ],
    )

    try:
        passes = find_visible_satellite_passes(
            latitude=location_data["latitude"],
            longitude=location_data["longitude"],
            height_m=location_data["height_m"],
            when_local=observation_time,
        )
    except Exception as error:
        render_screen(
            "Satélites Visíveis",
            [
                "Não foi possível calcular as passagens de satélites.",
                f"Detalhes: {error}",
            ],
        )
        input("\nPressione Enter para voltar ao terminal...")
        return

    lines = [
        f"Cidade: {location_data['city']}",
        f"Janela analisada: próximas 12 horas a partir de {observation_time}",
        "Critério: apenas passagens visualmente favoráveis a olho nu.",
        "O satélite precisa estar iluminado pelo Sol enquanto o céu local já está escuro.",
        "",
    ]

    if not passes:
        lines.append(
            "❌ Nenhuma passagem visual clara foi encontrada na janela analisada."
        )
        lines.append(
            "Isso pode acontecer por nuvens, pouca altura, sombra da Terra ou céu muito claro."
        )
    else:
        first_pass = passes[0]["rise_time"].astimezone()
        delta = first_pass - observation_time.astimezone()
        total_minutes = max(0, int(delta.total_seconds() // 60))
        hours = total_minutes // 60
        minutes = total_minutes % 60

        lines.append(
            f"Próxima passagem visível começa em cerca de {hours}h {minutes}min."
        )
        lines.append(
            "Se não apareceu nada perto de agora, isso costuma ser normal fora do amanhecer/entardecer."
        )
        lines.append("")
        lines.append("Próximas passagens visualmente favoráveis:")
        for satellite_pass in passes:
            lines.extend(
                [
                    f"🛰️ {satellite_pass['name']}",
                    (
                        f"   Surge: {satellite_pass['rise_time'].astimezone():%d/%m %H:%M:%S} | "
                        f"Pico: {satellite_pass['peak_time'].astimezone():%d/%m %H:%M:%S} | "
                        f"Some: {satellite_pass['set_time'].astimezone():%d/%m %H:%M:%S}"
                    ),
                    (
                        f"   Altitude máxima: {satellite_pass['peak_altitude']:.1f}° | "
                        f"Azimute no pico: {satellite_pass['peak_azimuth']:.1f}°"
                    ),
                    "",
                ]
            )

    render_screen("Satélites Visíveis", lines)
    input("\nPressione Enter para voltar ao terminal...")


def search_single_object() -> None:
    user_input = collect_search_preferences()
    object_data = user_input["object_data"]

    render_screen(
        "Resultado da Consulta",
        [f"Calculando posição de {object_data['name']}..."],
    )
    sky_position = calculate_local_coordinates(
        object_data=object_data,
        latitude=user_input["latitude"],
        longitude=user_input["longitude"],
        height_m=user_input["height_m"],
        observation_time=user_input["observation_time"],
    )
    weather = fetch_cloud_cover(
        latitude=user_input["latitude"],
        longitude=user_input["longitude"],
        observation_time=user_input["observation_time"],
    )
    print_report(user_input, object_data, sky_position, weather)


def main() -> None:
    choice = prompt_menu_choice(
        "Menu Inicial",
        [
            "Buscar objetos no céu",
            "Listar objetos visíveis no momento",
            "Ver satélites visíveis e próximas passagens",
        ],
        show_galaxy=True,
    )

    if choice == 1:
        search_single_object()
    elif choice == 2:
        list_visible_objects_now()
    else:
        list_visible_satellites()


if __name__ == "__main__":
    try:
        main()
    except ValueError as error:
        render_screen("Erro", [f"Erro: {error}"])
    except KeyboardInterrupt:
        render_screen("Encerrado", ["Execução interrompida pelo usuário."])
