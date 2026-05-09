from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from decouple import config

POSTGRES_USER = config("POSTGRES_USER")
POSTGRES_PASS = config("POSTGRES_PASS")
POSTGRES_DB = config("POSTGRES_DB")


# SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASS}@localhost:5434/{POSTGRES_DB}"
SQLALCHEMY_DATABASE_URL = "postgresql://neondb_owner:npg_ZLq65UbSWmTP@ep-ancient-pond-aljq6sbs-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"sslmode": "require"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()