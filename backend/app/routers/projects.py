from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import crud, schemas, utils
from ..database import get_db

router = APIRouter(prefix="/api/v1", tags=["projects"])


@router.get("/search", response_model=List[schemas.ProjectResponse])
def search_projects(q: str, db: Session = Depends(get_db)):
    """Public search by ticker or project name. No login required."""
    if not q or not q.strip():
        return []
    return crud.search_projects(db, q.strip())


@router.get("/recent", response_model=List[schemas.ProjectResponse])
def recent_projects(db: Session = Depends(get_db)):
    """Public feed of the most recently added projects (for the ticker tape)."""
    return crud.list_projects(db, limit=20)


@router.post("/upload", response_model=schemas.UploadResponse)
async def upload_excel(
    name: str = Form(..., min_length=1),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Public upload endpoint. Requires the uploader's name and an Excel/CSV file."""
    if not file.filename.lower().endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(status_code=400, detail="Only .xlsx, .xls, or .csv files are supported.")

    contents = await file.read()
    added, duplicates, invalid, added_rows, duplicate_rows, invalid_rows = utils.parse_and_import(
        contents, file.filename, name.strip(), db
    )
    crud.record_upload(db, name.strip(), file.filename, added, duplicates, invalid)

    return {
        "added": added,
        "duplicates": duplicates,
        "invalid": invalid,
        "added_rows": added_rows,
        "duplicate_rows": duplicate_rows,
        "invalid_rows": invalid_rows,
    }


@router.post("/instant-add", response_model=schemas.UploadResponse)
def instant_add(payload: schemas.ManualBulkAddRequest, db: Session = Depends(get_db)):
    """
    Public 'Instant Add' endpoint: up to utils.MAX_MANUAL_ROWS projects typed directly
    into the small in-app sheet, instead of via an Excel/CSV file. Runs through the
    exact same validation/duplicate rules as /upload and returns the same shape.
    """
    if not payload.uploader or not payload.uploader.strip():
        raise HTTPException(status_code=400, detail="Your name is required.")

    rows = [r.model_dump() for r in payload.rows]
    added, duplicates, invalid, added_rows, duplicate_rows, invalid_rows = utils.process_manual_rows(
        rows, payload.uploader.strip(), db
    )
    crud.record_upload(db, payload.uploader.strip(), "Instant Add", added, duplicates, invalid)

    return {
        "added": added,
        "duplicates": duplicates,
        "invalid": invalid,
        "added_rows": added_rows,
        "duplicate_rows": duplicate_rows,
        "invalid_rows": invalid_rows,
    }
