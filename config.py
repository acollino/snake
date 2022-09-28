"""Classes for Flask configurations."""
from datetime import timedelta
from os import environ


class Config:
    """Set the base configuration for Flask."""

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = environ.get("DATABASE_URL", "").replace(
        "postgres://", "postgresql://"
    )
    # replace because heroku uses 'postgres' - not supported by SQLAlchemy
    SECRET_KEY = environ.get("SECRET_KEY")
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)


class DevConfig(Config):
    """Set the development configuration for Flask."""

    SQLALCHEMY_ECHO = True
    DEBUG = True


class ProdConfig(Config):
    """Set the production configuration for Flask."""

    SQLALCHEMY_ECHO = False
    DEBUG = False


class TestConfig(Config):
    """Set the testing configuration for Flask."""

    SQLALCHEMY_ECHO = True
    DEBUG = True
    TESTING = True
    WTF_CSRF_ENABLED = False
