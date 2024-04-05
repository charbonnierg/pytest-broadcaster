# generated by datamodel-codegen:
#   filename:  collect_report.json

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Union

from . import test_case, test_directory, test_module, test_suite


@dataclass
class CollectReport:
    """
    A report of collected items.
    """

    session_id: str
    """
    The unique if of this test session used to aggregate events together.
    """
    node_id: str
    """
    The node id of the node for which items were collected (the top level root directory has an empty node id).
    """
    timestamp: str
    """
    The date and time when the report was generated in ISO 8601 format.
    """
    items: List[
        Union[
            test_directory.TestDirectory,
            test_module.TestModule,
            test_suite.TestSuite,
            test_case.TestCase,
        ]
    ]
    """
    An array of collected items. Each collected item is a test directory, test module, test suite, or test case. Top level directory is always first element in the array, followed by test cases, then test suites, then test modules, then test directories for each level of nesting.
    """
    event: str = "collect_report"
    """
    The event type. Always set to 'collect_report'.
    """
