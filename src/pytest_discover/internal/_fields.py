from __future__ import annotations

from dataclasses import dataclass, field
from warnings import WarningMessage

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
    filename: str | None
    module: str | None
    classes: list[str] | None
    func: str
    params: str | None
    name: str
    value: str = field(repr=False)

    def __str__(self) -> str:
        return self.value

    def suite(self) -> str | None:
        if self.classes:
            return "::".join(self.classes)
        return None


def make_node_id(
    item: pytest.Item | pytest.Directory | pytest.Module | pytest.Class,
) -> NodeID:
    mod, cls, func, params = parse_node_id(item.nodeid)
    name = "%s[%s]" % (func, params) if params else func
    filename = mod.split("/")[-1] if mod else None
    module = filename.replace(".py", "") if filename else None
    classes = cls.split("::") if cls else None
    return NodeID(
        filename=filename,
        module=module,
        classes=classes,
        func=func,
        params=params or None,
        name=name,
        value=item.nodeid,
    )


def field_file(item: pytest.Item) -> str | None:
    return item.location[0]


def field_doc(item: pytest.Item | pytest.Module | pytest.Class) -> str:
    return get_test_doc(item).strip()


def field_markers(
    item: pytest.Item | pytest.Directory | pytest.Module | pytest.Class,
) -> list[str]:
    return list(
        set(
            [
                format_mark(mark)
                for mark in sorted(get_test_markers(item), key=lambda mark: mark.name)
            ]
        )
    )


def field_parameters(item: pytest.Item) -> dict[str, str]:
    return {k: type(v).__name__ for k, v in sorted(get_test_args(item).items())}


def make_warning_message(warning: WarningMessage) -> str:
    if isinstance(warning.message, str):
        return warning.message
    return str(warning.message)
