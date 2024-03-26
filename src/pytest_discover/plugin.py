from __future__ import annotations

import json
import warnings
from dataclasses import asdict
from typing import Any, TextIO

import pytest
from _pytest.pathlib import Path  # pyright: ignore[reportPrivateImportUsage]
from _pytest.terminal import TerminalReporter
from typing_extensions import Literal

from . import _fields as api
from .models.collect_report import CollectReport
from .models.discovery_result import DiscoveryResult
from .models.error_message import ErrorMessage
from .models.session_finish import SessionFinish
from .models.session_start import SessionStart
from .models.test_item import TestItem
from .models.warning_message import WarningMessage

__PLUGIN_ATTR__ = "_collect_log_plugin"


def create_plugin(
    config: pytest.Config, json_path: str | None, ndjson_path: str | None
) -> PytestDiscoverPlugin:
    """Create and register a new pytest-discover plugin instance.

    Args:
        config: The pytest configuration object.
        filename: The path to the output file.

    Returns:
        The created and registered plugin instance.
    """
    # Create plugin instance.
    plugin = PytestDiscoverPlugin(config, json_path, ndjson_path)
    # Open the plugin
    plugin.open()
    # Register the plugin with the plugin manager.
    config.pluginmanager.register(plugin)
    # Finally return the plugin initialized instance.
    return plugin


# Register argparse-style options and ini-style config values, called once at the beginning of a test run.
# https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_addoption
def pytest_addoption(parser: pytest.Parser) -> None:
    group = parser.getgroup("terminal reporting", "pytest-discover plugin options")
    group.addoption(
        "--collect-report",
        action="store",
        metavar="path",
        default=None,
        help="Path to JSON file holding collected items.",
    )
    group.addoption(
        "--collect-log",
        action="store",
        metavar="path",
        default=None,
        help="Path to NDJSON file holding collected items.",
    )


# Perform initial plugin configuration, called once after command line options have been parsed.
# Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_configure
def pytest_configure(config: pytest.Config) -> None:
    ndjson_path = config.option.collect_log
    json_path = config.option.collect_report
    if not (ndjson_path or json_path):
        return
    # Skip if workerinput is present, which means we are in a worker process.
    if hasattr(config, "workerinput"):
        return
    # Create and register the plugin.
    plugin = create_plugin(config, json_path, ndjson_path)
    # Store the plugin instance in the config object.
    setattr(config, __PLUGIN_ATTR__, plugin)


# Perform final plugin teardown, called once after all test are executed.
# Called once before test process is exited.
# Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_unconfigure
def pytest_unconfigure(config: pytest.Config) -> None:
    plugin: PytestDiscoverPlugin | None = getattr(config, __PLUGIN_ATTR__, None)
    if plugin:
        plugin.close()
        delattr(config, __PLUGIN_ATTR__)


