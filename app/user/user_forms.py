from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import InputRequired, Length


class SignupForm(FlaskForm):
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
