"""Re-export agents test fakes for backend tests and tools."""

from educaptcha_agents.testing import FakeStructuredModel, install_fake, load_cassettes

__all__ = ["FakeStructuredModel", "install_fake", "load_cassettes"]
