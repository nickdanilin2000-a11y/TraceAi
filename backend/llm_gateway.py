import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from models import AuditLog

load_dotenv(Path(__file__).parent / ".env")

GIGACHAT_AUTH_KEY = os.getenv("GIGACHAT_CLIENT_SECRET", "")


async def ask_llm(
    prompt: str,
    model: str = "gigachat",
    system: str = None,
    user_id: int = None,
    document_id: int = None,
    db: Session = None,
) -> dict:
    if GIGACHAT_AUTH_KEY:
        def _call_gigachat():
            from gigachat import GigaChat
            from gigachat.models import Chat, Messages, MessagesRole
            messages = []
            if system:
                messages.append(Messages(role=MessagesRole.SYSTEM, content=system))
            messages.append(Messages(role=MessagesRole.USER, content=prompt))
            with GigaChat(credentials=GIGACHAT_AUTH_KEY, verify_ssl_certs=False) as giga:
                response = giga.chat(Chat(messages=messages))
                return {
                    "text": response.choices[0].message.content,
                    "tokens": response.usage.total_tokens if response.usage else len(prompt),
                    "model": "GigaChat",
                }

        try:
            result = await asyncio.to_thread(_call_gigachat)
        except Exception as e:
            result = {
                "text": f"Ошибка GigaChat: {str(e)}",
                "tokens": 0,
                "model": "GigaChat-Error",
            }
    else:
        result = {
            "text": "[Тестовый режим] Добавьте GIGACHAT_CLIENT_SECRET в .env",
            "tokens": len(prompt),
            "model": "GigaChat-Test",
        }

    if db and user_id:
        log = AuditLog(
            event_type="ai_generation",
            user_id=user_id,
            document_id=document_id,
            details=f"Промпт: {prompt[:200]}",
            model_used=result["model"],
            tokens_used=result["tokens"],
        )
        db.add(log)
        db.commit()

    return result
