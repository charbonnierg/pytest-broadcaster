from __future__ import annotations

import re
from typing import Any

import pytest

__NODE_ID__ = re.compile(
    r"(?P<module>.+)\.py(?:::(?P<class>[^:]+)(?:::.+)?)?::(?P<function>[^\[]+)(?:\[(?P<params>.*)\])?"
)


def parse_node_id(node_id: str) -> tuple[str, str, str, str]:
    match = re.search(__NODE_ID__, node_id)
    if match:
        return (
            match.group("module").replace("/", "."),
            match.group("class") or "",
            match.group("function"),
            match.group("params") or "",
        )
    raise Exception('Failed parsing pytest node id: "%s"' % node_id)


def get_test_doc(item: pytest.Item | pytest.Module | pytest.Class) -> str:
    try:
        return item.obj.__doc__ or ""  # type: ignore
    except AttributeError:
        return ""


def get_test_args(item: pytest.Item) -> dict[str, Any]:
    try:
        return item.callspec.params  # type: ignore
    except AttributeError:
        return {}


def get_test_markers(
    item: pytest.Item | pytest.Directory | pytest.Module | pytest.Class,
) -> list[pytest.Mark]:
    return list(item.iter_markers())


def format_mark(mark: pytest.Mark) -> str:
    return mark.name
