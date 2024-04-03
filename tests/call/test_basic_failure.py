from __future__ import annotations

from pathlib import Path

import pytest
from pytest_discover import __version__

from ._utils import CommonTestSetup


@pytest.mark.basic
class TestBasicFailure(CommonTestSetup):
    """Scenario: A single test case within a single test file which fails."""

    def make_test_directory(self) -> Path:
        return self.make_testfile(
            "test_basic_failure.py",
            """
            '''This is a module docstring.'''

            def test_failure():
                '''This is a test docstring.'''
                raise ValueError("BOOM")
            """,
        ).parent

    def test_json(self):
        """Test JSON report for single test case within single test file."""

        directory = self.make_test_directory()
        result = self.test_dir.runpytest("--collect-report", self.json_file.as_posix())
        assert result.ret == 1
        assert self.json_file.exists()
        assert self.omit_durations(self.read_json_file()) == {
            "pytest_version": pytest.__version__,
            "plugin_version": __version__,
            "exit_status": 1,
            "errors": [],
            "warnings": [],
            "test_reports": [
                {
                    "node_id": "test_basic_failure.py::test_failure",
                    "outcome": "failed",
                    "duration": "omitted",
                    "setup": {
                        "event_type": "case_setup",
                        "node_id": "test_basic_failure.py::test_failure",
                        "outcome": "passed",
                        "duration": "omitted",
                    },
                    "call": {
                        "event_type": "case_call",
                        "node_id": "test_basic_failure.py::test_failure",
                        "outcome": "failed",
                        "duration": "omitted",
                    },
                    "teardown": {
                        "event_type": "case_teardown",
                        "node_id": "test_basic_failure.py::test_failure",
                        "outcome": "passed",
                        "duration": "omitted",
                    },
                    "finished": {
                        "event_type": "case_finished",
                        "node_id": "test_basic_failure.py::test_failure",
                        "outcome": "failed",
                        "duration": "omitted",
                    },
                }
            ],
            "collect_reports": [
                {
                    "event": "CollectReport",
                    "node_id": "",
                    "items": [
                        {
                            "node_id": ".",
                            "node_type": "directory",
                            "name": directory.name,
                            "path": directory.name,
                        }
                    ],
                },
                {
                    "event": "CollectReport",
                    "node_id": "test_basic_failure.py",
                    "items": [
                        {
                            "node_id": "test_basic_failure.py::test_failure",
                            "node_type": "case",
                            "name": "test_failure",
                            "doc": "This is a test docstring.",
                            "markers": [],
                            "parameters": {},
                            "path": directory.joinpath("test_basic_failure.py")
                            .relative_to(directory.parent)
                            .as_posix(),
                            "module": "test_basic_failure",
                            "suite": None,
                            "function": "test_failure",
                        }
                    ],
                },
                {
                    "event": "CollectReport",
                    "node_id": ".",
                    "items": [
                        {
                            "node_id": "test_basic_failure.py",
                            "name": "test_basic_failure.py",
                            "path": directory.joinpath("test_basic_failure.py")
                            .relative_to(directory.parent)
                            .as_posix(),
                            "doc": "This is a module docstring.",
                            "markers": [],
                            "node_type": "module",
                        }
                    ],
                },
            ],
        }

    def test_jsonl_basic(self):
        """Test JSON Lines report for single test case within single test file."""

        directory = self.make_test_directory()
        result = self.test_dir.runpytest(
            "--collect-log", self.json_lines_file.as_posix()
        )
        assert result.ret == 1
        assert self.json_lines_file.exists()
        assert self.omit_durations(self.read_json_lines_file()) == [
            {
                "pytest_version": pytest.__version__,
                "plugin_version": __version__,
                "event": "SessionStart",
            },
            {
                "event": "CollectReport",
                "node_id": "",
                "items": [
                    {
                        "node_id": ".",
                        "node_type": "directory",
                        "name": directory.name,
                        "path": directory.name,
                    }
                ],
            },
            {
                "event": "CollectReport",
                "node_id": "test_basic_failure.py",
                "items": [
                    {
                        "node_id": "test_basic_failure.py::test_failure",
                        "node_type": "case",
                        "name": "test_failure",
                        "doc": "This is a test docstring.",
                        "markers": [],
                        "parameters": {},
                        "path": directory.joinpath("test_basic_failure.py")
                        .relative_to(directory.parent)
                        .as_posix(),
                        "module": "test_basic_failure",
                        "suite": None,
                        "function": "test_failure",
                    },
                ],
            },
            {
                "event": "CollectReport",
                "node_id": ".",
                "items": [
                    {
                        "node_id": "test_basic_failure.py",
                        "name": "test_basic_failure.py",
                        "path": directory.joinpath("test_basic_failure.py")
                        .relative_to(directory.parent)
                        .as_posix(),
                        "doc": "This is a module docstring.",
                        "markers": [],
                        "node_type": "module",
                    }
                ],
            },
            {
                "event_type": "case_setup",
                "node_id": "test_basic_failure.py::test_failure",
                "outcome": "passed",
                "duration": "omitted",
            },
            {
                "event_type": "case_call",
                "node_id": "test_basic_failure.py::test_failure",
                "outcome": "failed",
                "duration": "omitted",
            },
            {
                "event_type": "case_teardown",
                "node_id": "test_basic_failure.py::test_failure",
                "outcome": "passed",
                "duration": "omitted",
            },
            {
                "event_type": "case_finished",
                "node_id": "test_basic_failure.py::test_failure",
                "outcome": "failed",
                "duration": "omitted",
            },
            {"exit_status": 1, "event": "SessionFinish"},
        ]
