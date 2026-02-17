from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017/")
db = client["test"]
collection = db["docs"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Document(BaseModel):
    title: str
    content: str

class UpdateDocument(BaseModel):
    title: Optional[str]
    content: Optional[str]

class Comment(BaseModel):
    user: str
    text: str

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@app.post("/documents")
def create_document(doc: Document):
    doc_dict = doc.dict()
    doc_dict["created_at"] = datetime.now()
    doc_dict["comments"] = []
    result = collection.insert_one(doc_dict)
    return {"id": str(result.inserted_id)}

@app.get("/documents")
def get_documents():
    return [serialize(d) for d in collection.find()]

@app.post("/documents/{doc_id}/comments")
def add_comment(doc_id: str, comment: Comment):
    collection.update_one(
        {"_id": ObjectId(doc_id)},
        {"$push": {"comments": comment.dict()}}
    )
    return {"status": "comment added"}

@app.put("/documents/{doc_id}")
def update_document(doc_id: str, update: UpdateDocument):
    update_dict = update.dict(exclude_unset=True)
    collection.update_one({"_id": ObjectId(doc_id)}, {"$set": update_dict})
    return {"status": "updated"}