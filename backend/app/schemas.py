from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProjectBase(BaseModel):
    name: str
    ticker: str
    website: str
    ceo: Optional[str] = None
    telegram: Optional[str] = None
    notes: Optional[str] = None


class ProjectCreate(ProjectBase):
    added_by: str


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    ticker: Optional[str] = None
    website: Optional[str] = None
    ceo: Optional[str] = None
    telegram: Optional[str] = None
    notes: Optional[str] = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    added_by: str
    date_added: datetime


class UploadRowIssue(BaseModel):
    row: int
    name: Optional[str] = None
    ticker: Optional[str] = None
    reason: str


class UploadRowAdded(BaseModel):
    row: int
    name: str
    ticker: str
    website: str


class UploadResponse(BaseModel):
    added: int
    duplicates: int
    invalid: int
    added_rows: list[UploadRowAdded] = []
    duplicate_rows: list[UploadRowIssue] = []
    invalid_rows: list[UploadRowIssue] = []


class PinVerifyRequest(BaseModel):
    pin: str


class PinToken(BaseModel):
    pin_token: str
    expires_in: int  # seconds


class ManualProjectRow(BaseModel):
    name: str = ""
    ticker: str = ""
    website: str = ""
    ceo: Optional[str] = None
    telegram: Optional[str] = None
    notes: Optional[str] = None


class ManualBulkAddRequest(BaseModel):
    uploader: str
    rows: list[ManualProjectRow]


class UploadRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uploaded_by: str
    file_name: str
    upload_date: datetime
    imported_count: int
    duplicate_count: int
    invalid_count: int


class Token(BaseModel):
    access_token: str
    token_type: str


class AdminLogin(BaseModel):
    username: str
    password: str


class DashboardStats(BaseModel):
    total_projects: int
    total_uploads: int
    recent_uploads: list[UploadRecord]
