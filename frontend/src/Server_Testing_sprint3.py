import asyncio
import os
import sys
import webbrowser
from typing import List
from xml.etree import ElementTree

import requests
from bs4 import BeautifulSoup
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.chat_models import ChatOpenAI
from langchain.schema import Document
from langchain.tools import Tool
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_google_genai import (ChatGoogleGenerativeAI,
                                    GoogleGenerativeAIEmbeddings)

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'RAG_for_server_testing')))
import json
import os
import re
import time
from enum import Enum
from typing import List

import openai
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from langchain_core.prompts import (ChatPromptTemplate,
                                    HumanMessagePromptTemplate,
                                    MessagesPlaceholder,
                                    SystemMessagePromptTemplate)
from openai import OpenAI
from pydantic import BaseModel
from RAG_for_server_testing import tools

from tts_converter import generate_tts_audio

sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "RAG_code"))
)

# In-memory storage for chatbot context
chat_context_store = {}

# ------------------------------
load_dotenv()
# ------------------------------
# OpenAI Client
# ------------------------------

client = OpenAI(
    api_key="REMOVED_OPENAI_API_KEY"
)

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
# Chatbot Relevance LLM
# ------------------------------

chatbot_relevance_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        "You are a strict content filter for an educational assistant.\n"
        "Check if the user's question is relevant to the topic and selected paragraph.\n"
        "Respond exactly in this format:\n"
        "Category: <Relevant or Off-topic>\n"
        "Reason: <short reason>"
    ),
    HumanMessagePromptTemplate.from_template(
        "Topic: {topic}\n\n"
        "Paragraph: {paragraph}\n\n"
        "Question: {question}"
    )
])
chatbot_relevance_chain = chatbot_relevance_prompt | moderation_llm


# ------------------------------
# FastAPI Setup
# ------------------------------
origins = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3002",
]

from fastapi.staticfiles import StaticFiles

app = FastAPI()
# app.mount("/static", StaticFiles(directory="static"), name="static")


# app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Language Enum
# ------------------------------

class Language(Enum):
    Arabic_Saudi_Arabia = "Arabic (Saudi Arabia)"
    Arabic_UAE = "Arabic (UAE)"
    Bulgarian = "Bulgarian"
    Chinese = "Chinese"
    Croatian = "Croatian"
    Czech = "Czech"
    Danish = "Danish"
    Dutch = "Dutch"
    English_Australia = "English (Australia)"
    English_Canada = "English (Canada)"
    English_USA = "English (USA)"
    English_UK = "English (UK)"
    Filipino = "Filipino"
    Finnish = "Finnish"
    French_Canada = "French (Canada)"
    French_France = "French (France)"
    German = "German"
    Greek = "Greek"
    Hindi = "Hindi"
    Hungarian = "Hungarian"
    Indonesian = "Indonesian"
    Italian = "Italian"
    Japanese = "Japanese"
    Korean = "Korean"
    Malay = "Malay"
    Norwegian = "Norwegian"
    Polish = "Polish"
    Portuguese_Brazil = "Portuguese (Brazil)"
    Portuguese_Portugal = "Portuguese (Portugal)"
    Romanian = "Romanian"
    Russian = "Russian"
    Slovak = "Slovak"
    Spanish_Mexico = "Spanish (Mexico)"
    Spanish_Spain = "Spanish (Spain)"
    Swedish = "Swedish"
    Tamil = "Tamil"
    Turkish = "Turkish"
    Ukrainian = "Ukrainian"
    Vietnamese = "Vietnamese"


