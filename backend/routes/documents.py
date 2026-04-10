# Роут для документов
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import User, Document, AuditLog
from auth import get_current_user
from llm_gateway import ask_llm

router = APIRouter(prefix="/documents", tags=["Документы"])

class DocumentCreate(BaseModel):
    title: str
    content: str = ""

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None

class AiAssistRequest(BaseModel):
    prompt: str
    model: str = "gigachat"

@router.get("/")
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Список всех документов компании"""
    docs = db.query(Document)\
        .filter(Document.company_id == current_user.company_id)\
        .order_by(Document.created_at.desc())\
        .all()
    
    return [
        {
            "id": d.id,
            "title": d.title,
            "status": d.status,
            "created_by": d.created_by,
            "created_at": d.created_at,
            "updated_at": d.updated_at,
        }
        for d in docs
    ]

@router.post("/")
def create_document(
    data: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Создать новый документ"""
    doc = Document(
        title=data.title,
        content=data.content,
        company_id=current_user.company_id,
        created_by=current_user.id,
    )
    db.add(doc)
    db.flush()

    log = AuditLog(
        event_type="document_created",
        user_id=current_user.id,
        document_id=doc.id,
        details=f"Создан документ: {data.title}",
    )
    db.add(log)
    db.commit()
    db.refresh(doc)
    
    return {"id": doc.id, "title": doc.title, "status": doc.status}

@router.get("/{doc_id}")
def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Получить документ по ID"""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.company_id == current_user.company_id,
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Документ не найден")
    
    return {
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "status": doc.status,
        "created_at": doc.created_at,
        "updated_at": doc.updated_at,
    }

@router.put("/{doc_id}")
def update_document(
    doc_id: int,
    data: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Обновить документ"""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.company_id == current_user.company_id,
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Документ не найден")
    
    old_status = doc.status
    
    if data.title: doc.title = data.title
    if data.content is not None: doc.content = data.content
    if data.status: doc.status = data.status

    event_type = "status_changed" if data.status and data.status != old_status else "document_edited"
    log = AuditLog(
        event_type=event_type,
        user_id=current_user.id,
        document_id=doc.id,
        details=f"Статус: {old_status} → {data.status}" if data.status else "Отредактирован",
    )
    db.add(log)
    db.commit()
    
    return {"id": doc.id, "title": doc.title, "status": doc.status}

@router.post("/{doc_id}/ai-assist")
async def ai_assist(
    doc_id: int,
    data: AiAssistRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI-ассистент для документа"""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.company_id == current_user.company_id,
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Документ не найден")
    
    result = await ask_llm(
        prompt=data.prompt,
        model=data.model,
        system="Ты помощник для редактирования корпоративных документов. Отвечай на русском языке.",
        user_id=current_user.id,
        document_id=doc_id,
        db=db,
    )
    
    return {"text": result["text"], "tokens": result["tokens"]}