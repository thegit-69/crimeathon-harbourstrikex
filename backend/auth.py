from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db.session import get_db


def hash_password(plain: str) -> str:
    pwd_bytes = plain.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        pwd_bytes = plain.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.jwt_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


async def get_current_actor(
    x_api_key: Optional[str] = Header(default=None),
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Dual auth: API Key (machine/attack path) OR JWT (human/frontend path).
    
    API Key path is intentionally unchecked for IP/expiry — this is the attack surface
    that mirrors key-tb-07 control gaps documented in Case CR-26-047 E04.
    """
    if x_api_key:
        # Lazy import to avoid circular
        from models.tallybridge import ApiKey
        from models.bluevault import StorageKey
        from sqlalchemy import select

        result = await db.execute(select(ApiKey).where(ApiKey.id == x_api_key))
        key = result.scalar_one_or_none()
        if key and key.status == "Active":
            # NOTE: intentionally NO IP restriction check, NO expiry check → attack surface
            return {"actor": x_api_key, "type": "api_key", "scope": key.scope}

        # Also support BlueVault storage keys (e.g. bvk-7f3a leaked in ticket TKT-48213 from Case Evidence E13)
        res_sk = await db.execute(select(StorageKey).where(StorageKey.id == x_api_key))
        sk = res_sk.scalar_one_or_none()
        if sk and sk.status == "Active":
            return {"actor": x_api_key, "type": "storage_key", "scope": sk.scope}

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or revoked API key")

    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        try:
            payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
            username: str = payload.get("sub")
            if not username:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
            return {"actor": username, "type": "user", "scope": "all"}
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid or expired")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Provide X-Api-Key header or Authorization: Bearer <token>",
        headers={"WWW-Authenticate": "Bearer"},
    )
