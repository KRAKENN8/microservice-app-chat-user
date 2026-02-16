from fastapi import FastAPI
from pydantic import BaseModel
from db import Database
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException, status

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    
class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/register")
def register(data: UserCreate):
    user = Database.add_user(data.name, data.email, data.password)
    if not user:
        return {"detail": "Registration failed"}

    return user

@app.post("/login")
def login(payload: UserLogin):
    user = Database.get_user_by_email(payload.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )

    if not user.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )

    if not Database._verify_password(user["password_hash"], payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )

    user_out = {}

    for key, value in user.items():
        if key != "password_hash":
            user_out[key] = value

    return user_out

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001)