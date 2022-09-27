from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import InputRequired, Length


class SignupForm(FlaskForm):
    username = StringField("Username", validators=[InputRequired(), Length(max=50)])
    password = PasswordField("Password", validators=[InputRequired(), Length(max=50)])


class LoginForm(FlaskForm):
    username = StringField("Username", validators=[InputRequired(), Length(max=50)])
    password = PasswordField("Password", validators=[InputRequired(), Length(max=50)])
