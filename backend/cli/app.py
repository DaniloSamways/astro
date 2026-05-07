from __future__ import annotations

from datetime import datetime

from config import DEFAULT_LOCATION
from services.location_service import (
    describe_cloud_cover,
    fetch_cloud_cover,
    fetch_device_location,
    geocode_city,
)
from services.object_service import (
    calculate_local_coordinates,
    get_object_data,
    list_reference_visible_objects,
)
from services.satellite_service import find_satellite_passes
from services.visibility_service import (
    build_visibility_summary,
    verify_visibility,
)
from cli.terminal_ui import (
    prompt_menu_choice,
    prompt_menu_with_body,
    prompt_observation_datetime,
    prompt_text,
    render_screen,
)


def prompt_city_until_valid(initial_city_name: str) -> dict:
    city_name = initial_city_name
    while True:
        render_screen("Local da Observação", [f"Buscando a cidade: {city_name}"])
        location_data = geocode_city(city_name)
        if location_data["available"]:
            render_screen("Local da Observação", [f"Cidade selecionada: {location_data['city']}"])
            input("Pressione Enter para continuar...")
            return location_data
        render_screen("Local da Observação", [location_data["message"]])
        input("Pressione Enter para tentar outra cidade...")
        city_name = prompt_text(
            "Digite o nome da cidade para a observação.",
            DEFAULT_LOCATION["city"],
            title="Local da Observação",
        )


def collect_location_preferences() -> dict:
    choice = prompt_menu_with_body(
        "Local da Observação",
        ["Como você quer informar o local da observação?"],
        ["Usar minha cidade automaticamente", "Informar outra cidade"],
    )

    if choice == 1:
        render_screen("Local da Observação", ["Tentando detectar sua cidade automaticamente..."])
        device_location = fetch_device_location()
        if device_location["available"]:
            confirm = prompt_menu_with_body(
                "Local da Observação",
                [
                    f"Cidade detectada: {device_location['city']}",
                    "Deseja usar esta cidade?",
                ],
                ["Sim, usar esta cidade", "Não, quero informar outra cidade"],
            )
            if confirm == 1:
                return device_location
        else:
            render_screen(
                "Local da Observação",
                [device_location["message"], "", "Vamos informar a cidade manualmente."],
            )
            input("Pressione Enter para continuar...")

    return prompt_city_until_valid(
        prompt_text(
            "Digite o nome da cidade para a observação.",
            DEFAULT_LOCATION["city"],
            title="Local da Observação",
        )
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
        render_screen("Buscar Objeto", [f'Consultando "{object_name}"...'])
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
            render_screen("Buscar Objeto", ["Objeto não encontrado. Tente outro nome."])
            input("Pressione Enter para continuar...")


def show_object_report(user_input: dict, object_data: dict, sky_position: dict, weather: dict) -> None:
    cloud_cover = weather.get("cloud_cover") if weather.get("available") else None
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
    lines.extend(
        verify_visibility(
            altitude=sky_position["altitude"],
            magnitude=object_data["magnitude"],
            cloud_cover=cloud_cover,
        )
    )
    render_screen("Resultado da Consulta", lines)
    input("\nPressione Enter para voltar ao terminal...")


def search_single_object() -> None:
    user_input = collect_search_preferences()
    render_screen("Resultado da Consulta", [f"Calculando posição de {user_input['object_data']['name']}..."])
    sky_position = calculate_local_coordinates(
        object_data=user_input["object_data"],
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
    show_object_report(user_input, user_input["object_data"], sky_position, weather)


def list_visible_objects_now() -> None:
    location_data = collect_location_preferences()
    observation_time = datetime.now()
    render_screen("Objetos Visíveis no Momento", [f"Buscando objetos visíveis para {location_data['city']}..."])
    weather = fetch_cloud_cover(
        latitude=location_data["latitude"],
        longitude=location_data["longitude"],
        observation_time=observation_time,
    )
    visible_objects = list_reference_visible_objects(location_data, observation_time)
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
        satellite_passes = find_satellite_passes(
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

    all_passes = satellite_passes["all_passes"]
    visual_passes = satellite_passes["visual_passes"]
    lines = [
        f"Cidade: {location_data['city']}",
        f"Janela analisada: próximas 12 horas a partir de {observation_time}",
        "Abaixo, o programa separa o que apenas passa no céu do que tende a ser visível a olho nu.",
        "",
        "Satélites passando acima do horizonte:",
    ]
    if not all_passes:
        lines.append("❌ Nenhuma passagem acima do horizonte foi encontrada.")
    else:
        for satellite_pass in all_passes:
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
                    (
                        "   Estado de visibilidade: iluminado pelo Sol"
                        if satellite_pass["sunlit"]
                        else "   Estado de visibilidade: na sombra da Terra"
                    ),
                    "",
                ]
            )

    lines.append("Satélites com chance real de observação a olho nu:")
    if not visual_passes:
        lines.extend(
            [
                "❌ Nenhuma passagem visual clara foi encontrada na janela analisada.",
                "Isso pode acontecer por nuvens, pouca altura, sombra da Terra ou céu muito claro.",
            ]
        )
    else:
        first_pass = visual_passes[0]["rise_time"].astimezone()
        delta = first_pass - observation_time.astimezone()
        total_minutes = max(0, int(delta.total_seconds() // 60))
        lines.extend(
            [
                f"Próxima passagem visível começa em cerca de {total_minutes // 60}h {total_minutes % 60}min.",
                "Se não apareceu nada perto de agora, isso costuma ser normal fora do amanhecer/entardecer.",
                "",
            ]
        )
        for satellite_pass in visual_passes:
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
