# generated by datamodel-codegen:
#   filename:  test_case_call.json

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from . import outcome, test_case_error


@dataclass
class TestCaseCall:
    """
    Event emitted when a call step has been executed in a test case.
    """

    node_id: str
    """
    The node ID of the test case.
    """
    session_id: str
    """
    The unique if of this test session used to aggregate events together.
    """
    start_timestamp: str
    """
    Start time of the call step in ISO 8601 format.
    """
    stop_timestamp: str
    """
    Stop time of the call step in ISO 8601 format.
    """
    duration: float
    """
    Duration of the call step in seconds.
    """
    outcome: outcome.Outcome
    """
    Outcome of the call step.
    """
    event: str = "case_call"
    """
    The event type. Always set to 'case_call'.
    """
    error: Optional[test_case_error.TestCaseError] = None
    """
    Error details if the call step failed.
    """
