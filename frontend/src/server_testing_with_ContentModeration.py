from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chat_models import ChatOpenAI
from langchain.schema import Document
from langchain.tools import Tool
import requests
from bs4 import BeautifulSoup
import asyncio
from typing import List
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
import requests
from xml.etree import ElementTree
import webbrowser
from langchain.agents import create_openai_tools_agent
from langchain.agents import AgentExecutor
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'RAG_for_server_testing')))
from RAG_for_server_testing import tools
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate, SystemMessagePromptTemplate
import openai
from dotenv import load_dotenv
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import re
import time
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from tts_converter import generate_tts_audio


# ------------------------------
load_dotenv()

# ------------------------------
# OpenAI Client
# ------------------------------
api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)


# ------------------------------
# TTS Configuration
# ------------------------------
# def flatten_full_curriculum(lesson_obj: dict) -> str:
#     """Handles all lesson structures: wrapped, unwrapped, dict or list-based sections."""
#     result = ""
#
#     try:
#         # STEP 1: Find actual lesson data (flatten any wrapping)
#         if "lesson" in lesson_obj and isinstance(lesson_obj["lesson"], dict):
#             lesson_data = lesson_obj["lesson"]
#             if "lesson" in lesson_data and isinstance(lesson_data["lesson"], dict):
#                 lesson_data = lesson_data["lesson"]
#         else:
#             lesson_data = lesson_obj  # Already the core object (as in your case)
#
#         # STEP 2: Title
#         title = lesson_data.get("lesson_title") or lesson_data.get("title", "")
#         result += f"{title}. "
#
#         # STEP 3: Introduction
#         intro = lesson_data.get("introduction", "")
#         result += f"{intro} "
#
#         # STEP 4: Sections — support dict and list
#         sections = lesson_data.get("sections", {})
#         if isinstance(sections, dict):
#             for section_name, section_data in sections.items():
#                 result += f"Section: {section_name}. "
#                 if isinstance(section_data, dict):
#                     for v in section_data.values():
#                         if isinstance(v, str):
#                             result += v + " "
#                 elif isinstance(section_data, str):
#                     result += section_data + " "
#
#         elif isinstance(sections, list):
#             for section in sections:
#                 result += f"Section: {section.get('title', '')}. "
#                 content = section.get("content", {})
#                 if isinstance(content, dict):
#                     for text in content.values():
#                         if isinstance(text, str):
#                             result += text + " "
#                 elif isinstance(content, str):
#                     result += content + " "
#
#         # STEP 5: Older "lessons" format
#         for lesson_name, l_data in lesson_data.get("lessons", {}).items():
#             result += f"Lesson: {lesson_name}. "
#             result += l_data.get("introduction", "") + " "
#             content = l_data.get("content", {})
#             for v in content.values():
#                 result += v + " "
#             for p in l_data.get("key_points", []):
#                 result += p + " "
#
#     except Exception as e:
#         print(f"❌ Error flattening lesson: {e}")
#
#     return result.strip()


def flatten_any_lesson(obj, depth=0) -> str:
    """
    Recursively flattens any JSON-like object into a readable text string for TTS.
    Supports arbitrary nesting of dicts/lists/strings.
    """
    result = ""
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(key, str) and key.lower() not in ("type", "id", "slug"):
                result += f"{key.replace('_', ' ').capitalize()}. "
            result += flatten_any_lesson(value, depth + 1)
    elif isinstance(obj, list):
        for item in obj:
            result += flatten_any_lesson(item, depth)
    elif isinstance(obj, str):
        stripped = obj.strip()
        if stripped:
            result += f"{stripped} "
    return result
#

# ------------------------------
# Gemini Content Moderation LLM
# ------------------------------
moderation_llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-thinking-exp-01-21",
    temperature=0,
    max_tokens=256
)

moderation_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        "You are a strict content moderation assistant for a learning platform.\n"
        "Your job is to evaluate whether a user-submitted topic is appropriate for educational content.\n"
        "You must respond with a clear moderation label: Safe, Offensive, Harassment, Hate, NSFW, or Uncertain.\n"
        "Then briefly explain the reason behind your classification."
    ),
    HumanMessagePromptTemplate.from_template(
        'Evaluate the following topic: "{input}"\n\n'
        'Respond in the format:\nCategory: <label>\nReason: <short explanation>'
    )
])

