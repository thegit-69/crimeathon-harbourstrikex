from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # DB tables are created via schema.sql on Docker init; nothing to do here.
    yield


app = FastAPI(
    title="HarbourStrikeX API",
    description="Simulation backend for Harbor & Finch Freight — Case CR-26-047",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routers
from api import auth, dashboard, ledgerone, helpdeskr, bluevault, tallybridge  # noqa: E402

app.include_router(auth.router,        prefix="/auth",             tags=["Auth"])
app.include_router(dashboard.router,   prefix="/api/dashboard",    tags=["Dashboard"])
app.include_router(ledgerone.router,   prefix="/api/v2",           tags=["LedgerOne"])
app.include_router(helpdeskr.router,   prefix="/api/v1/support",   tags=["HelpDeskr"])
app.include_router(bluevault.router,   prefix="/api/storage",      tags=["BlueVault"])
app.include_router(tallybridge.router, prefix="/api/integration",  tags=["TallyBridge"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "HarbourStrikeX API", "case": "CR-26-047"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
