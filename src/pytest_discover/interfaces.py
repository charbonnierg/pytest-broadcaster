from __future__ import annotations

import abc
import warnings
from typing import Any, Literal

import pytest

from .models.collect_report import CollectReport
from .models.discovery_event import DiscoveryEvent
from .models.discovery_result import DiscoveryResult
from .models.error_message import ErrorMessage
from .models.session_finish import SessionFinish
from .models.session_start import SessionStart
from .models.test_case_call import TestCaseCall
from .models.test_case_finished import TestCaseFinished
from .models.test_case_setup import TestCaseSetup
from .models.test_case_teardown import TestCaseTeardown
from .models.warning_message import WarningMessage


class Destination(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def write_event(self, event: DiscoveryEvent) -> None: ...

    @abc.abstractmethod
    def write_results(self, result: DiscoveryResult) -> None: ...

    @abc.abstractmethod
    def summary(self) -> str | None: ...

    def open(self) -> None:
        pass

    def close(self) -> None:
        pass

    def __enter__(self) -> Destination:
        self.open()
        return self

    def __exit__(self, exc_type: object, exc_val: object, exc_tb: object) -> None:
        self.close()


class Reporter(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def make_session_result(self) -> DiscoveryResult | None: ...

    @abc.abstractmethod
    def make_session_start(self) -> SessionStart: ...

    @abc.abstractmethod
    def make_session_finish(self, exit_status: int) -> SessionFinish: ...

    @abc.abstractmethod
    def make_warning_message(
        self,
        warning_message: warnings.WarningMessage,
        when: Literal["config", "collect", "runtest"],
        nodeid: str,
    ) -> WarningMessage: ...

    @abc.abstractmethod
    def make_error_message(
        self, report: pytest.CollectReport, call: pytest.CallInfo[Any]
    ) -> ErrorMessage: ...
    def make_collect_report(self, report: pytest.CollectReport) -> CollectReport: ...

    @abc.abstractmethod
    def make_test_case_step(
        self, report: pytest.TestReport
    ) -> TestCaseCall | TestCaseSetup | TestCaseTeardown: ...

    @abc.abstractmethod
    def make_test_case_finished(self, node_id: str) -> TestCaseFinished: ...
