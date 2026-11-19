from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import create_access_token, verify_password, get_current_actor
from db.session import get_db
from models.user import User
from schemas.auth import LoginRequest, TokenResponse, UserOut

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    if user.status == "terminated":
        # Orphaned account — still allows login (the control gap from the case!)
        pass
    token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=timedelta(minutes=60),
    )
    return TokenResponse(access_token=token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(actor: dict = Depends(get_current_actor)):
    if actor["type"] != "user":
        raise HTTPException(400, "Only JWT tokens can be refreshed")
    token = create_access_token(data={"sub": actor["actor"]})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserOut)
async def me(actor: dict = Depends(get_current_actor), db: AsyncSession = Depends(get_db)):
    if actor["type"] == "user":
        result = await db.execute(select(User).where(User.username == actor["actor"]))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(404, "User not found")
        return user
    # API key actor — return synthetic user
    return UserOut(
        username=actor["actor"],
        full_name=f"Service account: {actor['actor']}",
        role="service",
        status="active",
    )
