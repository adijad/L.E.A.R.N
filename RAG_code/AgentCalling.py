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
from dotenv import load_dotenv
from RAG import tools




from dotenv import load_dotenv
load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-2.0-pro-exp-02-05", temperature=0, max_tokens=700)

# from langchain import hub
# # Get the prompt to use - you can modify this!
# prompt = hub.pull("hwchase17/openai-functions-agent")
# prompt.messages.insert(0, "When answering a question, always include both the content and the source URL if available.")
# prompt.messages

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate, SystemMessagePromptTemplate

updated_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        "You are a helpful assistant. When answering a question, always include both the content and the source URL if available."
    ),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    HumanMessagePromptTemplate.from_template("{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

updated_prompt.messages


### Agents
from langchain.agents import create_openai_tools_agent
agent=create_openai_tools_agent(llm,tools,updated_prompt)


## Agent Executer
from langchain.agents import AgentExecutor
agent_executor=AgentExecutor(agent=agent,tools=tools,verbose=False)
# agent_executor

query = "American History"
agent_response = agent_executor.invoke({"input": query})

# Print the formatted response
print(agent_response["output"])

