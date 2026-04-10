# Роут для AI-чата
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import User, ChatMessage, AuditLog
from auth import get_current_user
from llm_gateway import ask_llm

router = APIRouter(prefix="/chat", tags=["AI-чат"])

class ChatRequest(BaseModel):
    prompt: str
    model: str = "gigachat"
    system: Optional[str] = None

class ChatResponse(BaseModel):
    text: str
    tokens: int
    model: str
    message_id: int

@router.post("/", response_model=ChatResponse)
async def send_message(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Отправить сообщение в AI-чат"""
    
    # Отправляем запрос к LLM
    result = await ask_llm(
        prompt=data.prompt,
        model=data.model,
        system=data.system,
        user_id=current_user.id,
        db=db,
    )
    
    # Сохраняем сообщение в историю
    message = ChatMessage(
        user_id=current_user.id,
        prompt=data.prompt,
        response=result["text"],
        model_used=result["model"],
        tokens_used=result["tokens"],
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return {
        "text": result["text"],
        "tokens": result["tokens"],
        "model": result["model"],
        "message_id": message.id,
    }

@router.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """История чата пользователя"""
    messages = db.query(ChatMessage)\
        .filter(ChatMessage.user_id == current_user.id)\
        .order_by(ChatMessage.created_at.desc())\
        .limit(50)\
        .all()
    
    return [
        {
            "id": m.id,
            "prompt": m.prompt,
            "response": m.response,
            "model": m.model_used,
            "tokens": m.tokens_used,
            "created_at": m.created_at,
        }
        for m in messages
    ]