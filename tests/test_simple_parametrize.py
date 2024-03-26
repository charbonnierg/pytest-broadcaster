from __future__ import annotations

import pytest

from ._utils import CommonTestSetup


class TestParametrize(CommonTestSetup):
    def make_test_with_paramtrize(self) -> None:
        self.make_testfile(
            "test_basic.py",
            """
            import pytest

            @pytest.mark.parametrize("arg", [1, 2, 3])
            def test_ok(arg: int):
                pass
        """,
        )

    def test_json(self):
        self.make_test_with_paramtrize()
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
                    "node_id": "test_basic.py::test_ok[1]",
                    "name": "test_ok[1]",
                    "doc": "",
                    "markers": ["parametrize"],
                    "parameters": {"arg": "int"},
                    "file": "test_basic.py",
                    "module": "test_basic",
                    "parent": None,
                    "function": "test_ok",
                },
                {
                    "node_id": "test_basic.py::test_ok[2]",
                    "name": "test_ok[2]",
                    "doc": "",
                    "markers": ["parametrize"],
                    "parameters": {"arg": "int"},
                    "file": "test_basic.py",
                    "module": "test_basic",
                    "parent": None,
                    "function": "test_ok",
                },
                {
                    "node_id": "test_basic.py::test_ok[3]",
                    "name": "test_ok[3]",
                    "doc": "",
                    "markers": ["parametrize"],
                    "parameters": {"arg": "int"},
                    "file": "test_basic.py",
                    "module": "test_basic",
                    "parent": None,
                    "function": "test_ok",
                },
            ],
        }

    def test_jsonl(self):
        self.make_test_with_paramtrize()
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
                        "node_id": "test_basic.py::test_ok[1]",
                        "name": "test_ok[1]",
                        "doc": "",
                        "markers": ["parametrize"],
                        "parameters": {"arg": "int"},
                        "file": "test_basic.py",
                        "module": "test_basic",
                        "parent": None,
                        "function": "test_ok",
                    },
                    {
                        "node_id": "test_basic.py::test_ok[2]",
                        "name": "test_ok[2]",
                        "doc": "",
                        "markers": ["parametrize"],
                        "parameters": {"arg": "int"},
                        "file": "test_basic.py",
                        "module": "test_basic",
                        "parent": None,
                        "function": "test_ok",
                    },
                    {
                        "node_id": "test_basic.py::test_ok[3]",
                        "name": "test_ok[3]",
                        "doc": "",
                        "markers": ["parametrize"],
                        "parameters": {"arg": "int"},
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
