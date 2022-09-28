# run with: python3 seed.py

from app import db, init_app
from app.models import User

app = init_app()
app.app_context().push()

db.drop_all()
db.create_all()
