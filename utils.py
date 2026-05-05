from __future__ import annotations

from datetime import datetime
import os
import sys
import termios
import tty

import requests


DEFAULT_LOCATION = {
    "city": "São Paulo",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "height_m": 760.0,
}

OPEN_METEO_TIMEOUT_SECONDS = 10
IP_GEOLOCATION_TIMEOUT_SECONDS = 10
GEOCODING_TIMEOUT_SECONDS = 10

GALAXY_ART = r'''
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣀⡴⢧⣀⠀⠀⣀⣠⠤⠤⠤⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⠏⢀⡴⠊⠁⠀⠀⠀⠀⠀⠀⠈⠙⠦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢶⣶⣒⣶⠦⣤⣀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣟⠲⡌⠙⢦⠈⢧⠀
⠀⠀⠀⣠⢴⡾⢟⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡴⢃⡠⠋⣠⠋⠀
⠐⠀⠞⣱⠋⢰⠁⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⠤⢖⣋⡥⢖⣫⠔⠋⠀⠀⠀
⠈⠠⡀⠹⢤⣈⣙⠚⠶⠤⠤⠤⠴⠶⣒⣒⣚⣩⠭⢵⣒⣻⠭⢖⠏⠁⢀⣀⠀⠀⠀⠀
⠠⠀⠈⠓⠒⠦⠭⠭⠭⣭⠭⠭⠭⠭⠿⠓⠒⠛⠉⠉⠀⠀⣠⠏⠀⠀⠘⠞⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢤⣀⠀⠀⠀⠀⠀⠀⣀⡤⠞⠁⠀⣰⣆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠘⠿⠀⠀⠀⠀⠀⠈⠉⠙⠒⠒⠛⠉⠁⠀⠀⠀⠉⢳⡞⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀'''


def clear_terminal() -> None:
    os.system("cls" if os.name == "nt" else "clear")


def render_screen(title: str, body_lines: list[str] | None = None, show_galaxy: bool = False) -> None:
    clear_terminal()
    if show_galaxy:
        print(GALAXY_ART)
    print(f"=== {title} ===\n")
    if body_lines:
        for line in body_lines:
            print(line)


def _read_key() -> str:
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        first = sys.stdin.read(1)
        if first == "\x1b":
            second = sys.stdin.read(1)
            third = sys.stdin.read(1)
            return first + second + third
        return first
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)


def prompt_menu_choice(title: str, options: list[str], show_galaxy: bool = False) -> int:
    selected_index = 0

    while True:
        lines = [
            "Use as setas para navegar e Enter para confirmar.",
            "",
        ]
        for index, option in enumerate(options):
            prefix = "➜" if index == selected_index else " "
            lines.append(f"{prefix} {option}")

        render_screen(title, lines, show_galaxy=show_galaxy)
        key = _read_key()

        if key == "\x1b[A":
            selected_index = (selected_index - 1) % len(options)
        elif key == "\x1b[B":
            selected_index = (selected_index + 1) % len(options)
        elif key in {"\r", "\n"}:
            return selected_index + 1


def prompt_menu_with_body(
    title: str,
    body_lines: list[str],
    options: list[str],
    show_galaxy: bool = False,
) -> int:
    selected_index = 0

    while True:
        lines = [*body_lines, "", "Use as setas para navegar e Enter para confirmar.", ""]
        for index, option in enumerate(options):
            prefix = "➜" if index == selected_index else " "
            lines.append(f"{prefix} {option}")

        render_screen(title, lines, show_galaxy=show_galaxy)
        key = _read_key()

        if key == "\x1b[A":
            selected_index = (selected_index - 1) % len(options)
        elif key == "\x1b[B":
            selected_index = (selected_index + 1) % len(options)
        elif key in {"\r", "\n"}:
            return selected_index + 1


def prompt_text(message: str, default: str | None = None, title: str = "Entrada") -> str:
    while True:
        lines = [message]
        if default:
            lines.append(f"Pressione Enter para usar o padrão: {default}")
        render_screen(title, lines)

        prompt = "> " if not default else f"[{default}] > "
        value = input(prompt).strip()
        if value:
            return value
        if default is not None:
            return default


def prompt_yes_no(message: str, default: bool = True, title: str = "Confirmação") -> bool:
    options = ["Sim", "Não"] if default else ["Não", "Sim"]
    choice = prompt_menu_with_body(title, [message], options)

    if default:
        return choice == 1
    return choice == 2


