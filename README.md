# TraceAI

Корпоративный AI с доказуемой историей каждого решения.

## Стек технологий
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.12
- **База данных:** PostgreSQL 16
- **Кэш:** Redis 7
- **Контейнеры:** Docker

## Быстрый старт

### 1. Запустить базу данных
```bash
docker-compose up -d
```

### 2. Запустить бэкенд
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 3. Запустить фронтенд
```bash
cd frontend
npm install
npm run dev
```

## Адреса

| Сервис | Адрес |
|--------|-------|
| Фронтенд | http://localhost:3000 |
| Бэкенд | http://localhost:8000 |
| API Документация | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Структура проекта
traceai/
├── frontend/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── auth.py
│   ├── llm_gateway.py
│   └── routes/
├── docker-compose.yml
├── README.md
└── PRODUCT.md

## Переменные окружения

Создай файл `.env` в папке `backend`:
DATABASE_URL=postgresql://traceai:traceai_pass@localhost:5432/traceai_db
REDIS_URL=redis://localhost:6379
SECRET_KEY=твой_секретный_ключ
GIGACHAT_CLIENT_ID=твой_client_id
GIGACHAT_CLIENT_SECRET=твой_client_secret

## Контакты
- basedtech.ru
- t.me/basedtechnology