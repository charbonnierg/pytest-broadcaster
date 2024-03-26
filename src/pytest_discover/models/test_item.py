# generated by datamodel-codegen:
#   filename:  test_item.json

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class TestItem:
    """
    Pytest Test Item
    """

    node_id: str
    """
    Node ID
    """
    name: str
    """
    Test Name
    """
    doc: str
    """
    Test docstring
    """
    markers: List[str]
    """
    Test markers
    """
    parameters: Dict[str, str]
    """
    Test parameters names and types
    """
    event: str = "TestItem"
    file: Optional[str] = None
    """
    File path
    """
    module: Optional[str] = None
    """
    Module name
    """
    parent: Optional[str] = None
    """
    Class name
    """
    function: Optional[str] = None
    """
    Function name
    """
