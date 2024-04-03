# generated by datamodel-codegen:
#   filename:  test_case_teardown.json

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class TestCaseTeardown:
    """
    Pytest Test Case Teardown
    """

    node_id: str
    """
    Node ID
    """
    event_type: str = "teardown"
    """
    Event Type
    """