moderation_chain = moderation_prompt | moderation_llm

# ------------------------------
# Gemini Relevance Moderation LLM
# ------------------------------

relevance_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        "You are an educational topic validator for a learning platform. Your job is to decide whether a user-submitted topic is suitable for generating a structured, multi-part educational lesson (including overview, content, takeaways, etc.).\n\n"
        "Label the topic as:\n"
        "- Educational: if it has enough depth, specificity, or academic potential to build a lesson.\n"
        "- Trivial: if it is too vague, overly simple, generic, or unfit for structured learning (e.g., 'spoon', 'blue', 'ball').\n\n"
        "Examples:\n"
        "✔ Educational: 'Photosynthesis', 'Introduction to Quantum Computing', 'The Cold War'\n"
        "✘ Trivial: 'Spoon', 'Red', 'Chair', 'Funny things'\n\n"
        "Only return this format. Do not include any additional content, explanations, or disclaimers."
    ),
    HumanMessagePromptTemplate.from_template(
        'Evaluate this topic: \"{input}\"\n\n'
        'Respond in the format:\nCategory: <label>\nReason: <short explanation>'
    )
])
relevance_chain = relevance_prompt | moderation_llm

# ------------------------------
# FastAPI Setup
# ------------------------------
origins = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3002",
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    override: bool = False

# ------------------------------
# LangChain RAG Agent Setup
# ------------------------------
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    max_tokens=700,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

updated_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        "You are a helpful assistant. When answering a question, always include both the content and the source URL if available."
    ),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    HumanMessagePromptTemplate.from_template("{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agent = create_openai_tools_agent(llm, tools, updated_prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=False)

# ------------------------------
# Helper Functions (same as before)
# ------------------------------
def rag_retrieve(query: str) -> list:
    try:
        response = agent_executor.invoke({"input": query})
        output_text = response.get("output", "")
        urls = re.findall(r'https?://[^\s\)]+', output_text)
        urls = list(set(re.sub(r'[\)\]]$', '', url) for url in urls))
        references = [f"Source: {url.strip()}" for url in urls] if urls else [{"reference": "No references found."}]
        return references
    except Exception as e:
        print(f"Error in RAG retrieval: {e}")
        return ["Error in retrieval."]

def clean_json_response(response_text: str):
    """Attempts to safely parse potentially malformed JSON from an LLM."""
    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        print("Initial JSON parse failed:", e)

    match = re.search(r"```(?:json)?(.*?)```", response_text, re.DOTALL)
    if match:
        response_text = match.group(1)

    response_text = response_text.strip()
    response_text = re.sub(r"(?<!\\)'", '"', response_text)  # fix single to double quotes
    response_text = re.sub(r",\s*([}\]])", r"\1", response_text)  # remove trailing commas

    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        print("Final JSON parse failed after cleaning:", e)
        return None

def load_previous_lessons(topic):
    folder = topic.replace(" ", "_")
    texts = []
    if os.path.exists(folder):
        for filename in sorted(os.listdir(folder)):
            if filename.endswith(".json"):
                filepath = os.path.join(folder, filename)
                with open(filepath, "r") as f:
                    lesson_json = json.load(f)
                    if "lesson" in lesson_json:
                        l = lesson_json["lesson"]
                        texts.append(
                            f"{l.get('title', '')}\n{l.get('overview', '')}\n{l.get('content', '')}\n{l.get('takeaways', '')}"
                        )
    return "\n".join(texts) if texts else ""

def save_lesson(topic, lesson_name, lesson_data):
    folder = topic.replace(" ", "_")
    os.makedirs(folder, exist_ok=True)
    filename = lesson_name.replace(" ", "_") + ".json"
    filepath = os.path.join(folder, filename)
    with open(filepath, "w") as f:
        json.dump(lesson_data, f, indent=2)
    print(f"Lesson saved to {filepath}")

# ------------------------------
# API Endpoints
# ------------------------------
@app.post("/get_toc")
async def get_lesson_plan(request: TopicRequest):
    # 🔒 Step 1: Moderate the topic
    mod_result = moderation_chain.invoke({"input": request.topic})
    match = re.search(r"Category:\s*(\w+).*?Reason:\s*(.*)", mod_result.content, re.DOTALL)
    if not match or match.group(1).strip().lower() != "safe":
        reason = match.group(2).strip() if match else "Could not evaluate the topic."
        raise HTTPException(status_code=400, detail=f"Topic rejected by moderation: {reason}")

    # ✅ Step 2: Check relevance
    rel = relevance_chain.invoke({"input": request.topic})
    match = re.search(r"Category:\s*(\w+).*?Reason:\s*(.*)", rel.content, re.DOTALL)
    if not match or match.group(1).strip().lower() != "educational":
        reason = match.group(2).strip() if match else "Unknown"
        raise HTTPException(status_code=400, detail={
            "status": "soft-block",
            "category": "Trivial",
            "reason": reason,
            "allow_override": True
        })

    # ✅ Step 2: Generate TOC
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI tutor that creates structured lesson plans for educational topics."},
            {"role": "user", "content": f"Create a lesson plan for teaching {request.topic}. Provide ONLY a numbered table of contents."}
        ],
    )
    lesson_titles = re.findall(r"\d+\.\s(.+)", response.choices[0].message.content)
    return {"table_of_contents": lesson_titles}

