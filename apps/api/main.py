"""
BARTHE API — FastAPI Python 3.13
Entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, dossiers, analyses
from app.routers import rapports

app = FastAPI(
    title="BARTHE API",
    description="Plateforme SaaS d'analyse de Business Plans — API FastAPI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(dossiers.router, prefix="/dossiers", tags=["Dossiers"])
app.include_router(analyses.router, prefix="/analyses", tags=["Analyses"])
app.include_router(rapports.router, prefix="/rapports", tags=["Rapports"])


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "BARTHE API", "version": "1.0.0"}
