from __future__ import annotations

import warnings
from contextlib import ExitStack
from typing import TYPE_CHECKING, Any, Literal

import pytest
from _pytest.terminal import TerminalReporter

from pytest_discover import hook_spec
from pytest_discover.interfaces import Destination, Reporter
from pytest_discover.internal._json_files import JSONFile, JSONLinesFile
from pytest_discover.internal._reporter import DefaultReporter
from pytest_discover.models.discovery_event import DiscoveryEvent
from pytest_discover.models.discovery_result import DiscoveryResult

if TYPE_CHECKING:
    pass


__PLUGIN_ATTR__ = "_collect_log_plugin"


# Register argparse-style options and ini-style config values, called once at the beginning of a test run.
# https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_addoption
def pytest_addoption(parser: pytest.Parser) -> None:
    group = parser.getgroup(
        name="terminal reporting",
        description="pytest-discover plugin options",
    )
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
    """Performs the following actions:

    - Extract the JSON output file path from the command line options.
    - Extract the JSON Lines output file path from the command line options.
    - Skip if neither JSON or JSON Lines output file path is provided.
    - Skip if workerinput is present, which means we are in a worker process.
    - Create and register the plugin instance.
    - Store the plugin instance in the config object.
    """
    # Skip if pytest-xdist worker
    if hasattr(config, "workerinput"):
        return
    # Create publishers
    publishers: list[Destination] = []
    if json_path := config.option.collect_report:
        publishers.append(JSONFile(json_path))
    if json_lines_path := config.option.collect_log:
        publishers.append(JSONLinesFile(json_lines_path))
    config.hook.pytest_discover_register_publisher(publishers=publishers)
    # Create reporter instance
    reporter = DefaultReporter()
    # Create plugin instance.
    plugin = PytestDiscoverPlugin(
        config=config,
        reporter=reporter,
        publishers=publishers,
    )
    # Open the plugin
    plugin.open()
    # Register the plugin with the plugin manager.
    config.pluginmanager.register(plugin)
    setattr(config, __PLUGIN_ATTR__, plugin)


# Called at plugin registration time to allow adding new hooks via a call to pluginmanager.add_hookspecs(module_or_class, prefix).
# Ref: https://docs.pytest.org/en/7.1.x/reference/reference.html#pytest.hookspec.pytest_addhooks
def pytest_addhooks(pluginmanager: pytest.PytestPluginManager) -> None:
    pluginmanager.add_hookspecs(hook_spec)


# Perform final plugin teardown, called once after all test are executed.
# Called once before test process is exited.
# Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_unconfigure
def pytest_unconfigure(config: pytest.Config) -> None:
    """Performs the following actions:

    - Extract the plugin instance from the config object.
    - Close the plugin instance.
    - Delete the plugin instance from the config object.
    """
    plugin: PytestDiscoverPlugin | None = getattr(config, __PLUGIN_ATTR__, None)
    if plugin:
        plugin.close()
        config.pluginmanager.unregister(plugin)
        delattr(config, __PLUGIN_ATTR__)


class PytestDiscoverPlugin:
    """A pytest plugin to log collection to a line-based JSON file."""

    def __init__(
        self,
        config: pytest.Config,
        reporter: Reporter,
        publishers: list[Destination],
    ) -> None:
        self.config = config
        self.publishers = publishers
        self.reporter = reporter
        self.stack = ExitStack()

    def open(self) -> None:
        """Open the plugin instance. It performs the following actions:

        - Skip if there is no JSON Lines output
        - Raise an error if the JSON Lines output file is already open.
        - Ensure the parent directory of JSON Lines output file exists.
        - Open the JSON Lines output file in write mode (erasing any previous content)
        """
        for publisher in self.publishers:
            self.stack.enter_context(publisher)

    def close(self) -> None:
        """Close the plugin instance. It performs the following actions:

        - Close the JSON Lines output file (if any).
        - Write the results to the JSON output file (if any)
        """
        try:
            result = self.reporter.make_session_result()
            if result is not None:
                self._write_result(result)
        finally:
            self.stack.close()

    def _write_event(self, event: DiscoveryEvent) -> None:
        """Write a discovery event to the JSON Lines output file."""
        for publisher in self.publishers:
            try:
                publisher.write_event(event)
            except Exception:
                continue

    def _write_result(self, result: DiscoveryResult) -> None:
        """Write the discovery result to the JSON output file."""
        for publisher in self.publishers:
            try:
                publisher.write_results(result)
            except Exception:
                continue

    # Called after the Session object has been created and before performing collection and entering the run test loop.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_sessionstart
    def pytest_sessionstart(self) -> None:
        self._write_event(self.reporter.make_session_start())

    # Called after whole test run finished, right before returning the exit status to the system.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_sessionfinish
    def pytest_sessionfinish(self, exitstatus: int) -> None:
        self._write_event(self.reporter.make_session_finish(exitstatus))

    # Process a warning captured by the internal pytest warnings plugin.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_warning_recorded
    def pytest_warning_recorded(
        self,
        warning_message: warnings.WarningMessage,
        when: Literal["config", "collect", "runtest"],
        nodeid: str,
        location: tuple[str, int, str] | None,
    ):
        self._write_event(
            self.reporter.make_warning_message(
                warning_message=warning_message,
                when=when,
                nodeid=nodeid,
            )
        )

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
        self._write_event(self.reporter.make_error_message(report, call))

    # Collector finished collecting.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_collectreport
    def pytest_collectreport(self, report: pytest.CollectReport) -> None:
        # Skip if the report failed.
        if report.failed:
            return
        self._write_event(self.reporter.make_collect_report(report))

    # Process the TestReport produced for each of the setup, call and teardown runtest steps of an item.
    # Ref: https://docs.pytest.org/en/7.1.x/reference/reference.html#pytest.hookspec.pytest_runtest_logreport
    def pytest_runtest_logreport(self, report: pytest.TestReport) -> None:
        self._write_event(self.reporter.make_test_case_step(report))

    # Called at the end of running the runtest protocol for a single item.
    # Ref: https://docs.pytest.org/en/7.1.x/reference/reference.html#pytest.hookspec.pytest_runtest_logfinish
    def pytest_runtest_logfinish(
        self, nodeid: str, location: tuple[str, int | None, str]
    ) -> None:
        self._write_event(self.reporter.make_test_case_finished(nodeid))

    # Add a section to terminal summary reporting.
    # Ref: https://docs.pytest.org/en/latest/reference/reference.html#pytest.hookspec.pytest_terminal_summary
    def pytest_terminal_summary(self, terminalreporter: TerminalReporter):
        for publisher in self.publishers:
            if summary := publisher.summary():
                terminalreporter.write_sep("-", f"generated report log file: {summary}")
