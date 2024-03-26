from __future__ import annotations

import pytest

from ._utils import (
    parse_node_id,
    get_test_doc,
    get_test_args,
    get_test_markers,
    format_mark,
)


def field_id(item: pytest.Item) -> str:
    return item.nodeid


def field_module(item: pytest.Item) -> str | None:
    mod, _, _, _ = parse_node_id(item.nodeid)
    return mod or None


def field_class(item: pytest.Item) -> str | None:
    _, cls, _, _ = parse_node_id(item.nodeid)
    return cls or None


def field_function(item: pytest.Item) -> str | None:
    _, _, func, _ = parse_node_id(item.nodeid)
    return func or None


def field_name(item: pytest.Item) -> str:
    _, _, func, params = parse_node_id(item.nodeid)
    return "%s[%s]" % (func, params) if params else func


def field_file(item: pytest.Item) -> str | None:
    return item.location[0]


def field_doc(item: pytest.Item) -> str:
    return get_test_doc(item).strip()


def field_markers(item: pytest.Item) -> list[str]:
    return [
        format_mark(mark)
        for mark in sorted(get_test_markers(item), key=lambda mark: mark.name)
    ]


def field_parameters(item: pytest.Item) -> dict[str, str]:
    return {k: str(v) for k, v in sorted(get_test_args(item).items())}
