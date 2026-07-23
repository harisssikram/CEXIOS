from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .config import settings
from .database import Base, engine
from .routers import admin, projects

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crypto Project Registry", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "message": "Crypto Project Registry API",
        "docs": "/docs",
        "health": "/health"
    }