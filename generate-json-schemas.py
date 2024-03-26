#!/usr/bin/env python3
from __future__ import annotations

import json
import shutil
from os import environ
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

REPOSITORY = "https://raw.githubusercontent.com/charbonnierg/pytest-discover"
REFERENCE = "main"
OUTPUT = "schemas"
SOURCES = Path(__file__).parent.joinpath("src/schemas")


def replace_ref(schema: dict[str, Any], prefix: str) -> None:
    ref: str | None = schema.pop("$ref", None)
    id: str | None = schema.pop("$id", None)
    if ref:
        ref = ref.split("/")[0]
        schema["$ref"] = f"{prefix}/{ref}"
    if id:
        schema["$id"] = f"{prefix}/{id}"
    for value in schema.values():
        if isinstance(value, dict):
            replace_ref(value, prefix)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    replace_ref(item, prefix)


def create_schema(source: Path, prefix: str, output: str) -> None:
    destination = Path(output).joinpath(source.name)
    content = json.loads(source.read_text())
    replace_ref(content, f"{prefix}/{output}")
    destination.write_text(json.dumps(content, indent=2))


def main(repository: str, reference: str, output: str):
    # Normalize repository and reference
    if reference.startswith("/"):
        reference = reference[1:]
    if not repository.endswith("/"):
        repository += "/"
    repository = urljoin(repository, reference)
    shutil.rmtree(output, ignore_errors=True)
    Path(output).mkdir(parents=False, exist_ok=True)
    # Generate all schemas
    for source in SOURCES.glob("*.json"):
        create_schema(source, repository, output)


if __name__ == "__main__":
    main(
        repository=environ.get("REPOSITORY", REPOSITORY),
        reference=environ.get("REFERENCE", REFERENCE),
        output=environ.get("OUTPUT", OUTPUT),
    )
