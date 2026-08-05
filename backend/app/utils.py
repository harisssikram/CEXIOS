from io import BytesIO

import pandas as pd
from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import crud, schemas

REQUIRED_COLUMNS = ["Project Name", "Ticker", "Website"]
OPTIONAL_COLUMNS = {"CEO": "ceo", "Telegram": "telegram", "Notes": "notes"}

MAX_MANUAL_ROWS = 20


def normalize_website(url: str) -> str:
    """Normalize a URL so http/https and www differences don't create false-negative duplicates."""
    if not url:
        return ""
    url = url.strip().lower()
    for prefix in ("https://", "http://"):
        if url.startswith(prefix):
            url = url[len(prefix):]
    if url.startswith("www."):
        url = url[4:]
    return url.rstrip("/")


def read_dataframe(file_bytes: bytes, filename: str) -> pd.DataFrame:
    lower_name = filename.lower()
    try:
        if lower_name.endswith(".csv"):
            return pd.read_csv(BytesIO(file_bytes))
        return pd.read_excel(BytesIO(file_bytes))
    except Exception:
        # Fall back to trying the other format in case the extension is misleading
        try:
            return pd.read_csv(BytesIO(file_bytes))
        except Exception:
            raise HTTPException(status_code=400, detail="Could not parse file. Please upload a valid .xlsx, .xls, or .csv file.")


def _import_row(row_num, name, ticker, website_raw, optional_fields, uploader, db, seen_names, seen_websites):
    """
    Shared core used by both the Excel/CSV upload and the manual Instant Add flow, so
    the two entry points can never drift out of sync on validation or duplicate rules.

    Returns a tuple (bucket, entry) where bucket is one of "invalid", "duplicate", "added".

    A row is a duplicate if its PROJECT NAME or WEBSITE matches an existing project
    (in the database, or already seen earlier in this same batch). Ticker is NOT used
    for duplicate detection -- the same ticker can be reused across projects.
    """
    name = (name or "").strip()
    ticker = (ticker or "").strip().upper()
    website_raw = (website_raw or "").strip()

    if not ticker or ticker.lower() == "nan" or not name or name.lower() == "nan":
        return "invalid", {
            "row": row_num,
            "name": name,
            "ticker": ticker,
            "reason": "Missing Project Name or Ticker.",
        }

    name_norm = name.lower()
    website_norm = normalize_website(website_raw)

    # Duplicate within this same batch
    if name_norm in seen_names or (website_norm and website_norm in seen_websites):
        return "duplicate", {
            "row": row_num,
            "name": name,
            "ticker": ticker,
            "reason": "Duplicate row within this batch (same name or website).",
        }

    # Duplicate already in the database
    existing = crud.find_duplicate(db, name=name, website=website_raw)
    if existing:
        seen_names.add(name_norm)
        if website_norm:
            seen_websites.add(website_norm)
        return "duplicate", {
            "row": row_num,
            "name": name,
            "ticker": ticker,
            "reason": f"Already exists in the database as {crud.format_duplicate_detail(existing)}.",
        }

    new_project = schemas.ProjectCreate(
        name=name,
        ticker=ticker,
        website=website_raw,
        added_by=uploader,
        **optional_fields,
    )
    crud.create_project(db, new_project)
    seen_names.add(name_norm)
    if website_norm:
        seen_websites.add(website_norm)
    return "added", {
        "row": row_num,
        "name": name,
        "ticker": ticker,
        "website": website_raw,
    }


def _tally(bucket, entry, added, duplicates, invalid, added_rows, duplicate_rows, invalid_rows):
    if bucket == "added":
        added += 1
        added_rows.append(entry)
    elif bucket == "duplicate":
        duplicates += 1
        duplicate_rows.append(entry)
    else:
        invalid += 1
        invalid_rows.append(entry)
    return added, duplicates, invalid


def parse_and_import(file_bytes: bytes, filename: str, uploader: str, db: Session):
    """
    Returns (added, duplicates, invalid, added_rows, duplicate_rows, invalid_rows).
    added_rows / duplicate_rows / invalid_rows are lists of dicts describing exactly
    which spreadsheet rows landed where, so the caller can surface real detail
    instead of a bare count. Nothing extra is persisted -- added_rows just mirrors
    projects that were already written to the DB via crud.create_project above.
    """
    df = read_dataframe(file_bytes, filename)

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required column(s): {', '.join(missing)}. "
                   f"Required columns are: {', '.join(REQUIRED_COLUMNS)}.",
        )

    added, duplicates, invalid = 0, 0, 0
    added_rows, duplicate_rows, invalid_rows = [], [], []

    # Track names/websites already committed within this same file, so duplicate
    # rows *inside one upload* are caught too, not just ones already in the DB.
    seen_names = set()
    seen_websites = set()

    for idx, row in df.iterrows():
        excel_row_num = idx + 2  # +1 for 0-index, +1 for the header row

        try:
            name = str(row["Project Name"]).strip()
            ticker = str(row["Ticker"]).strip()
            website_raw = str(row["Website"]).strip()
        except Exception:
            invalid += 1
            invalid_rows.append({"row": excel_row_num, "reason": "Could not read this row."})
            continue

        optional_fields = {}
        for col, field in OPTIONAL_COLUMNS.items():
            if col in df.columns:
                val = row[col]
                optional_fields[field] = None if pd.isna(val) else str(val).strip()

        bucket, entry = _import_row(
            excel_row_num, name, ticker, website_raw, optional_fields, uploader, db, seen_names, seen_websites
        )
        added, duplicates, invalid = _tally(
            bucket, entry, added, duplicates, invalid, added_rows, duplicate_rows, invalid_rows
        )

    return added, duplicates, invalid, added_rows, duplicate_rows, invalid_rows


def process_manual_rows(rows: list, uploader: str, db: Session):
    """
    Powers the "Instant Add" feature: up to MAX_MANUAL_ROWS projects typed directly
    into a small in-app sheet, validated and deduplicated with the exact same rules
    as the Excel/CSV upload (see _import_row), and returned in the same shape so the
    frontend can reuse one results component for both flows.

    `rows` is a list of dicts with keys: name, ticker, website, and optionally
    ceo, telegram, notes.

    Returns (added, duplicates, invalid, added_rows, duplicate_rows, invalid_rows).
    """
    if not rows:
        raise HTTPException(status_code=400, detail="No rows submitted.")
    if len(rows) > MAX_MANUAL_ROWS:
        raise HTTPException(status_code=400, detail=f"You can add at most {MAX_MANUAL_ROWS} projects at once.")

    added, duplicates, invalid = 0, 0, 0
    added_rows, duplicate_rows, invalid_rows = [], [], []
    seen_names = set()
    seen_websites = set()

    for i, row in enumerate(rows):
        row_num = i + 1
        optional_fields = {
            field: (row.get(key) or "").strip() or None
            for key, field in (("ceo", "ceo"), ("telegram", "telegram"), ("notes", "notes"))
        }
        bucket, entry = _import_row(
            row_num,
            row.get("name", ""),
            row.get("ticker", ""),
            row.get("website", ""),
            optional_fields,
            uploader,
            db,
            seen_names,
            seen_websites,
        )
        added, duplicates, invalid = _tally(
            bucket, entry, added, duplicates, invalid, added_rows, duplicate_rows, invalid_rows
        )

    return added, duplicates, invalid, added_rows, duplicate_rows, invalid_rows
