from __future__ import annotations

import json
import warnings
from dataclasses import asdict
from enum import Enum
from typing import TYPE_CHECKING, Any, Literal, TextIO

import pytest
from _pytest.pathlib import Path  # pyright: ignore[reportPrivateImportUsage]
from _pytest.terminal import TerminalReporter

from pytest_discover.models.location import Location
from pytest_discover.models.outcome import Outcome
from pytest_discover.models.test_case import TestCase
from pytest_discover.models.test_case_call import TestCaseCall
from pytest_discover.models.test_case_error import TestCaseError
from pytest_discover.models.test_case_finished import TestCaseFinished
from pytest_discover.models.test_case_report import TestCaseReport
from pytest_discover.models.test_case_setup import TestCaseSetup
from pytest_discover.models.test_case_teardown import TestCaseTeardown
from pytest_discover.models.test_directory import TestDirectory
from pytest_discover.models.test_module import TestModule
from pytest_discover.models.test_suite import TestSuite
from pytest_discover.models.traceback import Entry, Traceback

from .__about__ import __version__
from .internal import _fields as api
from .models.collect_report import CollectReport
from .models.discovery_result import DiscoveryResult
from .models.error_message import ErrorMessage
from .models.session_finish import SessionFinish
from .models.session_start import SessionStart
from .models.warning_message import WarningMessage

if TYPE_CHECKING:
    from .models.discovery_event import DiscoveryEvent


__PLUGIN_ATTR__ = "_collect_log_plugin"


def create_plugin(
    config: pytest.Config,
    json_path: str | None,
    json_lines_path: str | None,
) -> PytestDiscoverPlugin:
    """Create and register a new pytest-discover plugin instance.

    Args:
        config: The pytest configuration object.
        json_path: The path to the JSON output file.
        json_lines_path: The path to the JSON Lines output file.

    Returns:
        The created and registered plugin instance.
    """
    # Create plugin instance.
    plugin = PytestDiscoverPlugin(config, json_path, json_lines_path)
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
        help="Path to JSON output file holding collected items.",
    )
    group.addoption(
        "--collect-log",
        action="store",
        metavar="path",
        default=None,
        help="Path to JSON Lines output file where events are logged to.",
    )


