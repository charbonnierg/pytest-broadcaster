# generated by datamodel-codegen:
#   filename:  test_case_finished.json

from __future__ import annotations

from dataclasses import dataclass

from . import outcome


@dataclass
class TestCaseFinished:
    """
    Event emitted when a test case is finished (meaning all of setup, call and teardown steps are finished).
    """

    session_id: str
    """
    The unique if of this test session used to aggregate events together.
    """
    node_id: str
    """
    The node ID of the test case.
    """
    start_timestamp: str
    """
    Start time of the test case (including setup).
    """
    stop_timestamp: str
    """
    Stop time of the test case (including teardown).
    """
    total_duration: float
    """
    Total duration of the test case in seconds (including setup and teardown).
    """
    outcome: outcome.Outcome
    """
    Outcome of the test case.
    """
    event: str = "case_finished"
    """
    The event type. Always set to 'case_finished'.
    """