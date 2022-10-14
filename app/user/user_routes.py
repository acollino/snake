from flask import redirect, session, jsonify, flash
from app.user.user_forms import SignupForm, LoginForm
from app.models import User, Match, AssociationMatchUser
from app.user import user_bp
from app import db


@user_bp.route("/signup", methods=["GET", "POST"])
def signup_form():
    form = SignupForm(prefix="signup")
    errors = {}
    if form.validate_on_submit():
        added = User.signup(form.username.data, form.password.data)
        if added:
            session["user"] = added.id
            return redirect("/")
        else:
            errors["signup_error"] = "That username is taken, please choose another."
    else:
        errors.update(form.errors)
    return jsonify(errors)


@user_bp.route("/login", methods=["GET", "POST"])
def login_form():
    form = LoginForm(prefix="login")
    errors = {}
    if form.validate_on_submit():
        user = User.authenticate(form.username.data, form.password.data)
        if user:
            session["user"] = user.id
            return redirect("/")
        else:
            errors["login_error"] = "The username or password was incorrect."
    else:
        errors.update(form.errors)
    return jsonify(errors)


@user_bp.route("/logout", methods=["GET"])
def logout():
    if "user" in session:
        session.pop("user")
    return redirect("/")


@user_bp.route("/stats", methods=["POST"])
def user_stats():
    """Retrieves the user's stats and recent matches,
    converting them to dicts to send them as JSON."""
    if "user" in session:
        curr_user = User.query.get(session["user"])
        if curr_user:
            match_history_query = (
                Match.query.with_entities(
                    Match.time,
                    Match.difficulty,
                    Match.winner_id,
                    AssociationMatchUser.score,
                    AssociationMatchUser.time_end,
                )
                .join(AssociationMatchUser, Match.id == AssociationMatchUser.match_id)
                .filter(AssociationMatchUser.user_id == curr_user.id)
                .order_by(Match.time.desc())
                .limit(5)
                .all()
            )
            match_history = [match._asdict() for match in match_history_query]
            match_counts = (
                Match.query.with_entities(
                    db.func.count(Match.winner_id)
                    .filter(Match.winner_id == curr_user.id)
                    .label("win"),
                    db.func.count(AssociationMatchUser.match_id).label("total"),
                    db.func.coalesce(db.func.max(AssociationMatchUser.score), 0).label(
                        "high_score"
                    ),
                )
                .join(AssociationMatchUser, Match.id == AssociationMatchUser.match_id)
                .filter(AssociationMatchUser.user_id == curr_user.id)
                .first()
                ._asdict()
            )
            return jsonify(
                {
                    "matches": match_history,
                    "counts": match_counts,
                    "user_id": curr_user.id,
                }
            )
        else:
            return jsonify(
                {
                    "error": "There was a problem retrieving your account information from the database."
                }
            )
    else:
        return jsonify({"error": "You must be logged in to view your user statistics."})
