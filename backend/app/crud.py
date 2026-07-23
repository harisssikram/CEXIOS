from sqlalchemy.orm import Session

from . import models, schemas


def get_project_by_ticker(db: Session, ticker: str):
    return db.query(models.Project).filter(models.Project.ticker == ticker).first()


def find_duplicate(db: Session, ticker: str, website: str):
    """Ticker is the primary key, website is the secondary key."""
    return (
        db.query(models.Project)
        .filter(
            (models.Project.ticker == ticker) | (models.Project.website == website)
        )
        .first()
    )


def create_project(db: Session, project: schemas.ProjectCreate) -> models.Project:
    db_proj = models.Project(**project.model_dump())
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj


def list_projects(db: Session, skip: int = 0, limit: int = 500):
    return (
        db.query(models.Project)
        .order_by(models.Project.date_added.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def search_projects(db: Session, q: str, limit: int = 50):
    like = f"%{q}%"
    return (
        db.query(models.Project)
        .filter(
            models.Project.ticker.ilike(like) | models.Project.name.ilike(like)
        )
        .limit(limit)
        .all()
    )


def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()


def update_project(db: Session, project_id: int, updates: schemas.ProjectUpdate):
    db_proj = get_project(db, project_id)
    if not db_proj:
        return None
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_proj, field, value)
    db.commit()
    db.refresh(db_proj)
    return db_proj


def delete_project(db: Session, project_id: int) -> bool:
    db_proj = get_project(db, project_id)
    if not db_proj:
        return False
    db.delete(db_proj)
    db.commit()
    return True


def record_upload(
    db: Session, uploaded_by: str, file_name: str, added: int, duplicates: int, invalid: int
) -> models.Upload:
    upload = models.Upload(
        uploaded_by=uploaded_by,
        file_name=file_name,
        imported_count=added,
        duplicate_count=duplicates,
        invalid_count=invalid,
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload


def list_uploads(db: Session, skip: int = 0, limit: int = 200):
    return (
        db.query(models.Upload)
        .order_by(models.Upload.upload_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_projects(db: Session) -> int:
    return db.query(models.Project).count()


def count_uploads(db: Session) -> int:
    return db.query(models.Upload).count()
