from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import User, Company, Document, AuditLog
from auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Суперадмин"])


def require_superadmin(current_user: User = Depends(get_current_user)):
    if current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Требуются права суперадмина")
    return current_user


@router.get("/stats")
def get_platform_stats(
    _: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
):
    return {
        "companies": db.query(func.count(Company.id)).scalar() or 0,
        "users": db.query(func.count(User.id)).scalar() or 0,
        "documents": db.query(func.count(Document.id)).scalar() or 0,
        "ai_requests": db.query(func.count(AuditLog.id)).scalar() or 0,
        "total_tokens": db.query(func.sum(AuditLog.tokens_used)).scalar() or 0,
    }


@router.get("/companies")
def get_companies(
    _: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
):
    companies = db.query(Company).order_by(Company.created_at.desc()).all()
    result = []
    for c in companies:
        users_count = db.query(func.count(User.id)).filter(User.company_id == c.id).scalar() or 0
        docs_count = db.query(func.count(Document.id)).filter(Document.company_id == c.id).scalar() or 0
        tokens = (
            db.query(func.sum(AuditLog.tokens_used))
            .join(User, AuditLog.user_id == User.id)
            .filter(User.company_id == c.id)
            .scalar() or 0
        )
        result.append({
            "id": c.id,
            "name": c.name,
            "plan": c.plan,
            "created_at": c.created_at,
            "users_count": users_count,
            "docs_count": docs_count,
            "tokens_used": tokens,
        })
    return result


@router.get("/users")
def get_users(
    _: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "company_id": u.company_id,
            "company_name": u.company.name if u.company else "—",
            "created_at": u.created_at,
        }
        for u in users
    ]


class UserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None


class CompanyUpdate(BaseModel):
    plan: Optional[str] = None


@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    data: UserUpdate,
    _: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    db.commit()
    return {"ok": True}


@router.patch("/companies/{company_id}")
def update_company(
    company_id: int,
    data: CompanyUpdate,
    _: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Компания не найдена")
    if data.plan is not None:
        company.plan = data.plan
    db.commit()
    return {"ok": True}
