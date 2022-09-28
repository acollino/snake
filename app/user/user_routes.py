from sys import prefix
from flask import render_template, redirect, session
from app.user.user_forms import SignupForm, LoginForm
from app.models import User
from app.user import user_bp


@user_bp.route("/signup", methods=["GET", "POST"])
def signup_form():
    form = SignupForm(prefix="signup")
    if form.validate_on_submit():
        added = User.signup(form.username.data, form.password.data)
        session["user"] = form.username.data
        return redirect("/")
    return render_template("signup.html", form=form)


@user_bp.route("/login", methods=["GET", "POST"])
def login_form():
    form = LoginForm(prefix="login")
    if form.validate_on_submit():
        user = User.authenticate(form.username.data, form.password.data)
        if user:
            session["user"] = user.username
            return redirect("/")
    return render_template("login.html", form=form)


@user_bp.route("/logout", methods=["GET"])
def logout():
    if "user" in session:
        session.pop("user")
    return redirect("/")


@user_bp.route("/profile")
def show_profile():
    pass
