from __future__ import annotations

import pytest
from pytest_discover import __version__

from ._utils import CommonTestSetup


@pytest.mark.markers
class TestSimpleMarker(CommonTestSetup):
    """Test suite for verifying markers detection."""

    def make_simple_test_with_marker(self) -> None:
        """A helper function to make a test file with a single test case with a marker."""

        self.make_testfile(
            "test_basic.py",
            """
            import pytest

            @pytest.mark.skip
            def test_ok():
                pass
        """,
        )

    def test_json(self):
        """Test JSON report for a test file with a single test case with a marker."""

        self.make_simple_test_with_marker()
        result = self.test_dir.runpytest(
            "--collect-only", "--collect-report", self.json_file.as_posix()
        )
        assert result.ret == 0
        assert self.json_file.exists()
        assert self.read_json_file() == {
            "pytest_version": pytest.__version__,
            "plugin_version": __version__,
            "exit_status": 0,
            "errors": [],
            "warnings": [],
            "items": [
                {
                    "node_id": "test_basic.py::test_ok",
                    "name": "test_ok",
                    "doc": "",
                    "markers": ["skip"],
                    "parameters": {},
                    "file": "test_basic.py",
                    "module": "test_basic",
                    "parent": None,
                    "function": "test_ok",
                },
            ],
        }

    def test_jsonl(self):
        """Test JSON Lines report for a test file with a single test case with a marker."""

        self.make_simple_test_with_marker()
        result = self.test_dir.runpytest(
            "--collect-only", "--collect-log", self.json_lines_file.as_posix()
        )
        assert result.ret == 0
        assert self.json_lines_file.exists()
        assert self.read_json_lines_file() == [
            {
                "pytest_version": pytest.__version__,
                "plugin_version": __version__,
                "event": "SessionStart",
            },
            {
                "items": [
                    {
                        "node_id": "test_basic.py::test_ok",
                        "name": "test_ok",
                        "doc": "",
                        "markers": ["skip"],
                        "parameters": {},
                        "file": "test_basic.py",
                        "module": "test_basic",
                        "parent": None,
                        "function": "test_ok",
                    },
                ],
                "event": "CollectReport",
                "node_id": "test_basic.py",
            },
            {"exit_status": 0, "event": "SessionFinish"},
        ]