def prompt_observation_datetime() -> datetime:
    use_now = prompt_menu_choice(
        "Horário da Observação",
        [
            "Observar agora",
            "Informar outra data e horário",
        ],
    )

    if use_now == 1:
        return datetime.now()

    while True:
        render_screen(
            "Horário da Observação",
            [
                "Informe a data e hora da observação no formato DD/MM/AAAA HH:MM.",
                "Exemplo: 04/05/2026 21:30",
            ],
        )
        raw_value = input("> ").strip()
        try:
            return datetime.strptime(raw_value, "%d/%m/%Y %H:%M")
        except ValueError:
            render_screen(
                "Horário da Observação",
                [
                    "Formato inválido.",
                    "Use o formato DD/MM/AAAA HH:MM.",
                ],
            )
            input("Pressione Enter para tentar novamente...")


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
        data = response.json()
        elevation = data.get("elevation")
        if elevation is None:
            return None
        return float(elevation)
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

        city_parts = [
            data.get("city"),
            data.get("regionName"),
            data.get("country"),
        ]
        city_name = ", ".join(part for part in city_parts if part)

        return {
            "available": True,
            "city": city_name or DEFAULT_LOCATION["city"],
            "latitude": latitude,
            "longitude": longitude,
            "height_m": (
                elevation if elevation is not None else DEFAULT_LOCATION["height_m"]
            ),
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
        data = response.json()
        results = data.get("results", [])

        if not results:
            return {
                "available": False,
                "message": f'Não foi possível encontrar a cidade "{city_name}".',
            }

        result = results[0]
        latitude = float(result["latitude"])
        longitude = float(result["longitude"])
        elevation = fetch_elevation(latitude, longitude)

        city_parts = [
            result.get("name"),
            result.get("admin1"),
            result.get("country"),
        ]
        resolved_city_name = ", ".join(part for part in city_parts if part)

        return {
            "available": True,
            "city": resolved_city_name,
            "latitude": latitude,
            "longitude": longitude,
            "height_m": (
                elevation if elevation is not None else DEFAULT_LOCATION["height_m"]
            ),
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
        data = response.json()
        hourly_data = data.get("hourly", {})
        times = hourly_data.get("time", [])
        cloud_cover_values = hourly_data.get("cloud_cover", [])

        if not times or not cloud_cover_values:
            return {
                "available": False,
                "message": "Não foi possível obter a previsão de nuvens.",
            }

        target_time = observation_time.replace(
            minute=0,
            second=0,
            microsecond=0,
        )
        best_index = min(
            range(len(times)),
            key=lambda index: abs(
                datetime.fromisoformat(times[index]) - target_time
            ),
        )
        best_time = datetime.fromisoformat(times[best_index])

        if abs(best_time - target_time).total_seconds() > 12 * 3600:
            return {
                "available": False,
                "message": (
                    "Não há previsão de nuvens suficientemente próxima do "
                    "horário informado."
                ),
            }

        cloud_cover = cloud_cover_values[best_index]
        forecast_time = times[best_index]

        if cloud_cover is None:
            return {
                "available": False,
                "message": "Não foi possível obter a cobertura de nuvens.",
            }

        return {
            "available": True,
            "cloud_cover": float(cloud_cover),
            "time": forecast_time,
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


def verify_visibility(
    altitude: float,
    magnitude: float | None,
    cloud_cover: float | None,
) -> list[str]:
    messages = []

    if altitude < 0:
        messages.append("❌ Não está visível: o objeto está abaixo do horizonte.")
        messages.append(
            f"📍 Altitude atual: {altitude:.2f}°. Ele precisaria estar acima de 0° para aparecer no céu."
        )
        return messages

    difficult_conditions = []
    favorable_conditions = []

    if altitude < 10:
        difficult_conditions.append(
            "📍 O objeto está muito baixo no horizonte, o que prejudica bastante a observação."
        )
    else:
        favorable_conditions.append("📍 O objeto está acima do horizonte.")

    if magnitude is None:
        difficult_conditions.append(
            "🔎 A magnitude visual não foi encontrada, então o brilho do objeto é incerto."
        )
    elif magnitude > 6:
        difficult_conditions.append(
            "🔭 O objeto tende a ser fraco para observação a olho nu."
        )
    else:
        favorable_conditions.append("✨ O brilho pode permitir observação a olho nu.")

    if cloud_cover is None:
        difficult_conditions.append(
            "☁️ Não foi possível avaliar a cobertura de nuvens."
        )
    elif cloud_cover >= 85:
        difficult_conditions.append(
            "☁️ O céu está muito nublado; isso praticamente impede a observação."
        )
    elif cloud_cover >= 60:
        difficult_conditions.append(
            "⛅ O céu está bem nublado e pode atrapalhar bastante."
        )
    elif cloud_cover >= 25:
        difficult_conditions.append(
            "⛅ Há nuvens no céu, mas ainda pode ser possível observar."
        )
    else:
        favorable_conditions.append("🌌 O céu deve colaborar bem para a observação.")

    if cloud_cover is not None and cloud_cover >= 85:
        messages.append(
            "❌ Não está visível em boas condições: a cobertura de nuvens está alta demais."
        )
    elif altitude < 10 or magnitude is None or (
        magnitude is not None and magnitude > 6
    ) or (cloud_cover is not None and cloud_cover >= 60):
        messages.append(
            "⚠️ Visibilidade difícil: talvez dê para observar, mas as condições não são boas."
        )
    else:
        messages.append("✅ Está visível: as condições estão favoráveis para observação.")

    messages.extend(difficult_conditions)
    messages.extend(favorable_conditions)
    return messages
