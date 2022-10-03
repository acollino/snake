from flask import jsonify
import requests
import os
from app.daily_snake import daily_snake_bp


@daily_snake_bp.route("/snakearray", methods=["POST"])
def get_snake_array():
    """Get the name of the snake of the day from the API-Ninjas snake list."""
    params = {"name": "snake"}
    headers = {"X-Api-Key": os.getenv("NINJAS_API_KEY", "")}
    resp = requests.get(
        "https://api.api-ninjas.com/v1/animals", params=params, headers=headers
    )
    if resp.status_code == requests.codes.ok:
        return jsonify(resp.json())
    else:
        envs = [f"{k}: {v}" for k, v in sorted(os.environ.items())]
        return jsonify({"headers": headers, "resp": resp.json(), "env": envs})
