from datetime import datetime, timedelta, timezone

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/admin/login")

PIN_EXPIRE_MINUTES = 2
PIN_SCOPE = "pin_unlock"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def get_current_admin(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username != settings.ADMIN_USERNAME:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception


def create_pin_token() -> str:
    """
    Issues a short-lived token that unlocks data-changing actions for PIN_EXPIRE_MINUTES.
    Deliberately separate from the admin login token -- this is a shared PIN, not a
    per-user credential, so anyone with the PIN can unlock changes for a couple of minutes.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=PIN_EXPIRE_MINUTES)
    payload = {"scope": PIN_SCOPE, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_pin_token(x_pin_token: str = Header(default=None, alias="X-Pin-Token")) -> None:
    """
    Dependency for any endpoint that changes data. Requires a valid, unexpired
    pin_token (obtained via POST /api/v1/verify-pin) in the X-Pin-Token header.
    """
    pin_exception = HTTPException(
        status_code=401,
        detail="A PIN is required for this action. Please enter your PIN to continue.",
    )
    if not x_pin_token:
        raise pin_exception
    try:
        payload = jwt.decode(x_pin_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("scope") != PIN_SCOPE:
            raise pin_exception
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Your PIN session has expired. Please enter your PIN again.",
        )
