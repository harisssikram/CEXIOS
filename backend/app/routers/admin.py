from io import BytesIO
from typing import List

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..auth import create_access_token, get_current_admin
from ..config import settings
from ..database import get_db

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.post("/login", response_model=schemas.Token)
def admin_login(form_data: OAuth2PasswordRequestForm = Depends()):
    if (
        form_data.username != settings.ADMIN_USERNAME
        or form_data.password != settings.ADMIN_PASSWORD
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": form_data.username})

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    return {
        "total_projects": crud.count_projects(db),
        "total_uploads": crud.count_uploads(db),
        "recent_uploads": crud.list_uploads(db, limit=10),
    }


@router.get("/uploads", response_model=List[schemas.UploadRecord])
def upload_history(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    return crud.list_uploads(db)


@router.get("/projects", response_model=List[schemas.ProjectResponse])
def list_all_projects(
    skip: int = 0,
    limit: int = 100000,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Returns the full registry by default (no silent 500-row cap)."""
    return crud.list_projects(db, skip=skip, limit=limit)


@router.post("/projects", response_model=schemas.ProjectResponse)
def add_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    # Duplicates are matched by NAME or WEBSITE -- the same ticker is allowed to repeat.
    existing = crud.find_duplicate(db, name=project.name, website=project.website)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"A project with this name or website already exists: {crud.format_duplicate_detail(existing)}.",
        )
    project.ticker = project.ticker.upper()
    return crud.create_project(db, project)


@router.put("/projects/{project_id}", response_model=schemas.ProjectResponse)
def edit_project(
    project_id: int,
    updates: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    # If name/website are being changed, make sure they don't collide with another project.
    if updates.name or updates.website:
        existing = crud.find_duplicate(
            db, name=updates.name, website=updates.website, exclude_id=project_id
        )
        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"A project with this name or website already exists: {crud.format_duplicate_detail(existing)}.",
            )
    if updates.ticker:
        updates.ticker = updates.ticker.upper()

    updated = crud.update_project(db, project_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated


@router.delete("/projects/{project_id}", status_code=204)
def remove_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    if not crud.delete_project(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return None


@router.get("/projects/export")
def export_projects(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    projects = crud.list_projects(db, limit=100000)
    rows = [
        {
            "Project Name": p.name,
            "Ticker": p.ticker,
            "Website": p.website,
            "CEO": p.ceo,
            "Telegram": p.telegram,
            "Notes": p.notes,
            "Added By": p.added_by,
            "Date Added": p.date_added,
        }
        for p in projects
    ]
    df = pd.DataFrame(rows)
    buffer = BytesIO()
    df.to_excel(buffer, index=False, sheet_name="Projects")
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=projects_export.xlsx"},
    )
