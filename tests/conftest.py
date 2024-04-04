from __future__ import annotations

from typing import Callable

from pytest_discover import Destination, JSONFile, JSONLinesFile

pytest_plugins = "pytester"


def pytest_discover_add_destination(add: Callable[[Destination], None]) -> None:
    add(JSONFile("collect.json"))
    add(JSONLinesFile("collect.jsonl"))
