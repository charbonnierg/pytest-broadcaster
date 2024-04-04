from __future__ import annotations

from pytest_discover.interfaces import Destination
from pytest_discover.internal._json_files import JSONFile, JSONLinesFile

pytest_plugins = "pytester"


def pytest_discover_register_publisher(publishers: list[Destination]) -> None:
    publishers.extend(
        [
            JSONFile("collect.json"),
            JSONLinesFile("collect.jsonl"),
        ]
    )
