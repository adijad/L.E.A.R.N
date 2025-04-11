from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch
from dotenv import load_dotenv
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
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
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'RAG_code')))
from RAG_for_server_testing import tools
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate, SystemMessagePromptTemplate
import openai
from dotenv import load_dotenv
import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import re
import uvicorn
import os
import json
import re
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware



load_dotenv()

# HF_token = os.getenv("HF_TOKEN")
#
# model_id = "meta-llama/Llama-Guard-3-8B"
# tokenizer = AutoTokenizer.from_pretrained(model_id, token = HF_token)
# model = AutoModelForCausalLM.from_pretrained(model_id, device_map="auto", torch_dtype=torch.float16, token = HF_token)
#
# print("Model loaded successfully")


moderation_llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-thinking-exp-01-21",
    temperature=0,
    max_tokens=256
)


moderation_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        "You are a strict content moderation assistant for a learning platform. "
        "Your job is to evaluate whether a user-submitted topic is appropriate for educational content. "
        "You must respond with a clear moderation label: Safe, Offensive, Harassment, Hate, NSFW, or Uncertain. "
        "Then briefly explain the reason behind your classification."
    ),
    HumanMessagePromptTemplate.from_template(
        'Evaluate the following topic: "{input}"\n\n'
        'Respond in the format:\nCategory: <label>\nReason: <short explanation>'
    )
])


from langchain_core.runnables import RunnableLambda

# Combine LLM and prompt
moderation_chain = moderation_prompt | moderation_llm

# Run it
topic = "Fuck you, I hate you"
result = moderation_chain.invoke({"input": topic})

print(result.content)
