# run with: python3 seed.py

from dotenv import load_dotenv
from sqlalchemy import inspect
from app import init_app, db
from app.models import AssociationMatchUser, Match, User

load_dotenv()
app = init_app("ProdConfig")
app.app_context().push()
inspector = inspect(db.engine)

# Perfomed because these tables should not typically be dropped,
# and the foreign key dependencies require they be dropped in
# this order, rather than using db.drop_all()
if inspector.has_table(AssociationMatchUser.__table__):
    AssociationMatchUser.__table__.drop(db.engine)
if inspector.has_table(Match.__table__):
    Match.__table__.drop(db.engine)
if inspector.has_table(User.__table__):
    User.__table__.drop(db.engine)

db.create_all()
