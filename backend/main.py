from __future__ import annotations

import sys

from cli.json_cli import build_parser, print_json, run_json_command


if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            parser = build_parser()
            args = parser.parse_args()
            if not args.json:
                parser.error("Use --json para o modo não interativo.")
            print_json(run_json_command(args))
        else:
            from cli.app import main

            main()
    except ValueError as error:
        if len(sys.argv) > 1:
            print_json({"error": str(error)})
        else:
            from cli.terminal_ui import render_screen

            render_screen("Erro", [f"Erro: {error}"])
    except KeyboardInterrupt:
        if len(sys.argv) > 1:
            print_json({"error": "Execução interrompida pelo usuário."})
        else:
            from cli.terminal_ui import render_screen

            render_screen("Encerrado", ["Execução interrompida pelo usuário."])
