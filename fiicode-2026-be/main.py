from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database import engine
from exceptions.handlers import register_exception_handlers
from routers.auth import auth_router
import models.user as user_model

app = FastAPI()

origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "exp://192.168.x.x:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

register_exception_handlers(app)
user_model.Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    return {"message": "Hello World2"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
