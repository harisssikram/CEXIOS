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


class UploadResponse(BaseModel):
    added: int
    duplicates: int
    invalid: int


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
