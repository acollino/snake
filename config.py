"""Classes for Flask configurations."""
from os import environ, path
from dotenv import load_dotenv

# Load environ vars from the given file
base_directory = path.abspath(f"{path.dirname(__file__)}/..")
load_dotenv(path.join(base_directory, ".env"))


class Config:
    """Set the base configuration for Flask."""

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = environ.get("SECRET_KEY")


class DevConfig(Config):
    """Set the development configuration for Flask."""

    SQLALCHEMY_DATABASE_URI = environ.get("DEV_DATABASE_URL", "")
    SQLALCHEMY_ECHO = True
    DEBUG = True


class ProdConfig(Config):
    """Set the production configuration for Flask."""

    SQLALCHEMY_DATABASE_URI = environ.get("DATABASE_URL", "").replace(
        "postgres://", "postgresql://"
    )
    # replace because hosting sites use 'postgres' - not supported by SQLAlchemy
    SQLALCHEMY_ECHO = False
    DEBUG = False


class TestConfig(Config):
    """Set the testing configuration for Flask."""

    SQLALCHEMY_DATABASE_URI = environ.get("TEST_DATABASE_URL", "")
    SQLALCHEMY_ECHO = True
    DEBUG = True
    TESTING = True
    WTF_CSRF_ENABLED = False
