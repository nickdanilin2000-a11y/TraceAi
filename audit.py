# Роут для Audit Trail
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import User, AuditLog
from auth import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("/")
def get_audit_log(
    event_type: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Получить историю всех AI-событий компании"""
    
    query = db.query(AuditLog)\
        .join(User, AuditLog.user_id == User.id)\
        .filter(User.company_id == current_user.company_id)
    
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "event_type": log.event_type,
            "user_id": log.user_id,
            "document_id": log.document_id,
            "details": log.details,
            "model_used": log.model_used,
            "tokens_used": log.tokens_used,
            "created_at": log.created_at,
        }
        for log in logs
    ]

@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Статистика использования AI"""
    
    from sqlalchemy import func
    
    # Считаем по типам событий
    stats = db.query(
        AuditLog.event_type,
        func.count(AuditLog.id).label("count"),
        func.sum(AuditLog.tokens_used).label("tokens"),
    ).join(User, AuditLog.user_id == User.id)\
     .filter(User.company_id == current_user.company_id)\
     .group_by(AuditLog.event_type)\
     .all()
    
    total_tokens = db.query(func.sum(AuditLog.tokens_used))\
        .join(User, AuditLog.user_id == User.id)\
        .filter(User.company_id == current_user.company_id)\
        .scalar() or 0
    
    total_requests = db.query(func.count(AuditLog.id))\
        .join(User, AuditLog.user_id == User.id)\
        .filter(User.company_id == current_user.company_id)\
        .scalar() or 0
    
    return {
        "total_requests": total_requests,
        "total_tokens": total_tokens,
        "by_event_type": [
            {
                "event_type": s.event_type,
                "count": s.count,
                "tokens": s.tokens or 0,
            }
            for s in stats
        ],
    }