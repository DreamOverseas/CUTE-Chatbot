import os
from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
from openai import OpenAI
import uvicorn

# Initialise FAST API App
app = FastAPI()
PORT_NUM = 8000

# Load env from root directory (parent folder of Backend/)
project_root = Path(__file__).resolve().parent.parent
dotenv_path = project_root / '.env'
load_dotenv(dotenv_path=dotenv_path)
# ========================================================
openAI_key = os.getenv('VITE_OPENAI_API_KEY')
openAI_URL = os.getenv('VITE_OPENAI_API_URL')
openAI_model = os.getenv('VITE_OPENAI_MODEL')
# deepseek_key = os.getenv('VITE_DEEPSEEK_API_KEY')
# deepseek_URL = os.getenv('VITE_DEEPSEEK_API_URL')
# deepseek_model = os.getenv('VITE_DEEPSEEK_MODEL')

# Initialise Chroma db with persist setup
collection_name = "do_chatbot"
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(collection_name)

# OpenAI Client
openai_client = OpenAI(api_key=openAI_key)


# Data structure
class Document(BaseModel):
    id: str
    content: str


# Get text Embedding from OpenAI
def get_embedding(text):
    res = openai_client.embeddings.create(
        input=text,
        model='text-embedding-3-small'
    )
    return res.data[0].embedding


# Adding new one or update with name given
@app.post("/doc/upsert")
def upsert_document(doc: Document):
    embedding = get_embedding(doc.content)
    collection.upsert(
        embeddings=[embedding],
        documents=[doc.content],
        ids=[doc.id]
    )
    return {"status": "success", "action": "upsert", "id": doc.id}


# Delete one doc
@app.delete("/doc/{doc_id}")
def delete_document(doc_id: str):
    existing = collection.get(ids=[doc_id])
    if not existing["ids"]:
        raise HTTPException(status_code=404, detail="Document not found")

    collection.delete(ids=[doc_id])
    return {"status": "success", "action": "delete", "id": doc_id}


# Get the doc content (Shall not be use in production)
@app.get("/doc/{doc_id}")
def get_document(doc_id: str):
    result = collection.get(ids=[doc_id])
    if not result["ids"]:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "id": result["ids"][0],
        "content": result["documents"][0]
    }


# Start server | ``` To run, type < python .\main.py > in the commands ```
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT_NUM, reload=True)
