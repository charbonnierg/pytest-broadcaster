# type: ignore
from __future__ import annotations

__version__: str
__version_tuple__: tuple[int, int, int] | tuple[int, int, int, str]

from ._version import __version__, __version_tuple__  # noqa


all = [
    "__version__",
    "__version_tuple__",
]
