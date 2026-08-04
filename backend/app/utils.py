from io import BytesIO

import pandas as pd
from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import crud, schemas

REQUIRED_COLUMNS = ["Project Name", "Ticker", "Website"]
OPTIONAL_COLUMNS = {"CEO": "ceo", "Telegram": "telegram", "Notes": "notes"}


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


def parse_and_import(file_bytes: bytes, filename: str, uploader: str, db: Session):
    """
    Returns (added, duplicates, invalid, duplicate_rows, invalid_rows).
    duplicate_rows / invalid_rows are lists of dicts describing exactly which
    spreadsheet rows were rejected and why, so the caller can surface real errors
    instead of a bare count.

    A row is a duplicate if its PROJECT NAME or WEBSITE matches an existing project
    (in the database, or already seen earlier in this same file). Ticker is NOT used
    for duplicate detection -- the same ticker can be reused across projects.
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
    duplicate_rows = []
    invalid_rows = []

    # Track names/websites already committed within this same file, so duplicate
    # rows *inside one upload* are caught too, not just ones already in the DB.
    seen_names = set()
    seen_websites = set()

    for idx, row in df.iterrows():
        excel_row_num = idx + 2  # +1 for 0-index, +1 for the header row

        try:
            name = str(row["Project Name"]).strip()
            ticker = str(row["Ticker"]).strip().upper()
            website_raw = str(row["Website"]).strip()
        except Exception:
            invalid += 1
            invalid_rows.append({"row": excel_row_num, "reason": "Could not read this row."})
            continue

        if not ticker or ticker.lower() == "nan" or not name or name.lower() == "nan":
            invalid += 1
            invalid_rows.append({
                "row": excel_row_num,
                "name": name,
                "ticker": ticker,
                "reason": "Missing Project Name or Ticker.",
            })
            continue

        name_norm = name.lower()
        website_norm = normalize_website(website_raw)

        # Duplicate within this same file
        if name_norm in seen_names or (website_norm and website_norm in seen_websites):
            duplicates += 1
            duplicate_rows.append({
                "row": excel_row_num,
                "name": name,
                "ticker": ticker,
                "reason": "Duplicate row within this file (same name or website).",
            })
            continue

        # Duplicate already in the database
        existing = crud.find_duplicate(db, name=name, website=website_raw)
        if existing:
            duplicates += 1
            duplicate_rows.append({
                "row": excel_row_num,
                "name": name,
                "ticker": ticker,
                "reason": f"Already exists in the database as {crud.format_duplicate_detail(existing)}.",
            })
            seen_names.add(name_norm)
            if website_norm:
                seen_websites.add(website_norm)
            continue

        optional_fields = {}
        for col, field in OPTIONAL_COLUMNS.items():
            if col in df.columns:
                val = row[col]
                optional_fields[field] = None if pd.isna(val) else str(val).strip()

        new_project = schemas.ProjectCreate(
            name=name,
            ticker=ticker,
            website=website_raw,
            added_by=uploader,
            **optional_fields,
        )
        crud.create_project(db, new_project)
        added += 1
        seen_names.add(name_norm)
        if website_norm:
            seen_websites.add(website_norm)

    return added, duplicates, invalid, duplicate_rows, invalid_rows
