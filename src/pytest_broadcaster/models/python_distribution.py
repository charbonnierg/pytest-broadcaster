# generated by datamodel-codegen:
#   filename:  python_distribution.json

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import List, Optional


class Releaselevel(Enum):
    """
    The release level of the python interpreter.
    """

    alpha = "alpha"
    beta = "beta"
    candidate = "candidate"
    final = "final"


@dataclass
class Version:
    """
    The version of the python interpreter being used to run the tests.
    """

    major: int
    """
    The major version of the python interpreter.
    """
    minor: int
    """
    The minor version of the python interpreter.
    """
    micro: int
    """
    The micro version of the python interpreter.
    """
    releaselevel: Releaselevel
    """
    The release level of the python interpreter.
    """


class Platform(Enum):
    """
    The platform of the python interpreter.
    """

    linux = "linux"
    darwin = "darwin"
    java = "java"
    windows = "windows"
    unknown = "unknown"


@dataclass
class Package:
    name: Optional[str] = None
    """
    The name of the package.
    """
    version: Optional[str] = None
    """
    The version of the package.
    """


@dataclass
class PythonDistribution:
    """
    Metadata about the python interpreter being used to run the tests.
    """

    version: Version
    """
    The version of the python interpreter being used to run the tests.
    """
    processor: str
    """
    The processor architecture of the python interpreter.
    """
    platform: Platform
    """
    The platform of the python interpreter.
    """
    packages: List[Package]
    """
    The packages installed in the python interpreter.
    """
