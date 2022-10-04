from app import db, bcrypt

match_users = db.Table(
    "match_users",
    db.Column("match_id", db.Integer, db.ForeignKey("matches.id"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    matches = db.relationship(
        "Match",
        secondary=match_users,
        lazy=True,
        backref=db.backref("users", lazy=True),
    )

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


class Match(db.Model):
    __tablename__ = "matches"

    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    winner_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in Match.__table__.columns}
