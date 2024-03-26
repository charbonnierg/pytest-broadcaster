import pytest


@pytest.mark.skip
class TestFoo:
    """Test some scenario."""

    @pytest.mark.parametrize("x", [1, 2, 3])
    def test_bar(self, x: int) -> None:
        """Test something."""
        assert True
