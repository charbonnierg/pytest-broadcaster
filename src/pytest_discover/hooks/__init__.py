from __future__ import annotations

from typing import Callable

from pytest_discover.interfaces import Destination, Reporter


def pytest_discover_add_destination(add: Callable[[Destination], None]) -> None:
    """
    Called on plugin initialization.

    Use it to add your own destination.

    For instance, in conftest.py:
    >>> def pytest_discover_add_destination(add_destination):
    >>>
    >>>    add(HTTPublisher(url="https://example.com"))
    >>>    add(HTTPublisher(url="https://another-example.com"))
    >>>

    Then run pytest without any option:

        $ pytest
    """


def pytest_discover_set_reporter(set: Callable[[Reporter], None]) -> None:
    """
    Called on plugin initialization.

    Use it to set your own reporter.

    For instance, in conftest.py:
    >>> def pytest_discover_set_reporter(set_reporter):
    >>>
    >>>     set(MyReporter())
    >>>

    Then run pytest without any option:

        $ pytest
    """
