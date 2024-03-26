def test_pytest_discover_version():
    from pytest_discover.__about__ import __version__, __version_tuple__

    assert isinstance(__version__, str)
    assert isinstance(__version_tuple__, tuple)
