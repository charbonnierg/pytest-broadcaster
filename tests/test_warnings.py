from __future__ import annotations

from pathlib import Path

import pytest
from pytest_discover import __version__

from ._utils import CommonTestSetup


@pytest.mark.basic
class TestWarnings(CommonTestSetup):
    """Warnings test suite."""

    def make_basic_test(self) -> Path:
        """A helper function to make a test file which emits warnings on collection."""

        return self.make_testfile(
            "test_warnings.py",
            """
            import warnings

            warnings.warn("HEY, YOU'BE BEEN WARNED")
            warnings.warn("HEY, YOU'BE BEEN WARNED TWICE !")

            def test_warn():
                '''This is a test docstring.'''
                pass
            """,
        ).parent

    def test_json(self):
        """Test JSON report for test file with emit warnings on collection."""

        directory = self.make_basic_test()
        result = self.test_dir.runpytest(
            "--collect-only", "--collect-report", self.json_file.as_posix()
        )
        assert result.ret == 0
        assert self.json_file.exists()
        assert self.tmp_path, self.read_json_file() == {
            "pytest_version": pytest.__version__,
            "plugin_version": __version__,
            "exit_status": 0,
            "errors": [],
            "warnings": [
                {
                    "when": "collect",
                    "node_id": "",
                    "location": {
                        "filename": directory.joinpath("test_warnings.py").as_posix(),
                        "lineno": 3,
                        "function": None,
                    },
                    "message": "HEY, YOU'BE BEEN WARNED",
                    "event": "WarningMessage",
                    "category": "UserWarning",
                },
                {
                    "when": "collect",
                    "node_id": "",
                    "message": "HEY, YOU'BE BEEN WARNED TWICE !",
                    "event": "WarningMessage",
                    "location": {
                        "filename": directory.joinpath("test_warnings.py").as_posix(),
                        "lineno": 4,
                        "function": None,
                    },
                    "category": "UserWarning",
                },
            ],
            "collect_reports": [
                {
                    "event": "CollectReport",
                    "node_id": "test_warnings.py",
                    "items": [
                        {
                            "event": "CollectReport",
                            "node_id": None,
                            "items": [
                                {
                                    "node_id": ".",
                                    "name": "test_jsonl0",
                                    "file": directory.as_posix(),
                                    "markers": [],
                                    "node_type": "directory",
                                }
                            ],
                        },
                        {
                            "node_id": "test_warnings.py::test_warn",
                            "node_type": "case",
                            "name": "test_warn",
                            "doc": "This is a test docstring.",
                            "markers": [],
                            "parameters": {},
                            "file": "test_warnings.py",
                            "module": "test_warnings",
                            "parent": None,
                            "function": "test_warn",
                        },
                    ],
                }
            ],
        }

    def test_jsonl(self):
        """Test JSON Lines report for test file which emits warnings on collection."""

        directory = self.make_basic_test()
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
                "event": "CollectReport",
                "node_id": None,
                "items": [
                    {
                        "node_id": ".",
                        "node_type": "directory",
                        "name": directory.name,
                        "path": directory.as_posix(),
                        "markers": [],
                    }
                ],
            },
            {
                "event": "CollectReport",
                "node_id": "test_warnings.py",
                "items": [
                    {
                        "node_id": "test_warnings.py::test_warn",
                        "node_type": "case",
                        "name": "test_warn",
                        "doc": "This is a test docstring.",
                        "markers": [],
                        "parameters": {},
                        "file": "test_warnings.py",
                        "module": "test_warnings",
                        "parent": None,
                        "function": "test_warn",
                    },
                ],
            },
            {
                "when": "collect",
                "node_id": "",
                "location": {
                    "filename": directory.joinpath("test_warnings.py").as_posix(),
                    "lineno": 3,
                    "function": None,
                },
                "message": "HEY, YOU'BE BEEN WARNED",
                "event": "WarningMessage",
                "category": "UserWarning",
            },
            {
                "when": "collect",
                "node_id": "",
                "location": {
                    "filename": directory.joinpath("test_warnings.py").as_posix(),
                    "lineno": 4,
                    "function": None,
                },
                "message": "HEY, YOU'BE BEEN WARNED TWICE !",
                "event": "WarningMessage",
                "category": "UserWarning",
            },
            {"exit_status": 0, "event": "SessionFinish"},
        ]
