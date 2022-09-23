from flask import Blueprint

daily_snake_bp = Blueprint(
    "daily_snake",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/daily_snake/static",
)

from . import daily_snake_routes
