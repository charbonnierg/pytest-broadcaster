from __future__ import annotations

from pytest_discover.interfaces import Destination


def pytest_discover_register_publisher(publishers: list[Destination]) -> None:
    """
    Called on plugin initialization.

    Use it to add your own publisher.

    For instance, in conftest.py:
    >>> def pytest_discover_register_publisher(columns):
    >>>
    >>>     publishers.append(HTTPublisher(url="https://example.com"))
    >>>

    Then run pytest without any option:

        $ pytest
    """
