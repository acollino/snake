from flask import render_template, redirect, session, jsonify
from app.user.user_forms import SignupForm, LoginForm
from app.models import User, Match
from app.user import user_bp
from app import db


@user_bp.route("/signup", methods=["GET", "POST"])
def signup_form():
    form = SignupForm(prefix="signup")
    if form.validate_on_submit():
        added = User.signup(form.username.data, form.password.data)
        session["user"] = added.id
        return redirect("/")
    return render_template("signup.html", form=form)


@user_bp.route("/login", methods=["GET", "POST"])
def login_form():
    form = LoginForm(prefix="login")
    if form.validate_on_submit():
        user = User.authenticate(form.username.data, form.password.data)
        if user:
            session["user"] = user.id
            return redirect("/")
    return render_template("login.html", form=form)


@user_bp.route("/logout", methods=["GET"])
def logout():
    if "user" in session:
        session.pop("user")
    return redirect("/")


@user_bp.route("/stats", methods=["POST"])
def user_stats():
    if "user" in session:
        curr_user = User.query.get(session["user"])
        if curr_user:

            match_history_query = (
                Match.query.join(User, Match.users).order_by(Match.time).limit(50).all()
            )
            match_history = [match.to_dict() for match in match_history_query]
            match_counts = (
                Match.query.with_entities(
                    db.func.count(Match.winner_id)
                    .filter(Match.winner_id == curr_user.id)
                    .label("win"),
                    db.func.sum(Match.winner_id).label("total"),
                )
                .join(User, Match.users)
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


@user_bp.route("/profile")
def show_profile():
    pass
