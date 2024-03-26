from __future__ import annotations
from dataclasses import asdict
import json
from typing import TextIO
from typing_extensions import Literal
import warnings

from _pytest.pathlib import Path  # pyright: ignore[reportPrivateImportUsage]
from _pytest.terminal import TerminalReporter

from .models.collect_report import CollectReport
from .models.session_finish import SessionFinish
from .models.session_start import SessionStart
from .models.warning_message import WarningMessage
from . import _fields as api


import pytest

__PLUGIN_ATTR__ = "_collect_log_plugin"


def create_plugin(config: pytest.Config, filename: str) -> PytestDiscoverPlugin:
    """Create and register a new pytest-discover plugin instance.

    Args:
        config: The pytest configuration object.
        filename: The path to the output file.

    Returns:
        The created and registered plugin instance.
    """
    # Create plugin instance.
    plugin = PytestDiscoverPlugin(config, Path(filename))
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
        "--collect-log",
        action="store",
        metavar="path",
        default=None,
        help="Path to line-based json objects of items collection.",
    )


# Perform initial plugin configuration, called once after command line options have been parsed.
# Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_configure
def pytest_configure(config: pytest.Config) -> None:
    log_path = config.option.collect_log
    if not log_path:
        return
    # Skip if workerinput is present, which means we are in a worker process.
    if hasattr(config, "workerinput"):
        return
    # Create and register the plugin.
    plugin = create_plugin(config, log_path)
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
        filepath: Path,
    ) -> None:
        """Initialize the plugin with the given configuration and file path.

        Args:
            config: The pytest configuration object.
            filepath: The path to the output file.
        """
        self.config = config
        self.filepath = filepath
        self._file: TextIO | None = None

    def open(self) -> None:
        """Open the output file for writing."""
        if self._file is not None:
            raise RuntimeError("pytest-discover output file is already opened")
        # Ensure the directory exists.
        self.filepath.parent.mkdir(parents=True, exist_ok=True)
        # Open the text file in write mode.
        self._file = self.filepath.open("wt", buffering=1, encoding="UTF-8")

    def close(self) -> None:
        """Close the output file."""
        if self._file is not None:
            self._file.close()
            self._file = None

    def _write_event(
        self, data: CollectReport | SessionFinish | SessionStart | WarningMessage
    ) -> None:
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
        self._write_event(event)

    # Collector finished collecting.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_collectreport
    def pytest_collectreport(self, report: pytest.CollectReport) -> None:
        if report.failed:
            # TODO: Handle case when collect fails
            return
        for result in report.result:
            if not isinstance(result, pytest.Item):
                continue
            data = CollectReport(
                node_id=api.field_id(result),
                name=api.field_name(result),
                doc=api.field_doc(result),
                markers=api.field_markers(result),
                parameters=api.field_parameters(result),
                module=api.field_module(result),
                function=api.field_function(result),
                parent=api.field_class(result),
                file=api.field_file(result),
            )
            self._write_event(data)

    # Add a section to terminal summary reporting.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_terminal_summary
    def pytest_terminal_summary(self, terminalreporter: TerminalReporter):
        terminalreporter.write_sep(
            "-", f"generated report log file: {self.filepath.as_posix()}"
        )
