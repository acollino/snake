from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Create instance of the database
db = SQLAlchemy()
bcrypt = Bcrypt()

# The argument refers to which config class to use
def init_app(config="ProdConfig"):
    """Initialize the application"""

    # Initialize the app and set the required configs
    app = Flask(__name__)
    app.config.from_object(f"config.{config}")

    # Initialize database
    db.init_app(app)

    """ 
    Use app_context to ensure functions within the block can access current_app, which
    can be helpful to access the config or log errors.
    """
    with app.app_context():

        db.create_all()

        from app.home import home_bp
        from app.daily_snake import daily_snake_bp
        from app.user import user_bp

        # Register blueprints. If needed, url_prefix param can be set to append a string (ie '/users')
        # to the route url.

        app.register_blueprint(home_bp)
        app.register_blueprint(daily_snake_bp)
        app.register_blueprint(user_bp)

        return app
