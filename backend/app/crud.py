from sqlalchemy.orm import Session

from . import models, schemas


def _normalize_website(url: str) -> str:
    """Same normalization used on upload, kept local to avoid a circular import with utils."""
    if not url:
        return ""
    url = url.strip().lower()
    for prefix in ("https://", "http://"):
        if url.startswith(prefix):
            url = url[len(prefix):]
    if url.startswith("www."):
        url = url[4:]
    return url.rstrip("/")


def get_project_by_ticker(db: Session, ticker: str):
    return db.query(models.Project).filter(models.Project.ticker == ticker).first()


def format_duplicate_detail(existing) -> str:
    """Human-readable description of an existing project, including who added it and when."""
    when = existing.date_added.strftime("%b %d, %Y at %H:%M UTC") if existing.date_added else "an unknown date"
    who = existing.added_by or "someone"
    return f'"{existing.name}" ({existing.ticker}), added by {who} on {when}'


def find_duplicate(db: Session, name: str = None, website: str = None, exclude_id: int = None):
    """
    A project counts as a duplicate if its NAME or WEBSITE matches an existing row.
    Ticker is intentionally excluded -- the same ticker can legitimately be reused.
    Name comparison is case-insensitive; website comparison ignores http(s)/www/trailing slash.
    """
    query = db.query(models.Project)
    if exclude_id is not None:
        query = query.filter(models.Project.id != exclude_id)

    norm_name = name.strip().lower() if name else None
    norm_site = _normalize_website(website) if website else None

    for project in query.all():
        if norm_name and project.name.strip().lower() == norm_name:
            return project
        if norm_site and _normalize_website(project.website) == norm_site:
            return project
    return None


def create_project(db: Session, project: schemas.ProjectCreate) -> models.Project:
    db_proj = models.Project(**project.model_dump())
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj


def list_projects(db: Session, skip: int = 0, limit: int = 100000):
    return (
        db.query(models.Project)
        .order_by(models.Project.date_added.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def search_projects(db: Session, q: str, limit: int = 50):
    """
    EXACT match search (case-insensitive), on ticker OR project name.
    "btc" only matches a project whose ticker is exactly BTC, or whose
    name is exactly "btc" -- not projects that merely contain "btc".
    """
    q = q.strip()
    if not q:
        return []
    return (
        db.query(models.Project)
        .filter(
            (models.Project.ticker.ilike(q)) | (models.Project.name.ilike(q))
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