LANGUAGE_TO_VOICE_ID = {
    Language.Arabic_Saudi_Arabia: "DPd861uv5p6zeVV94qOT",
    Language.Arabic_UAE: "5Spsi3mCH9e7futpnGE5",
    Language.Bulgarian: "kzrsjZhHCumKqmkJl486",
    Language.Chinese: "bhJUNIXWQQ94l8eI2VUf",
    Language.Croatian: "FXFcxnjikw0naYO1PPrU",
    Language.Czech: "piwFF76q4v4xA9Wyxu1R",
    Language.Danish: "6SjhOkgKPuHxm8q0eIyp",
    Language.Dutch: "UNBIyLbtFB9k7FKW8wJv",
    Language.English_Australia: "sai9UY7iXkRDSsXHR0bZ",
    Language.English_Canada:"y26Xv4PQ7Ftbu1mfaEFY",
    Language.English_USA: "lLM2bI7XZWLA1bTu2pPJ",
    Language.English_UK: "jB2lPb5DhAX6l1TLkKXy",
    Language.Filipino: "8eI7a7dYeWINkpv4iCLy",
    Language.Finnish: "3OArekHEkHv5XvmZirVD",
    Language.French_Canada: "j9RedbMRSNQ74PyikQwD",
    Language.French_France: "QbsdzCokdlo98elkq4Pc",
    Language.German: "aduJlSmEKqbhRQAAMzV2",
    Language.Greek: "wykE1oPxFaMrxdpOtFt6",
    Language.Hindi: "zgqefOY5FPQ3bB7OZTVR",
    Language.Hungarian: "yyPLNYHg3CvjlSdSOdLh",
    Language.Indonesian: "k5eTzx1VYYlp6BE39Qrj",
    Language.Italian: "uV2Bhcm1HwmAqPqkbjfl",
    Language.Japanese: "MlgbiBnm4o8N3DaDzblH",
    Language.Korean: "PDoCXqBQFGsvfO0hNkEs",
    Language.Malay: "NpVSXJvYSdIbjOaMbShj",
    Language.Norwegian: "4kCDY3HJwvO7Zp3con83",
    Language.Polish: "XoHJ8hwSLOtb2sXYdAzv",
    Language.Portuguese_Brazil: "6pQlwCgfwffNdI3jjzM6",
    Language.Portuguese_Portugal: "aLFUti4k8YKvtQGXv0UO",
    Language.Romanian: "sGcPNcpR5PikknzyXcy7",
    Language.Russian: "2OdNfs9Z4GCMvoFiCavC",
    Language.Slovak: "Zai7B4Aol2bJtneyq0L1",
    Language.Spanish_Mexico: "sDh3eviBhiuHKi0MjTNq",
    Language.Spanish_Spain: "ZCh4e9eZSUf41K4cmCEL",
    Language.Swedish: "6eknYWL7D5Z4nRkDy15t",
    Language.Tamil: "9Ats6C5UrhVXzgyVbnh3",
    Language.Turkish: "Cwyzv9MeYGnlpio4bkSm",
    Language.Ukrainian: "0ZQZuw8Sn4cU0rN1Tm2K",
    Language.Vietnamese: "2vT8WlUXV1qBtgiLZdSb",
}


# ------------------------------
# FastAPI Models
# ------------------------------
class TopicRequest(BaseModel):
    topic: str

class TTSRequest(BaseModel):
    text: str

class LessonRequest(BaseModel):
    topic: str
    lesson_name: str
    toc: List[str]

class ContextRequest(BaseModel):
    topic: str
    toc: List[str]
    selected_text: str

class ChatRequest(BaseModel):
    topic: str
    question: str

# ------------------------------
# Utility Functions
# ------------------------------
# ------------------------------
# Step 1: LangChain RAG Agent Setup
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

# ------------------------------
# Step 2: Define Tools and Agent
# ------------------------------

agent = create_openai_tools_agent(llm, tools, updated_prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=False)

# ------------------------------
# RAG Retrieval Function
# ------------------------------

def rag_retrieve(query: str) -> list:
    try:
        response = agent_executor.invoke({"input": query})
        output_text = response.get("output", "")
        # print(f"Raw output from agent_executor: {output_text}")

        references = []
        urls = re.findall(r"https?://[^\s\)]+", output_text)
        urls = list(set(urls))

        for url in urls:
            clean_url = re.sub(
                r"[\)\]]$", "", url
            )  # Removing `]` if it was part of the URL in Markdown
            references.append(f"Source: {clean_url.strip()}")
        if not references:
            print(" No references found. Using fallback.")
            references = [{"reference": "No references found."}]

        return references

    except Exception as e:
        print(f" Error in RAG retrieval: {e}")
        return ["Error in retrieval."]

