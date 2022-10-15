from flask import request, session, jsonify
from app import db
from app.game import game_bp
from app.models import AssociationMatchUser, Match


@game_bp.route("/start_match", methods=["POST"])
def start_match():
    """Start recording match data by creating entries in the Match and
    AssociationMatchUser tables."""
    curr_user_id = session.get("user", None)
    if curr_user_id:
        match = Match(difficulty=request.json.get("difficulty", "Normal"))
        db.session.add(match)
        db.session.commit()
        match_assoc = AssociationMatchUser(user_id=curr_user_id, match_id=match.id)
        db.session.add(match_assoc)
        db.session.commit()
        return jsonify({"recorded": True, "match_id": match.id})
    return jsonify({"recorded": False})


@game_bp.route("/update_match/<int:id>", methods=["POST"])
def update_match(id):
    """Find the matching AssociationMatchUser entry, then update it with
    the player's score. This also triggers the row's onupdate property,
    recording the time_end column to be the time the score was recorded."""
    curr_user_id = session.get("user", None)
    if curr_user_id:
        match_assoc = AssociationMatchUser.query.filter(
            AssociationMatchUser.user_id == curr_user_id,
            AssociationMatchUser.match_id == id,
        ).first()
        if match_assoc:
            match_assoc.score = request.json.get("score", 0)
            db.session.commit()
            return jsonify({"recorded": True, "score": match_assoc.score})
    return jsonify({"recorded": False})


@game_bp.route("/direction", methods=["POST"])
def record_direction():
    """Meant for multiplayer use, the receives a direction input from a
    user, allowing it to be broadcast simultaneously to other users in
    the match. Not fully implemented."""
    direction = request.json.get("direction", None)
    if direction:
        return jsonify({"recorded": True, "direction": direction})
    else:
        return jsonify({"recorded": False})
