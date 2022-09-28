from app import db, bcrypt


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)

    @classmethod
    def signup(User, username, password):
        new_user = User(
            username=username,
            password=bcrypt.generate_password_hash(password).decode("UTF-8"),
        )
        try:
            db.session.add(new_user)
            db.session.commit()
            return new_user
        except BaseException as err:
            db.session.rollback()
            print(f"Unexpected Error: {err}, {type(err)}")
            return None

    @classmethod
    def authenticate(User, username, password):
        user_record = User.query.filter(User.username == username).first()
        if user_record:
            if bcrypt.check_password_hash(user_record.password, password):
                return user_record
        return False