# ------------------------------
# Step 2: Extract and Clean JSON
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
        print(" JSON Parse Failed Again:", e)
        return None

# ------------------------------
# Step 3: Load All Previous Lessons for Context
# ------------------------------

# def load_previous_lessons(topic):
#     """Loads all previous lessons for the topic to use as context."""
#     folder = topic.replace(" ", "_")
#     texts = []
#     if os.path.exists(folder):
#         for filename in sorted(os.listdir(folder)):
#             if filename.endswith(".json"):
#                 filepath = os.path.join(folder, filename)
#                 with open(filepath, "r") as f:
#                     lesson_json = json.load(f)
#                     if "lesson" in lesson_json:
#                         title = lesson_json["lesson"]["title"]
#                         overview = lesson_json["lesson"]["overview"]
#                         content = lesson_json["lesson"]["content"]
#                         takeaways = lesson_json["lesson"]["takeaways"]
#                         texts.append(f"{title}\n{overview}\n{content}\n{takeaways}")
#     return "\n".join(texts) if texts else ""


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
# ------------------------------
# Step 5: Save Generated Lesson to File
# ------------------------------


def save_lesson(topic, lesson_name, lesson_data):
    """Saves the lesson as a JSON file in a topic-named folder."""
    base_folder = os.path.join("lessons", topic.replace(" ", "_"))
    os.makedirs(base_folder, exist_ok=True)  # ✅ Ensure full path is created

    filename = lesson_name.replace(" ", "_") + ".json"
    filepath = os.path.join(base_folder, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(lesson_data, f, indent=2)
    print(f" Lesson saved to {filepath}")


# ------------------------------
# Step 6: Chatbot Question-Answering logic
# ------------------------------

def check_question_relevance(topic: str, paragraph: str, question: str) -> bool:
    try:
        result = chatbot_relevance_chain.invoke({
            "topic": topic,
            "paragraph": paragraph,
            "question": question
        })
        match = re.search(r"Category:\s*(\w+)", result.content)
        return match and match.group(1).lower() == "relevant"
    except Exception as e:
        print(f"❌ Relevance check failed: {e}")
        return False

def generate_answer_directly(topic: str, selected_text: str, toc: List[str], question: str) -> str:
    toc_str = "\n".join(f"- {item}" for item in toc)
    prompt = f"""
You are a helpful educational tutor. The student is learning about "{topic}".

Here is the paragraph the student selected from the lesson:
\"\"\"{selected_text}\"\"\"

The full lesson covers:
{toc_str}

The student asked:
"{question}"

Answer using ONLY the above context. Be clear and helpful.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

@app.post("/store_context")
async def store_context(request: ContextRequest):
    chat_context_store[request.topic] = {
        "selected_text": request.selected_text,
        "toc": request.toc
    }
    return {"status": "Context stored successfully."}


# ------------------------------
# FastAPI Endpoints
# ------------------------------
# ------------------------------
# Step 4: Generate Table of Contents
# ------------------------------

@app.post("/get_toc")
async def get_lesson_plan(
    topic_request: TopicRequest, language: Language = Language.English_USA
):
    """Generates a Table of Contents for the given topic."""

    # Check if the language is supported
    if language.value not in [lang.value for lang in Language]:
        raise HTTPException(
            status_code=400, detail=f"The language '{language.value}' is not supported."
        )

    mod_result = moderation_chain.invoke({"input": topic_request.topic})
    match = re.search(r"Category:\s*(\w+).*?Reason:\s*(.*)", mod_result.content, re.DOTALL)
    if not match or match.group(1).strip().lower() != "safe":
        reason = match.group(2).strip() if match else "Could not evaluate the topic."
        raise HTTPException(status_code=400, detail=f"Topic rejected by moderation: {reason}")

    # ✅ Step 2: Check relevance
    rel = relevance_chain.invoke({"input": topic_request.topic})
    match = re.search(r"Category:\s*(\w+).*?Reason:\s*(.*)", rel.content, re.DOTALL)
    if not match or match.group(1).strip().lower() != "educational":
        reason = match.group(2).strip() if match else "Unknown"
        raise HTTPException(status_code=400, detail={
            "status": "soft-block",
            "category": "Trivial",
            "reason": reason,
            "allow_override": True
        })

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an AI tutor that creates structured lesson plans for educational topics in given language. Ensure clarity, organization, and relevance.",
            },
            {
                "role": "user",
                "content": f"Create a structured lesson plan for teaching {topic_request.topic} in {language.value}. Provide ONLY a table of contents with lesson titles, numbered sequentially. Do NOT include subtopics, assessments, activities, group projects, discussions, or summaries. Format the response as follows:\n\n## Table of Contents\n\n1. Lesson Name 1\n2. Lesson Name 2\n3. Lesson Name 3\n...",
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


# ------------------------------
# Step 4: Generate Lesson
# ------------------------------

@app.post("/generate_lesson")
async def generate_lesson(
    request: LessonRequest, language: Language = Language.English_USA
):
    """Generates a lesson based on the topic, lesson name, and previous context."""

    # Check if the language is supported
    if language.value not in [lang.value for lang in Language]:
        raise HTTPException(
            status_code=400, detail=f"The language '{language.value}' is not supported."
        )

    table_of_contents = "\n".join(request.toc)
    previous_context = load_previous_lessons(request.topic)
    references = rag_retrieve(request.lesson_name)

    max_retries = 5
    delay_seconds = 2
    attempt = 0
    lesson_data = None

    while attempt < max_retries:
        attempt += 1
        print(f" Attempt {attempt} to get valid lesson JSON...")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": 'You are an AI tutor that creates structured and interactive learning lessons in given language. If language is Non-Latin based script, output the lesson in the respective script. Ensure lessons are engaging, well-organized, and contain quizzes with at least 5 questions. For every lesson you generate, you follow the following JSON format: \{"lesson": \{title: "", overview:"", previous_summary:"", content: \{ you are free to take liberties here\}, quizzes: {question, options, answer}, flashcards: {term, definition} \}, graphs: {title, code, explanation}, takeaways: [], "interactives": [ optional array of interactive elements ] \}. You dont need to have all interactive elements in one lesson but have at least one. You may have multiple of them as you see fit and relevant. You may choose from: \{ type:timeline, title, data: [ \{ year, event \} ] \}, \{ type: memory_match, title, pairs: [ \{ term, definition \} ] \}, \{ type: drag_drop,  prompt, items: [ \{ label, target \} ] \}, \{ type: map, title, regions: [ \{ name, highlight, tooltip \} ] \}, \{ type: map_hotspots,  image, hotspots: [ \{ label, x, y, tooltip \} ] \}, \{type: typing_challenge,  text \}, \{type: sort, prompt, items: [ "..." ] \}',
                },
                {
                    "role": "user",
                    "content": f"Generate a detailed lesson on '{request.lesson_name}' in {language.value}. This is part of a structured course. Here is the course's Table of Contents:\n\n{table_of_contents}\n\nIf possible, provide a brief summary of the previous lessons to maintain continuity: {previous_context}\n\nFormat the lesson as JSON. Include lesson content, quizzes, flashcards, graphs (code in React using Recharts library but only return structured data like {{title, type, xKey, yKey, data}}, not full component code or imports), and key takeaways.",
                },
            ],
            response_format={"type": "json_object"},
        )

        lesson_json_str = response.choices[0].message.content
        lesson_data = clean_json_response(lesson_json_str)

        if lesson_data:
            print(" Successfully parsed lesson JSON.")
            break
        else:
            print(f" Attempt {attempt} failed to parse JSON.")
            time.sleep(delay_seconds)

    if lesson_data is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to parse lesson JSON after multiple retries.",
        )
        # Add references to the lesson data (if references are found)
    lesson_data["references"] = references  # Add the references to the lesson data

    save_lesson(request.topic, request.lesson_name, lesson_data)
    return {"lesson": lesson_data}

# ------------------------------
# Step 5: Chatbot Question-Answering
# ------------------------------

@app.post("/chatbot_qa")
async def chatbot_qa(request: ChatRequest):
    context = chat_context_store.get(request.topic)
    if not context:
        raise HTTPException(status_code=400, detail="No stored context found for this topic.")

    selected_text = context.get("selected_text", "")
    toc = context.get("toc", [])
    question = request.question.strip()

    # ✅ Input validation
    if not question or len(question) < 3 or re.fullmatch(r"[\W\d\s]+", question):
        return {
            "status": "invalid",
            "message": "Please enter a meaningful question."
        }

    if not selected_text or not toc:
        raise HTTPException(status_code=400, detail="Incomplete context.")

    # Step 1: Relevance filter
    is_relevant = check_question_relevance(request.topic, selected_text, request.question)
    if not is_relevant:
        return {
            "status": "off-topic",
            "message": f"Please ask something relevant to the current lesson on '{request.topic}'."
        }

    # Step 2: Generate answer
    answer = generate_answer_directly(request.topic, selected_text, toc, request.question)
    return {
        "status": "ok",
        "answer": answer
    }

# ------------------------------
# Step 5: Generate Translated Lesson
# ------------------------------

@app.post("/translate")
async def translate(payload: dict, language: Language = Language.English_USA):
    """
    Translates all string values in the given JSON to the specified language.
    """
    if language.value not in [lang.value for lang in Language]:
        raise HTTPException(
            status_code=400,
            detail=f"The language '{language.value}' is not supported."
        )

    # Build the prompt to instruct the model to translate every string value
    prompt = (
        f"Translate every string value in the following JSON object into {language.value}. "
        "Do NOT change any keys or the JSON structure. Only translate the textual values. "
        f"Return a valid JSON with the same structure.\n\nJSON:\n{json.dumps(payload, ensure_ascii=False)}"
    )

    max_retries = 5
    delay_seconds = 2
    attempt = 0
    translated_json = None

    while attempt < max_retries:
        attempt += 1
        print(f"Attempt {attempt} to translate JSON...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional translator. Given a JSON object, translate every string value "
                        "into the specified language, ensuring that no keys or the overall JSON structure is altered."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        )

        translated_json_str = response.choices[0].message.content.strip()
        try:
            translated_json = json.loads(translated_json_str)
            print("Successfully parsed translated JSON.")
            break
        except Exception as e:
            print(f"Attempt {attempt} failed to parse JSON: {e}")
            time.sleep(delay_seconds)

    if translated_json is None:
        raise HTTPException(
            status_code=500,
            detail="Translation failed or returned invalid JSON after multiple retries."
        )

    return translated_json

# ------------------------------
# Step 6: Generate TTS Audio
# ------------------------------

@app.post("/tts")
async def tts_generate(payload: TTSRequest, language: Language = Language.English_USA):
    text = payload.text.strip()
    if language.value not in [lang.value for lang in Language]:
        raise HTTPException(
            status_code=400,
            detail=f"The language '{language.value}' is not supported."
        )

    if not text:
        raise HTTPException(status_code=400, detail="Text is required.")

    voice_id = LANGUAGE_TO_VOICE_ID.get(language)
    if not voice_id:
        raise HTTPException(status_code=400, detail=f"No voice configured for language: {language.value}")

    try:
        file_path = await generate_tts_audio(text, voice_id=voice_id)
        audio_url = f"http://localhost:8000/{file_path.replace(os.sep, '/')}"
        return {"audioUrl": audio_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")



# ------------------------------
# Run FastAPI Server
# ------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app)

