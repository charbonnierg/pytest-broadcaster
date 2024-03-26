# pytest-discover

A plugin to write pytest collect output to a JSON lines files.

## Example output

```jsonl
{"pytest_version": "8.1.1", "event": "SessionStart"}
{"name": "test_bar[1]", "doc": "Test something.", "markers": ["parametrize", "skip"], "parameters": {"x": "1"}, "event": "CollectReport", "node_id": "tests/test_something.py::TestFoo::test_bar[1]", "module": "tests.test_something", "parent": "TestFoo", "function": "test_bar", "file": "tests/test_something.py"}
{"name": "test_bar[2]", "doc": "Test something.", "markers": ["parametrize", "skip"], "parameters": {"x": "2"}, "event": "CollectReport", "node_id": "tests/test_something.py::TestFoo::test_bar[2]", "module": "tests.test_something", "parent": "TestFoo", "function": "test_bar", "file": "tests/test_something.py"}
{"name": "test_bar[3]", "doc": "Test something.", "markers": ["parametrize", "skip"], "parameters": {"x": "3"}, "event": "CollectReport", "node_id": "tests/test_something.py::TestFoo::test_bar[3]", "module": "tests.test_something", "parent": "TestFoo", "function": "test_bar", "file": "tests/test_something.py"}
{"exit_status": 0, "event": "SessionFinish"}
```

