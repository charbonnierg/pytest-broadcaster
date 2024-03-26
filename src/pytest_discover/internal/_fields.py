from __future__ import annotations

from dataclasses import dataclass, field

import pytest

from ._utils import (
    format_mark,
    get_test_args,
    get_test_doc,
    get_test_markers,
    parse_node_id,
)


@dataclass
class NodeID:
    module: str | None
    parent: str | None
    func: str
    params: str | None
    name: str
    value: str = field(repr=False)

    def __str__(self) -> str:
        return self.value


def make_node_id(item: pytest.Item) -> NodeID:
    mod, cls, func, params = parse_node_id(item.nodeid)
    name = "%s[%s]" % (func, params) if params else func
    return NodeID(
        module=mod or None,
        parent=cls or None,
        func=func,
        params=params or None,
        name=name,
        value=item.nodeid,
    )


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
    return {k: type(v).__name__ for k, v in sorted(get_test_args(item).items())}
