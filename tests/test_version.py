import pytest


@pytest.mark.buildmeta
def test_pytest_discover_version():
    """Test pytest_discover version is generated."""

    from pytest_discover import __version__, __version_tuple__

    assert isinstance(__version__, str)
    assert isinstance(__version_tuple__, tuple)