# Perform initial plugin configuration, called once after command line options have been parsed.
# Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_configure
def pytest_configure(config: pytest.Config) -> None:
    json_lines_path = config.option.collect_log
    json_path = config.option.collect_report
    if not (json_lines_path or json_path):
        return
    # Skip if workerinput is present, which means we are in a worker process.
    if hasattr(config, "workerinput"):
        return
    # Create and register the plugin.
    plugin = create_plugin(config, json_path, json_lines_path)
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
        json_lines_filepath: str | None,
    ) -> None:
        """Initialize the plugin with the given configuration and file path.

        Args:
            config: The pytest configuration object.
            json_filepath: The path to the JSON output file.
            json_lines_filepath: The path to the JSON Lines output file.

        """
        self.config = config
        self.json_filepath = Path(json_filepath) if json_filepath else None
        self.json_lines_filepath = (
            Path(json_lines_filepath) if json_lines_filepath else None
        )
        self._roots: dict[str, str] = {}
        self._file: TextIO | None = None
        self._result = DiscoveryResult(
            pytest_version=pytest.__version__,
            plugin_version=__version__,
            exit_status=0,
            warnings=[],
            errors=[],
            collect_reports=[],
            test_reports=[],
        )
        self._pending_report: TestCaseReport | None = None

    def _get_path(self, path: str, is_error_or_warning: bool = False) -> str:
        for root in self._roots:
            if path.startswith(root):
                return self._roots[root] + "/" + path[len(root) + 1 :]
        pathobj = Path(path)
        if pathobj.is_dir():
            self._roots[path] = pathobj.name
            return pathobj.name
        if pathobj.is_file():
            if not is_error_or_warning:
                self._roots[path] = pathobj.parent.name
                return f"{pathobj.parent.name}/{pathobj.name}"
        return path

    def open(self) -> None:
        """Open the JSON Lines output file for writing."""
        if self.json_lines_filepath is None:
            return
        if self._file is not None:
            raise RuntimeError("pytest-discover output file is already opened")
        # Ensure the directory exists.
        self.json_lines_filepath.parent.mkdir(parents=True, exist_ok=True)
        # Open the text file in write mode.
        self._file = self.json_lines_filepath.open("wt", buffering=1, encoding="UTF-8")

    def close(self) -> None:
        """Close the JSON Lines output file and write the JSON result file."""
        if self._file is not None:
            self._file.close()
            self._file = None
        if self.json_filepath is not None:
            json_data = json.dumps(
                asdict(self._result),
                default=_default_serializer,
                indent=2,
            )
            self.json_filepath.write_text(json_data)

    def _write_event(
        self,
        data: DiscoveryEvent,
    ) -> None:
        if self.json_lines_filepath is None:
            return
        if self._file is None:
            raise RuntimeError("pytest-discover output file is not open yet")
        json_data = json.dumps(
            asdict(data),
            default=_default_serializer,
        )
        self._file.write(json_data + "\n")
        self._file.flush()

    # Called after the Session object has been created and before performing collection and entering the run test loop.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_sessionstart
    def pytest_sessionstart(self) -> None:
        event = SessionStart(
            pytest_version=pytest.__version__, plugin_version=__version__
        )
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
            location=Location(
                filename=self._get_path(warning_message.filename, True),
                lineno=warning_message.lineno,
            ),
            message=api.make_warning_message(warning_message),
            when=when,  # type: ignore[arg-type],
            node_id=nodeid,
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
        exc_info: pytest.ExceptionInfo[BaseException] | None = call.excinfo
        assert exc_info, "exception info is missing"
        exc_repr = exc_info.getrepr()
        assert exc_repr.reprcrash, "exception crash repr is missing"
        traceback_lines = api.make_traceback_from_reprtraceback(exc_repr.reprtraceback)
        msg = ErrorMessage(
            when=call.when,  # type: ignore[arg-type]
            location=Location(
                filename=self._get_path(exc_repr.reprcrash.path, True),
                lineno=exc_repr.reprcrash.lineno,
            ),
            traceback=Traceback(
                entries=[
                    Entry(
                        lineno=line.lineno,
                        path=line.path,
                        message=line.message,
                    )
                    for line in traceback_lines
                ]
            ),
            exception_type=exc_info.typename,
            exception_value=str(exc_info.value),
        )
        self._result.errors.append(msg)
        self._write_event(msg)

    # Collector finished collecting.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_collectreport
    def pytest_collectreport(self, report: pytest.CollectReport) -> None:
        if report.failed:
            return
        items: list[TestCase | TestDirectory | TestModule | TestSuite] = []
        # Format all test items discovered
        for result in report.result:
            if isinstance(result, pytest.Directory):
                items.append(
                    TestDirectory(
                        node_id=result.nodeid,
                        name=result.path.name,
                        path=self._get_path(result.path.as_posix()),
                    )
                )
                continue
            if isinstance(result, pytest.Module):
                items.append(
                    TestModule(
                        node_id=result.nodeid,
                        name=result.name,
                        path=self._get_path(result.path.as_posix()),
                        markers=api.field_markers(result),
                        doc=api.field_doc(result),
                    )
                )
                continue
            if isinstance(result, pytest.Class):
                node_id = api.make_node_id(result)
                assert node_id.module
                items.append(
                    TestSuite(
                        node_id=result.nodeid,
                        name=result.name,
                        module=node_id.module,
                        path=self._get_path(result.path.as_posix()),
                        doc=api.field_doc(result),
                        markers=api.field_markers(result),
                    )
                )
                continue
            if isinstance(result, pytest.Function):
                node_id = api.make_node_id(result)
                item = TestCase(
                    node_id=node_id.value,
                    name=node_id.name,
                    module=node_id.module,
                    suite=node_id.suite(),
                    function=node_id.func,
                    path=self._get_path(result.path.as_posix()),
                    doc=api.field_doc(result),
                    markers=api.field_markers(result),
                    parameters=api.field_parameters(result),
                )
                items.append(item)
        # Generate a collect report event.
        data = CollectReport(
            items=items,
            node_id=report.nodeid or "",
        )
        # Append repot to the result object.
        self._result.collect_reports.append(data)
        # Write the event to the output file.
        self._write_event(data)

    # Process the TestReport produced for each of the setup, call and teardown runtest steps of an item.
    # Ref: https://docs.pytest.org/en/7.1.x/reference/reference.html#pytest.hookspec.pytest_runtest_logreport
    def pytest_runtest_logreport(self, report: pytest.TestReport) -> None:
        # Always validate the outcome
        outcome = Outcome(report.outcome)
        # Let's process the error if any
        error: TestCaseError | None = None
        if report.failed:
            error = TestCaseError(
                message=report.longreprtext,
                traceback=Traceback(
                    entries=[
                        Entry(path=line.path, lineno=line.lineno, message=line.message)
                        for line in api.make_traceback(report)
                    ]
                ),
            )
        # Let's process the report based on the step
        step: TestCaseSetup | TestCaseCall | TestCaseTeardown
        if report.when == "setup":
            step = TestCaseSetup(
                node_id=report.nodeid,
                outcome=outcome,
                duration=report.duration,
                error=error,
                start=api.make_timestamp(report.start),
                stop=api.make_timestamp(report.stop),
            )
            self._pending_report = TestCaseReport(
                node_id=report.nodeid,
                outcome=outcome,
                duration=step.duration,
                setup=step,
                teardown=...,  # type: ignore (will be set later)
                finished=...,  # type: ignore (will be set later)
            )
        elif report.when == "call":
            if outcome == Outcome.skipped and hasattr(report, "wasxfail"):
                outcome = Outcome.xfailed
            step = TestCaseCall(
                node_id=report.nodeid,
                outcome=outcome,
                duration=report.duration,
                error=error,
                start=api.make_timestamp(report.start),
                stop=api.make_timestamp(report.stop),
            )
            assert (
                self._pending_report
            ), "pending report is missing, this is a bug in pytest-discover plugin"
            self._pending_report.call = step

        elif report.when == "teardown":
            step = TestCaseTeardown(
                node_id=report.nodeid,
                outcome=outcome,
                duration=report.duration,
                error=error,
                start=api.make_timestamp(report.start),
                stop=api.make_timestamp(report.stop),
            )
            assert (
                self._pending_report
            ), "pending report is missing, this is a bug in pytest-discover plugin"
            self._pending_report.teardown = step
        else:
            return
        self._write_event(step)

    # Called at the end of running the runtest protocol for a single item.
    # Ref: https://docs.pytest.org/en/7.1.x/reference/reference.html#pytest.hookspec.pytest_runtest_logfinish
    def pytest_runtest_logfinish(
        self, nodeid: str, location: tuple[str, int | None, str]
    ) -> None:
        # Let's pop the pending report (we always have one)
        pending_report = self._pending_report
        assert (
            pending_report
        ), "pending report is missing, this is a bug in pytest-discover plugin"
        # Get all reports
        reports = [
            report
            for report in (
                pending_report.setup,
                pending_report.call,
                pending_report.teardown,
            )
            if report is not None
        ]
        # Detect if test was failed
        if any(report.outcome == Outcome.failed for report in reports):
            outcome = Outcome.failed
        elif any(report.outcome == Outcome.xfailed for report in reports):
            outcome = Outcome.xfailed
        # Detect if test was skipped
        elif any(report.outcome == Outcome.skipped for report in reports):
            outcome = Outcome.skipped
        # Else consider test passed
        else:
            outcome = Outcome.passed
        duration = sum(report.duration for report in reports)
        # Create the finished event and the report
        finished = TestCaseFinished(
            node_id=nodeid,
            outcome=outcome,
            duration=duration,
            start=pending_report.setup.start,
            stop=pending_report.teardown.stop,
        )
        report = TestCaseReport(
            node_id=nodeid,
            outcome=outcome,
            finished=finished,
            setup=pending_report.setup,
            call=pending_report.call,
            teardown=pending_report.teardown,
            duration=duration,
        )
        self._write_event(finished)
        self._result.test_reports.append(report)
        self._pending_report = None

    # Add a section to terminal summary reporting.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_terminal_summary
    def pytest_terminal_summary(self, terminalreporter: TerminalReporter):
        if self.json_lines_filepath:
            terminalreporter.write_sep(
                "-", f"generated report log file: {self.json_lines_filepath.as_posix()}"
            )
        if self.json_filepath:
            terminalreporter.write_sep(
                "-", f"generated report file: {self.json_filepath.as_posix()}"
            )


def _default_serializer(obj: object) -> object:
    if isinstance(obj, Enum):
        return obj.value
    return obj
