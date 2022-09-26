from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from os import path, environ
from dotenv import load_dotenv

# Create instance of the database
db = SQLAlchemy()
bcrypt = Bcrypt()

# The argument refers to which .env file to use, ie test.env, dev.env
# The default of .env is used for production
def init_app(envFile="dev.env"):
    """Initialize the application"""

    # Load environ vars from the given file, which includes one for the config class to use
    base_directory = path.abspath(f"{path.dirname(__file__)}/..")
    load_dotenv(path.join(base_directory, envFile))

    # Initialize the app and set the required configs
    app = Flask(__name__)
    app.config.from_object(environ.get("CONFIG"))

    # Initialize database
    db.init_app(app)

    """ 
    Use app_context to ensure functions within the block can access current_app, which
    can be helpful to access the config or log errors.
    """
    with app.app_context():

        from app.home import home_bp
        from app.daily_snake import daily_snake_bp
        from app.user import user_bp

        # Register blueprints. If needed, url_prefix param can be set to append a string (ie '/users') to the route url.

        app.register_blueprint(home_bp)
        app.register_blueprint(daily_snake_bp)
        app.register_blueprint(user_bp)

        return app
