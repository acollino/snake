from flask import Blueprint

game_bp = Blueprint("game", __name__, template_folder="templates")

from . import game_routes
