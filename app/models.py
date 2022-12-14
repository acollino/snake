from app import db, bcrypt


class AssociationMatchUser(db.Model):
    """A representation of a particular User's performance in a match.
    Implemented for a multiplayer game, this records the User's final score and
    the time they left the game - which may be different for each user in the match."""

    __tablename__ = "association_match_user"

    match_id = db.Column(db.Integer, db.ForeignKey("matches.id"), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    time_end = db.Column(
        db.DateTime(timezone=True), default=db.func.now(), onupdate=db.func.now()
    )
    score = db.Column(db.Integer)


class User(db.Model):
    """A representation of a single User of the Snake Game website, with
    class methods to handle account creation and login authentication."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    matches = db.relationship(
        "Match",
        secondary="association_match_user",
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
    """A representation of a single match. Implemented with multiplayer
    games in consideration, this records the elements that will be consistent
    for all players in a match - the start time, the difficulty level, and the
    winner of the match."""

    __tablename__ = "matches"

    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    difficulty = db.Column(db.Text, nullable=False)
    winner_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in Match.__table__.columns}
