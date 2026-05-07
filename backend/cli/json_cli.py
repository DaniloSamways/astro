from __future__ import annotations

import argparse
from datetime import datetime
import json

from services.api_service import (
    get_object_report,
    get_satellite_passes_report,
    get_visible_objects_report,
    resolve_location_for_api,
)


def parse_observation_time(raw_value: str | None) -> datetime:
    if not raw_value:
        return datetime.now().astimezone()

    try:
        parsed = datetime.fromisoformat(raw_value)
    except ValueError as error:
        raise ValueError(
            "Data inválida. Use ISO 8601, por exemplo 2026-05-04T21:30:00-03:00"
        ) from error

    return parsed if parsed.tzinfo is not None else parsed.astimezone()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Consulta astronômica em modo JSON."
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Ativa o modo não interativo com saída JSON.",
    )
    subparsers = parser.add_subparsers(dest="command")
    common_parser = argparse.ArgumentParser(add_help=False)
    common_parser.add_argument(
        "--city",
        help='Cidade da consulta. Exemplo: "Curitiba".',
    )
    common_parser.add_argument(
        "--auto-location",
        action="store_true",
        help="Usa a localização automática em vez de informar a cidade.",
    )
    common_parser.add_argument(
        "--datetime",
        dest="observation_time",
        help="Data/hora em ISO 8601. Exemplo: 2026-05-04T21:30:00-03:00",
    )

    object_parser = subparsers.add_parser(
        "object",
        help="Busca um objeto específico.",
        parents=[common_parser],
    )
    object_parser.add_argument(
        "--object",
        dest="object_name",
        required=True,
        help='Nome do objeto. Exemplo: "Sirius" ou "Júpiter".',
    )

    subparsers.add_parser(
        "visible-objects",
        help="Lista objetos de referência visíveis no momento/horário informado.",
        parents=[common_parser],
    )
    subparsers.add_parser(
        "satellites",
        help="Lista passagens de satélites acima do horizonte e visualmente favoráveis.",
        parents=[common_parser],
    )

    return parser


def run_json_command(args: argparse.Namespace) -> dict:
    location_data = resolve_location_for_api(
        city=args.city,
        auto=args.auto_location,
    )
    observation_time = parse_observation_time(args.observation_time)

    if args.command == "object":
        return get_object_report(
            object_name=args.object_name,
            city=location_data["city"],
            latitude=location_data["latitude"],
            longitude=location_data["longitude"],
            height_m=location_data["height_m"],
            observation_time=observation_time,
        )

    if args.command == "visible-objects":
        return get_visible_objects_report(
            city=location_data["city"],
            latitude=location_data["latitude"],
            longitude=location_data["longitude"],
            height_m=location_data["height_m"],
            observation_time=observation_time,
        )

    if args.command == "satellites":
        return get_satellite_passes_report(
            city=location_data["city"],
            latitude=location_data["latitude"],
            longitude=location_data["longitude"],
            height_m=location_data["height_m"],
            observation_time=observation_time,
        )

    raise ValueError("Comando JSON inválido. Use object, visible-objects ou satellites.")


def print_json(data: dict) -> None:
    print(json.dumps(data, ensure_ascii=False, indent=2))
