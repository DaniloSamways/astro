from __future__ import annotations

import json

from cli.json_cli import build_parser, run_json_command


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if not args.json:
        parser.error("Use --json para executar a bridge da API.")

    try:
        payload = {
            "ok": True,
            "data": run_json_command(args),
        }
        print(json.dumps(payload, ensure_ascii=False))
        return 0
    except Exception as error:
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": str(error),
                },
                ensure_ascii=False,
            )
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
