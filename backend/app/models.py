from datetime import datetime

from sqlalchemy import Column, Integer, Text, TIMESTAMP

from .database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    ticker = Column(Text, nullable=False, unique=True, index=True)
    website = Column(Text, nullable=False, index=True)
    ceo = Column(Text, nullable=True)
    telegram = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    added_by = Column(Text, nullable=False)
    date_added = Column(TIMESTAMP, default=datetime.utcnow)


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    uploaded_by = Column(Text, nullable=False)
    file_name = Column(Text, nullable=False)
    upload_date = Column(TIMESTAMP, default=datetime.utcnow)
    imported_count = Column(Integer, nullable=False)
    duplicate_count = Column(Integer, nullable=False)
    invalid_count = Column(Integer, nullable=False, default=0)
