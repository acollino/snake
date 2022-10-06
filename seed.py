# run with: python3 seed.py

from dotenv import load_dotenv
from app import init_app, db
from app.models import AssociationMatchUser, Match, User

load_dotenv()
app = init_app("ProdConfig")
app.app_context().push()

AssociationMatchUser.__table__.drop(db.engine)
Match.__table__.drop(db.engine)
User.__table__.drop(db.engine)
db.create_all()
