# generated by datamodel-codegen:
#   filename:  error_message.json

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from . import location, traceback


class When(Enum):
    """When the error message is emitted."""

    config = "config"
    collect = "collect"
    runtest = "runtest"


@dataclass
class ErrorMessage:
    """An error message."""

    when: When
    """
    When the error message is emitted.
    """
    location: location.Location
    """
    The location of the error.
    """
    exception_type: str
    """
    The exception type as a string.
    """
    exception_value: str
    """
    The exception value as a string.
    """
    traceback: traceback.Traceback
    """
    The traceback of the error. A traceback contains entries for each frame of the call stack.
    """
    event: str = "error_message"
    """
    The event type. Always 'error_message'.
    """
