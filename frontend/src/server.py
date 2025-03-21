import os
import json
import re
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware


# Initialize OpenAI client
client = OpenAI(
    api_key="REMOVED_OPENAI_API_KEY"
)

# ✅ Add this before defining endpoints
origins = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3002",
]

# Initialize FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Temporarily allow ALL origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------
# FastAPI Models
# ------------------------------
class TopicRequest(BaseModel):
    topic: str


class LessonRequest(BaseModel):
    topic: str
    lesson_name: str
    toc: List[str]


# ------------------------------
# Utility Functions
# ------------------------------


def clean_json_response(response_text):
    """Extracts JSON from response text and ensures valid parsing."""
    match = re.search(r"```json(.*?)```", response_text, re.DOTALL)
    if match:
        response_text = match.group(1).strip()

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        pass

    response_text = re.sub(r"(?<!\\)'", '"', response_text)
    response_text = re.sub(r",\s*}", "}", response_text)
    response_text = re.sub(r",\s*]", "]", response_text)

    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        print("❌ JSON Parse Failed Again:", e)
        return None


def load_previous_lessons(topic):
    """Loads all previous lessons for the topic to use as context."""
    folder = topic.replace(" ", "_")
    texts = []
    if os.path.exists(folder):
        for filename in sorted(os.listdir(folder)):
            if filename.endswith(".json"):
                filepath = os.path.join(folder, filename)
                with open(filepath, "r") as f:
                    lesson_json = json.load(f)
                    if "lesson" in lesson_json:
                        title = lesson_json["lesson"]["title"]
                        overview = lesson_json["lesson"]["overview"]
                        content = lesson_json["lesson"]["content"]
                        takeaways = lesson_json["lesson"]["takeaways"]
                        texts.append(f"{title}\n{overview}\n{content}\n{takeaways}")
    return "\n".join(texts) if texts else ""


def save_lesson(topic, lesson_name, lesson_data):
    """Saves the lesson as a JSON file in a topic-named folder."""
    folder = topic.replace(" ", "_")
    if not os.path.exists(folder):
        os.makedirs(folder)
    filename = lesson_name.replace(" ", "_") + ".json"
    filepath = os.path.join(folder, filename)
    with open(filepath, "w") as f:
        json.dump(lesson_data, f, indent=2)
    print(f"✅ Lesson saved to {filepath}")


# ------------------------------
# FastAPI Endpoints
# ------------------------------


@app.post("/get_toc")
async def get_lesson_plan(request: TopicRequest):
    """Generates a Table of Contents for the given topic."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an AI tutor that creates structured lesson plans for educational topics. Ensure clarity, organization, and relevance.",
            },
            {
                "role": "user",
                "content": f"Create a structured lesson plan for teaching {request.topic}. Provide ONLY a table of contents with lesson titles, numbered sequentially. Do NOT include subtopics, assessments, activities, group projects, discussions, or summaries. Format the response as follows:\n\n## Table of Contents\n\n1. Lesson Name 1\n2. Lesson Name 2\n3. Lesson Name 3\n...",
            },
        ],
    )
    response_text = response.choices[0].message.content
    lesson_titles = re.findall(r"\d+\.\s(.+)", response_text)
    return {"table_of_contents": lesson_titles}


@app.post("/get_previous_lessons")
async def get_previous_lessons(request: TopicRequest):
    """Retrieves all previously saved lessons for the topic."""
    prev_context = load_previous_lessons(request.topic)
    return {"previous_lessons": prev_context}


@app.post("/generate_lesson")
async def generate_lesson(request: LessonRequest):
    """Generates a lesson based on the topic, lesson name, and previous context."""
    table_of_contents = "\n".join(request.toc)
    previous_context = load_previous_lessons(request.topic)

    max_retries = 5
    delay_seconds = 2
    attempt = 0
    lesson_data = None

    while attempt < max_retries:
        attempt += 1
        print(f"🔁 Attempt {attempt} to get valid lesson JSON...")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": 'You are an AI tutor that creates structured and interactive learning lessons. Ensure lessons are engaging, well-organized, and contain quizzes. For every lesson you generate, you follow the following JSON format: \{"lesson": \{title: "", overview:"", previous_summary:"", content: \{ you are free to take liberties here\}, quizzes: {question, options, answer}, flashcards: {term, definition} \}, graphs: {title, code}, takeaways: [] \}. You dont need to have all interactive elements in one lesson but you may have them as you see fit and relevant.',
                },
                {
                    "role": "user",
                    "content": f"Generate a detailed lesson on '{request.lesson_name}'. This is part of a structured course. Here is the course's Table of Contents:\n\n{table_of_contents}\n\nIf possible, provide a brief summary of the previous lessons to maintain continuity: {previous_context}\n\nFormat the lesson as JSON. Include lesson content, quizzes, flashcards, graphs (code in Svelte using Layer Cake), and key takeaways.",
                },
            ],
            response_format={"type": "json_object"}
        )

        lesson_json_str = response.choices[0].message.content
        lesson_data = clean_json_response(lesson_json_str)

        if lesson_data:
            print("✅ Successfully parsed lesson JSON.")
            break
        else:
            print(f"❌ Attempt {attempt} failed to parse JSON.")
            time.sleep(delay_seconds)

    if lesson_data is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to parse lesson JSON after multiple retries.",
        )

    save_lesson(request.topic, request.lesson_name, lesson_data)
    return {"lesson": lesson_data}


# ------------------------------
# Run FastAPI Server
# ------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app)
