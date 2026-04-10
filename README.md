# TraceAI

Корпоративная платформа для работы с AI — каждый запрос, решение и изменение документа логируется автоматически.

**Боевой сервер:** http://85.193.85.81  
**API docs (Swagger):** http://85.193.85.81:8000/docs  
**Суперадминка:** http://85.193.85.81/admin

---

## Архитектура

```
┌─────────────────────────────────────────────────────┐
│                    nginx :80                        │
│   /      → Next.js  :3000  (фронтенд)              │
│   /api   → FastAPI  :8000  (бэкенд)                │
└─────────────────────────────────────────────────────┘

Бэкенд:  Python 3.12 · FastAPI · SQLAlchemy · PostgreSQL
Фронтенд: Next.js 16 · TypeScript · React
AI:       GigaChat (Sber) через GIGACHAT_CLIENT_SECRET
```

---

## Страницы фронтенда

| URL | Описание |
|-----|----------|
| `/login` | Вход / регистрация |
| `/dashboard` | Главная с KPI (реальные данные из API) |
| `/editor` | Редактор документов с AI-помощником |
| `/chat` | AI-чат с историей |
| `/analytics` | Статистика по типам AI-операций |
| `/audit` | Полный Audit Trail с фильтрами |
| `/admin` | Суперадминка (только `role=superadmin`) |

---

## API эндпоинты

### Auth — `/auth`
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/register` | Регистрация (создаёт компанию + пользователя с ролью admin) |
| POST | `/auth/login` | Вход, возвращает JWT-токен |
| GET  | `/auth/me` | Информация о текущем пользователе |

### Документы — `/documents`
| Метод | Путь | Описание |
|-------|------|----------|
| GET   | `/documents/` | Список документов компании |
| POST  | `/documents/` | Создать документ |
| GET   | `/documents/{id}` | Получить документ с контентом |
| PUT   | `/documents/{id}` | Обновить заголовок / контент / статус |
| POST  | `/documents/{id}/ai-assist` | AI-помощник для документа |

Статусы документа: `draft` → `review` → `approved` → `sent`

### AI-чат — `/chat`
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/chat/` | Отправить запрос к AI |
| GET  | `/chat/history` | История чата пользователя |

### Audit Trail — `/audit`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/audit/` | Лог событий компании (до 200, фильтры: `event_type`, `user_id`) |
| GET | `/audit/stats` | Агрегированная статистика по токенам и типам событий |

Типы событий: `ai_generation`, `document_created`, `document_edited`, `status_changed`

### Суперадмин — `/admin` (требует `role=superadmin`)
| Метод | Путь | Описание |
|-------|------|----------|
| GET   | `/admin/stats` | Платформенная статистика |
| GET   | `/admin/companies` | Все компании с метриками |
| GET   | `/admin/users` | Все пользователи |
| PATCH | `/admin/users/{id}` | Изменить роль / заблокировать |
| PATCH | `/admin/companies/{id}` | Изменить тариф |

---

## Роли пользователей

| Роль | Доступ |
|------|--------|
| `employee` | Свои документы и чат |
| `manager` | То же самое |
| `admin` | Управление в рамках своей компании |
| `superadmin` | Полный доступ + `/admin` панель |

Первый зарегистрировавшийся в компании получает роль `admin`.

---

## Переменные окружения

Файл `backend/.env`:

```env
DATABASE_URL=postgresql://traceai:traceai_pass@localhost:5432/traceai_db
SECRET_KEY=your-secret-key-change-in-production
GIGACHAT_CLIENT_SECRET=your-gigachat-key
```

Без `GIGACHAT_CLIENT_SECRET` AI работает в тестовом режиме (возвращает заглушку).

---

## Деплой на сервере (85.193.85.81)

```bash
# Обновить код
cd /var/www/traceai
git fetch origin && git reset --hard origin/main

# Перезапустить бэкенд
fuser -k 8000/tcp
cd backend && nohup ./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > /var/log/backend.log 2>&1 &

# Пересобрать и перезапустить фронтенд
cd ../frontend
npm install --legacy-peer-deps
npm run build
pkill -f 'next-server'
nohup npm start > /var/log/nextjs.log 2>&1 &
```

---

## Локальная разработка

```bash
# Бэкенд
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload     # http://localhost:8000

# Фронтенд
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

> Для локальной разработки замените `http://85.193.85.81:8000` на `http://localhost:8000` в файлах фронтенда, или вынесите в переменную окружения `NEXT_PUBLIC_API_URL`.

---

## База данных

```
companies (id, name, plan, created_at)
    │
    ├── users (id, email, password_hash, name, role, company_id, is_active, created_at)
    │
    └── documents (id, title, content, status, company_id, created_by, created_at, updated_at)
            │
            └── audit_logs (id, event_type, user_id, document_id, details, model_used, tokens_used, created_at)

chat_messages (id, user_id, prompt, response, model_used, tokens_used, created_at)
```

---

## Структура проекта

```
traceai/
├── backend/
│   ├── main.py            # FastAPI app, CORS, роутеры
│   ├── database.py        # SQLAlchemy engine + get_db
│   ├── models.py          # ORM-модели
│   ├── auth.py            # JWT, хэширование, get_current_user
│   ├── llm_gateway.py     # GigaChat / тестовый режим
│   └── routes/
│       ├── chat.py
│       ├── documents.py
│       ├── audit.py
│       └── admin.py
├── frontend/
│   └── app/
│       ├── login/         # Страница входа
│       ├── dashboard/     # Главная с реальными KPI
│       ├── editor/        # Редактор документов
│       ├── chat/          # AI-чат
│       ├── analytics/     # Аналитика
│       ├── audit/         # Audit Trail
│       └── admin/         # Суперадминка
└── README.md
```

---

## Контакты

- basedtech.ru
- t.me/basedtechnology
- GitHub: `git@github.com:nickdanilin2000-a11y/TraceAi.git`
