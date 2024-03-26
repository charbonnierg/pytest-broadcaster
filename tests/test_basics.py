from __future__ import annotations

import pytest

from ._utils import CommonTestSetup


class TestBasics(CommonTestSetup):
    def make_basic_test(self) -> None:
        self.make_testfile(
            "test_basic.py",
            """
            def test_ok():
                '''This is a test docstring.'''
                pass
        """,
        )

    def test_json(self):
        self.make_basic_test()
        result = self.test_dir.runpytest(
            "--collect-only", "--collect-report", self.json_file.as_posix()
        )
        assert result.ret == 0
        assert self.json_file.exists()
        assert self.read_json_file() == {
            "pytest_version": pytest.__version__,
            "exit_status": 0,
            "errors": [],
            "warnings": [],
            "items": [
                {
                    "node_id": "test_basic.py::test_ok",
                    "name": "test_ok",
                    "doc": "This is a test docstring.",
                    "markers": [],
                    "parameters": {},
                    "file": "test_basic.py",
                    "module": "test_basic",
                    "parent": None,
                    "function": "test_ok",
                },
            ],
        }

    def test_jsonl(self):
        self.make_basic_test()
        result = self.test_dir.runpytest(
            "--collect-only", "--collect-log", self.json_lines_file.as_posix()
        )
        assert result.ret == 0
        assert self.json_lines_file.exists()
        assert self.read_json_lines_file() == [
            {"pytest_version": pytest.__version__, "event": "SessionStart"},
            {
                "items": [
                    {
                        "node_id": "test_basic.py::test_ok",
                        "name": "test_ok",
                        "doc": "This is a test docstring.",
                        "markers": [],
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
