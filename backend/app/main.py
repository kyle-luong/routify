from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.api import routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
<<<<<<< Updated upstream
    allow_origins=["http://localhost:5173", "chrome-extension://*", "http://www.routify.tech/"],
=======
    allow_origins=["http://localhost:5173", "chrome-extension://*", "http://www.routify.tech.s3-website-us-east-1.amazonaws.com/", "http://www.routify.tech/", "*"],
>>>>>>> Stashed changes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api")
init_db()
