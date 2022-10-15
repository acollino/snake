from app.home import home_bp
from flask import render_template
from app.user.user_forms import SignupForm, LoginForm


@home_bp.route("/")
def home():
    """Initializes the signup and login forms, then displays
    the home page to the user."""
    signup_form = SignupForm(prefix="signup")
    login_form = LoginForm(prefix="login")
    return render_template("index.html", signup_form=signup_form, login_form=login_form)
