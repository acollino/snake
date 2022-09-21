from flask import Blueprint

snake_day_bp = Blueprint(
    "snake_day",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/snake_day/static",
)

from . import snake_day_routes
