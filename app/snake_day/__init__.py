from flask import Blueprint

snake_day_bp = Blueprint("snake_day", __name__, template_folder="templates")

from . import snake_day_routes
