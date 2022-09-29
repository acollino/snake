from flask import render_template, jsonify, session
import requests
import os
import random
import datetime
from app.daily_snake import daily_snake_bp


@daily_snake_bp.route("/get/speciesname", methods=["GET"])
def get_species_name():
    """Get the name of the snake of the day from the API-Ninjas snake list."""
    daily_snake = session.get("daily_snake", False)
    if not daily_snake or daily_snake["date"] != str(datetime.date.today()):
        params = {"name": "snake"}
        headers = {"X-Api-Key": os.getenv("Ninjas-Api-Key", "")}
        resp = requests.get(
            "https://api.api-ninjas.com/v1/animals", params=params, headers=headers
        )
        if resp.status_code == requests.codes.ok:
            pick_snake(resp.json())
        else:
            resp.raise_for_status()
    return jsonify(session["daily_snake"].get("snake"))


@daily_snake_bp.route("/getname", methods=["GET"])
def get_snake_name():
    return render_template("daily_snake.html")


@daily_snake_bp.route("/get/snakearray", methods=["GET"])
def get_snake_array():
    """Get the name of the snake of the day from the API-Ninjas snake list."""
    params = {"name": "snake"}
    headers = {"X-Api-Key": os.getenv("Ninjas-Api-Key", "")}
    resp = requests.get(
        "https://api.api-ninjas.com/v1/animals", params=params, headers=headers
    )
    return jsonify({"headers": headers, "resp": resp.json(), "env": os.environ})
    if resp.status_code == requests.codes.ok:
        return jsonify(resp.json())
    else:
        return jsonify({"headers": headers, "resp": resp.json()})


def pick_snake(snake_list):
    """Pick a snake from the list, returning one that has not been chosen before."""
    session.permanent = True
    prior_indices = session.get("prior_indices", [])
    valid_indices = set(range(0, len(snake_list))) - set(prior_indices)
    snake_index = random.choice(list(valid_indices))
    session["daily_snake"] = {
        "index": snake_index,
        "date": str(datetime.date.today()),
        "snake": snake_list[snake_index],
    }
    prior_indices.append(snake_index)


# if there are no valid indices, need to start over
# can return full array as well
# make get_species_name a post request, store prior indices on localStorage
# send those indices with the request.


@daily_snake_bp.route("/get/speciesdetails", methods=["POST"])
def get_species_details():
    pass
