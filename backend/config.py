from typing import Union
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://hsuser:hspassword@localhost:5433/harbourstrikex"
    cors_origins: Union[list[str], str] = ["http://localhost:5173", "http://localhost:4173"]
    jwt_secret_key: str = "harbourstrikex-dev-secret-change-in-prod"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                return json.loads(v)
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
