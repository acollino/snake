from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import InputRequired, Length


class SignupForm(FlaskForm):
    """A representation of a user account signup form.
    While a single form could have been used in both cases, they were
    written separately to simplify future changes to the signup, i.e. including
    an email for account recovery purposes."""

    username = StringField(
        "Username",
        validators=[
            InputRequired(message="A username is required"),
            Length(max=50, message="Usernames must be 50 characters or less"),
        ],
    )
    password = PasswordField(
        "Password",
        validators=[
            InputRequired(message="A password is required"),
            Length(max=50, message="Passwords must be 50 characters or less"),
        ],
    )


class LoginForm(FlaskForm):
    """A representation of a user account login form."""

    username = StringField(
        "Username",
        validators=[
            InputRequired(message="A username is required"),
            Length(max=50, message="Usernames must be 50 characters or less"),
        ],
    )
    password = PasswordField(
        "Password",
        validators=[
            InputRequired(message="A password is required"),
            Length(max=50, message="Passwords must be 50 characters or less"),
        ],
    )
