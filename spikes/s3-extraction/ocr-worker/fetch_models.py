"""Explicit model-download command; recognition never calls this command."""

import argparse
import json

from assets import ERROR_CODES, OcrFailure, fetch_models


class Arguments(argparse.ArgumentParser):
    def error(self, message):
        raise OcrFailure("invalid_arguments")


def main(argv=None):
    try:
        parser = Arguments(prog="ocr-fetch-models", description=__doc__)
        parser.add_argument("--models-dir", required=True, help="Private model directory outside the repository")
        args = parser.parse_args(argv)
        fetch_models(args.models_dir)
        result, status = {"status": "ready", "schemaVersion": 1}, 0
    except OcrFailure as error:
        code = error.code if isinstance(error.code, str) and error.code in ERROR_CODES else "model_fetch_failed"
        result, status = {"status": "error", "code": code}, 2
    except Exception:
        result, status = {"status": "error", "code": "model_fetch_failed"}, 2
    print(json.dumps(result))
    return status


if __name__ == "__main__":
    raise SystemExit(main())
