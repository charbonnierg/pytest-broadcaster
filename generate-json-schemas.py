#!/usr/bin/env python3
from __future__ import annotations

import json
import shutil
from pathlib import Path
from sys import exit
from typing import Any

SOURCES = Path(__file__).parent.joinpath("src/schemas")
DESTINATIONS = Path(__file__).parent.joinpath("schemas")


def replace_ref(schema: dict[str, Any], top: bool) -> None:
    ref: str | None = schema.pop("$ref", None)
    if not top:
        schema.pop("$schema", None)
        schema.pop("$id", None)
    if ref:
        ref = ref.split("/")[0]
        ref_path = DESTINATIONS.joinpath(ref)
        ref_content = json.loads(ref_path.read_text())
        replace_ref(ref_content, False)
        schema.update(ref_content)
    for value in schema.values():
        if isinstance(value, dict):
            replace_ref(value, False)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    replace_ref(item, False)


def create_schema(source: Path) -> None:
    destination = DESTINATIONS.joinpath(source.name)
    content = json.loads(source.read_text())
    replace_ref(content, True)
    output = json.dumps(content, indent=2)
    destination.write_text(output)


def main(max_passes: int):
    shutil.rmtree(DESTINATIONS, ignore_errors=True)
    DESTINATIONS.mkdir(parents=False, exist_ok=True)
    max_passes = max(max_passes - 1, 1)
    retry: list[Path] = []
    # Generate all schemas without references
    for source in SOURCES.glob("*.json"):
        try:
            create_schema(source)
        except FileNotFoundError:
            retry.append(source)
            continue
    # Attempt to generate remaining schemas until max_passes
    for _ in range(max_passes - 1):
        while retry:
            source = retry.pop()
            try:
                create_schema(source)
            except FileNotFoundError:
                retry.append(source)

    if retry:
        print("Failed to generate schemas for:")
        for source in retry:
            print(f"  {source}")
        exit(1)


if __name__ == "__main__":
    # Allow at most 3 passes to generate schemas
    main(max_passes=3)
