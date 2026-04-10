# Главный файл FastAPI приложения TraceAI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import uvicorn

# Импортируем роуты
from auth import router as auth_router
from routes.chat import router as chat_router
from routes.documents import router as documents_router
from routes.audit import router as audit_router

# Создаём все таблицы в базе данных
Base.metadata.create_all(bind=engine)

# Создаём приложение
app = FastAPI(
    title="TraceAI API",
    description="Корпоративный AI с доказуемой историей каждого решения",
    version="1.0.0"
)

# Разрешаем запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
   allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роуты
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(documents_router)
app.include_router(audit_router)

# Главная страница
@app.get("/")
def root():
    return {
        "product": "TraceAI",
        "version": "1.0.0",
        "status": "running"
    }

# Проверка здоровья сервера
@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)