class PytestDiscoverPlugin:
    """A pytest plugin to log collection to a line-based JSON file."""

    def __init__(
        self,
        config: pytest.Config,
        json_filepath: str | None,
        ndjson_filepath: str | None,
    ) -> None:
        """Initialize the plugin with the given configuration and file path.

        Args:
            config: The pytest configuration object.
            filepath: The path to the output file.
        """
        self.config = config
        self.json_filepath = Path(json_filepath) if json_filepath else None
        self.ndjson_filepath = Path(ndjson_filepath) if ndjson_filepath else None
        self._file: TextIO | None = None
        self._result = DiscoveryResult(
            pytest_version=pytest.__version__,
            exit_status=0,
            warnings=[],
            errors=[],
            items=[],
        )

    def open(self) -> None:
        """Open the output file for writing."""
        if self.ndjson_filepath is None:
            return
        if self._file is not None:
            raise RuntimeError("pytest-discover output file is already opened")
        # Ensure the directory exists.
        self.ndjson_filepath.parent.mkdir(parents=True, exist_ok=True)
        # Open the text file in write mode.
        self._file = self.ndjson_filepath.open("wt", buffering=1, encoding="UTF-8")

    def close(self) -> None:
        """Close the output file and write the result file."""
        if self._file is not None:
            self._file.close()
            self._file = None
        if self.json_filepath is not None:
            json_data = json.dumps(asdict(self._result), indent=2)
            self.json_filepath.write_text(json_data)

    def _write_event(
        self,
        data: CollectReport
        | SessionFinish
        | SessionStart
        | WarningMessage
        | ErrorMessage,
    ) -> None:
        if self.ndjson_filepath is None:
            return
        if self._file is None:
            raise RuntimeError("pytest-discover output file is not open yet")
        json_data = json.dumps(asdict(data))
        self._file.write(json_data + "\n")
        self._file.flush()

    # Called after the Session object has been created and before performing collection and entering the run test loop.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_sessionstart
    def pytest_sessionstart(self) -> None:
        event = SessionStart(pytest_version=pytest.__version__)
        self._write_event(event)

    # Called after whole test run finished, right before returning the exit status to the system.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_sessionfinish
    def pytest_sessionfinish(self, exitstatus: int) -> None:
        self._result.exit_status = exitstatus
        event = SessionFinish(exit_status=exitstatus)
        self._write_event(event)

    # Process a warning captured by the internal pytest warnings plugin.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_warning_recorded
    def pytest_warning_recorded(
        self,
        warning_message: warnings.WarningMessage,
        when: Literal["config", "collect", "runtest"],
        nodeid: str,
        location: tuple[str, int, str] | None,
    ):
        event = WarningMessage(
            category=warning_message.category.__name__
            if warning_message.category
            else None,
            filename=warning_message.filename,
            lineno=warning_message.lineno,
            message=repr(warning_message.message),
            when=when,  # type: ignore[arg-type]
        )
        self._result.warnings.append(event)
        self._write_event(event)

    # Collector encountered an error
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_exception_interact
    def pytest_exception_interact(
        self,
        node: pytest.Item | pytest.Collector,
        call: pytest.CallInfo[Any],
        report: pytest.TestReport | pytest.CollectReport,
    ) -> None:
        # Skip if the report is not a test report.
        if isinstance(report, pytest.TestReport):
            return
        assert call.excinfo, "exception info is missing"
        msg = ErrorMessage(
            when=call.when,  # type: ignore[arg-type]
            filename=call.excinfo.tb.tb_frame.f_code.co_filename,
            lineno=call.excinfo.tb.tb_lineno,
            exception_type=call.excinfo.typename,
            exception_value=call.excinfo.exconly(True),
        )
        self._result.errors.append(msg)
        self._write_event(msg)

    # Collector finished collecting.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_collectreport
    def pytest_collectreport(self, report: pytest.CollectReport) -> None:
        # TODO: Don't emit event when test collection fails
        if report.failed:
            return
        items: list[TestItem] = []
        # Format all test items discovered
        for result in report.result:
            if not isinstance(result, pytest.Item):
                continue
            node_id = api.extract_node_id_infos(result)
            item = TestItem(
                node_id=node_id.value,
                name=node_id.name,
                module=node_id.module,
                parent=node_id.parent,
                function=node_id.func,
                file=api.field_file(result),
                doc=api.field_doc(result),
                markers=api.field_markers(result),
                parameters=api.field_parameters(result),
            )
            items.append(item)
        # Don't emit event when no test are discovered
        if not items:
            return
        # Generate a collect report event.
        data = CollectReport(
            items=items,
            node_id=report.nodeid or None,
        )
        # Append items to the result object.
        self._result.items.extend(items)
        # Write the event to the output file.
        self._write_event(data)

    # Add a section to terminal summary reporting.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_terminal_summary
    def pytest_terminal_summary(self, terminalreporter: TerminalReporter):
        if self.ndjson_filepath:
            terminalreporter.write_sep(
                "-", f"generated report log file: {self.ndjson_filepath.as_posix()}"
            )
        if self.json_filepath:
            terminalreporter.write_sep(
                "-", f"generated report file: {self.json_filepath.as_posix()}"
            )
