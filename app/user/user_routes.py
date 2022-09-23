from flask import render_template, redirect
from user_forms import SignupForm, LoginForm
from app.models import User
from app.user import user_bp


@user_bp.signup("/signup", method=["GET"])
def get_signup():
    pass


@user_bp.signup("/signup", method=["POST"])
def post_signup():
    pass


@user_bp.signup("/login", method=["GET"])
def get_login():
    pass


@user_bp.signup("/login", method=["POST"])
def post_login():
    pass


@user_bp.route("/profile")
def show_profile():
    pass
