from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.voice import router as voice_router
from app.api.ws import router as ws_router
from app.config import settings

app = FastAPI(title="Omni Command Center API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(voice_router)
app.include_router(ws_router)
