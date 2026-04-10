# Подключение к базе данных PostgreSQL
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# URL подключения к базе данных
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://traceai:traceai_pass@localhost:5432/traceai_db"
)

# Создаём движок базы данных
engine = create_engine(DATABASE_URL)

# Фабрика сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()