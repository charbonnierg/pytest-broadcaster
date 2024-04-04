# generated by datamodel-codegen:
#   filename:  test_case_setup.json

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from . import outcome, test_case_error


@dataclass
class TestCaseSetup:
    """
    Pytest Test Case Setup
    """

    node_id: str
    """
    The node ID of the test case.
    """
    outcome: outcome.Outcome
    """
    Outcome of the setup step.
    """
    duration: float
    """
    Duration of the setup step in seconds.
    """
    start: str
    """
    Start time of the setup step in ISO 8601 format.
    """
    stop: str
    """
    Stop time of the setup step in ISO 8601 format.
    """
    event_type: str = "case_setup"
    """
    The event type. Always 'case_setup'.
    """
    error: Optional[test_case_error.TestCaseError] = None
    """
    Error details if the setup step failed.
    """