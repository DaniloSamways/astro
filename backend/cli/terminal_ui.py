from __future__ import annotations

from datetime import datetime
import os
import sys
import termios
import tty


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
            return first + sys.stdin.read(1) + sys.stdin.read(1)
        return first
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)


def prompt_menu_choice(title: str, options: list[str], show_galaxy: bool = False) -> int:
    selected_index = 0
    while True:
        lines = ["Use as setas para navegar e Enter para confirmar.", ""]
        for index, option in enumerate(options):
            lines.append(f"{'➜' if index == selected_index else ' '} {option}")
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
            lines.append(f"{'➜' if index == selected_index else ' '} {option}")
        render_screen(title, lines, show_galaxy=show_galaxy)
        key = _read_key()
        if key == "\x1b[A":
            selected_index = (selected_index - 1) % len(options)
        elif key == "\x1b[B":
            selected_index = (selected_index + 1) % len(options)
        elif key in {"\r", "\n"}:
            return selected_index + 1


def prompt_text(message: str, default: str | None = None, title: str = "Entrada") -> str:
    render_screen(
        title,
        [message] + ([f"Pressione Enter para usar o padrão: {default}"] if default else []),
    )
    value = input("> " if default is None else f"[{default}] > ").strip()
    return value or default or ""


def prompt_observation_datetime() -> datetime:
    if prompt_menu_choice(
        "Horário da Observação",
        ["Observar agora", "Informar outra data e horário"],
    ) == 1:
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
                ["Formato inválido.", "Use o formato DD/MM/AAAA HH:MM."],
            )
            input("Pressione Enter para tentar novamente...")
