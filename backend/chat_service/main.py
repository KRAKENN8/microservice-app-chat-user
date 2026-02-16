import json
import redis
import socketio
from fastapi import FastAPI
import uvicorn

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

app = FastAPI()
socket_app = socketio.ASGIApp(sio, app)

r = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)

userNicknames = {}

def get_online_users():
    userSocketIds = r.smembers("online_users")
    online_usernames = []
    
    for id in userSocketIds:
        if id in userNicknames:
            nickname = userNicknames[id] 
            online_usernames.append(nickname)

    return online_usernames

@sio.event
async def connect(sid, environ):
    print("Connected:", sid)

@sio.event
async def set_username(sid, username):
    userNicknames[sid] = username
    r.sadd("online_users", sid)

    history = r.lrange("chat_history", 0, 20)
    parsed = [json.loads(x) for x in history]

    await sio.emit("history", parsed, to=sid)
    await sio.emit("online_users", get_online_users())

@sio.event
async def chat_message(sid, msg):
    user = userNicknames.get(sid)

    message = {"user": user, "text": msg}
    message_json = json.dumps(message)

    r.lpush("chat_history", message_json)
    r.ltrim("chat_history", 0, 20)

    await sio.emit("chat_message", message)

@sio.event
async def disconnect(sid):
    print("Disconnected:", sid)
    r.srem("online_users", sid)
    userNicknames.pop(sid, None)
    await sio.emit("online_users", get_online_users())

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8002)