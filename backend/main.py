from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

supabase = create_client(
    os.getenv("https://oitjraqsuqvkktgeehby.supabase.co"),
    os.getenv("sb_publishable_hiAnHv-ChjkNCvCvNcUUTg_Z9mITscS")
)

class Event(BaseModel):
    title: str
    description: str
    category: str
    event_date: str
    start_time: str
    end_time: str
    capacity: int

app = FastAPI()

# Allow requests from all development origins (localhost, 127.0.0.1, and local IP)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.10.1.128:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Or set allow_origins=["*"] during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Smart College Event Planner API is running"}

@app.get("/events")
def get_events():
    response = supabase.table("events").select("*").execute()
    return response.data

@app.post("/events")
def create_event(event: Event):
    response = supabase.table("events").insert({
        "title": event.title,
        "description": event.description,
        "category": event.category,
        "event_date": event.event_date,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "capacity": event.capacity
    }).execute()
    return response.data