@app.post("/get_previous_lessons")
async def get_previous_lessons(request: TopicRequest):
    prev_context = load_previous_lessons(request.topic)
    return {"previous_lessons": prev_context}

@app.get("/audio/{filename}")
async def get_audio_file(filename: str):
    file_path = os.path.join("audio", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/mpeg")
    raise HTTPException(status_code=404, detail="Audio file not found.")

@app.post("/generate_lesson")
async def generate_lesson(request: LessonRequest):
    # # 🔒 Step 1: Moderate the topic
    # mod_result = moderation_chain.invoke({"input": request.lesson_name})
    # match = re.search(r"Category:\s*(\w+).*?Reason:\s*(.*)", mod_result.content, re.DOTALL)
    # if not match or match.group(1).strip().lower() != "safe":
    #     reason = match.group(2).strip() if match else "Could not evaluate the topic."
    #     raise HTTPException(status_code=400, detail=f"Topic rejected by moderation: {reason}")

    # ✅ Step 2: Proceed with lesson generation
    table_of_contents = "\n".join(request.toc)
    previous_context = load_previous_lessons(request.topic)
    references = rag_retrieve(request.lesson_name)

    max_retries = 5
    delay_seconds = 2
    attempt = 0
    lesson_data = None

    while attempt < max_retries:
        attempt += 1
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": 'You are an AI tutor that creates structured and interactive learning lessons. The output must be returned strictly as a JSON object with the following keys. '},
                {"role": "user", "content": f"Generate a lesson on '{request.lesson_name}'. TOC: {table_of_contents}. Context: {previous_context}. Return the result as a JSON object."}
            ],
            response_format={"type": "json_object"}

        )
        lesson_json_str = response.choices[0].message.content
        lesson_data = clean_json_response(lesson_json_str)
        raw_lesson = lesson_data
        if lesson_data:
            break
        time.sleep(delay_seconds)

    if lesson_data is None:
        raise HTTPException(status_code=500, detail="Failed to parse lesson JSON.")

    # lesson_data["references"] = references

    # ✅ TTS Audio Generation for Entire Lesson
    try:
        print(" Lesson going into flatten_full_curriculum:")
        print(json.dumps(lesson_data, indent=2)[:1000])  # show first 1000 chars

        lesson_text_for_audio = flatten_any_lesson(lesson_data)
        print(" Final lesson_text_for_audio (preview):", lesson_text_for_audio[:300])
        print(" Character count:", len(lesson_text_for_audio))

        if not lesson_text_for_audio.strip() or len(lesson_text_for_audio.strip()) < 20:
            raise ValueError("Lesson text is empty or too short for TTS.")

        audio_url = generate_tts_audio(lesson_text_for_audio, request.lesson_name)
        raw_lesson["audio_url"] = audio_url

    except Exception as e:
        print(f" TTS generation failed: {e}")
        raw_lesson["audio_url"] = None

        # Wrap & Save Final Output
    lesson_data = {
        "lesson": raw_lesson,
        "references": references
    }

    save_lesson(request.topic, request.lesson_name, {"lesson": lesson_data})
    return {"lesson": lesson_data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)
