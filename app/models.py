from app import db, bcrypt


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)

    @classmethod
    def signup(User, username, password):
        newUser = User(username, bcrypt.generate_password_hash(password))
        try:
            db.session.add(newUser)
            db.session.commit()
            return newUser
        except BaseException as err:
            db.session.rollback()
            print(f"Unexpected Error: {err}, {type(err)}")
            return None

    @classmethod
    def authenticate(User, username, password):
        user_record = User.query.filter(User.username == username).first()
        if user_record:
            hashed_password = bcrypt.generate_password_hash(password)
            if user_record.password == hashed_password:
                return user_record
        return False
