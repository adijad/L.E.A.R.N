# --------------------------------------------------------------
###Imports
# --------------------------------------------------------------
import asyncio
import os
import sys
import webbrowser
from typing import List
from xml.etree import ElementTree
import threading
import replicate
import requests
from bs4 import BeautifulSoup
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.chat_models import ChatOpenAI
from langchain.schema import Document
#from langchain.tools import Tool
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_google_genai import (ChatGoogleGenerativeAI,
                                    GoogleGenerativeAIEmbeddings)

# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'RAG_for_server_testing')))
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'RAG_Final_Testing')))
import json
import os
import re
import time
from enum import Enum
from typing import List
from typing import Literal
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
# from RAG_for_server_testing import tools

from tts_converter import generate_tts_audio

# sys.path.append(
#     # os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "RAG_code"))
# )

from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
import os
from langchain_community.utilities import ArxivAPIWrapper
from langchain_community.tools import ArxivQueryRun
# from langchain_community.utilities import GoogleSearchAPIWrapper
# from langchain_community.tools import GoogleSearchRun
from langchain_google_community import GoogleSearchAPIWrapper, GoogleSearchRun
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import Document
#from langchain.tools import Tool
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
from IPython.display import Markdown, display
from rich import print
from rich.console import Console
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
import faiss
import numpy as np
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.tools import ArxivQueryRun
from langchain_community.utilities import ArxivAPIWrapper
import requests
from bs4 import BeautifulSoup
import requests
import re
import arxiv
import arxiv
import numpy as np
from langchain.schema import Document
from langchain_community.vectorstores import FAISS
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.schema.messages import SystemMessage, HumanMessage

# --------------------------------------------------------------
###Load environment variables
# --------------------------------------------------------------
load_dotenv()

# ------------------------------
load_dotenv()
# ------------------------------
# OpenAI Client
# ------------------------------

client = OpenAI(
    api_key="REMOVED_OPENAI_API_KEY"
)

google_api_key = os.getenv("GOOGLE_API_KEY")
google_cse_id = os.getenv("GOOGLE_CSE_ID")

# --------------------------------------------------------------
### Initialize Wikipedia API Wrapper for Document Retrieval
#---------------------------------------------------------------

# class WikipediaRetriever:
#     def __init__(self, top_k_results=3, doc_content_chars_max=500):
#         self.wrapper = WikipediaAPIWrapper(top_k_results=top_k_results, doc_content_chars_max=doc_content_chars_max)
#
#     def search(self, query):
#         result = self.wrapper.run(query)
#         url = f"https://en.wikipedia.org/wiki/{query.replace(' ', '_')}"
#         return {"references": [url]}
#
# # Modify the Wikipedia tool to call this retriever
# def wikipedia_with_clickable_link(query):
#     retriever = WikipediaRetriever()
#     result = retriever.search(query)
#     references = result["references"]
#     return references

wiki_vectordb = None
wiki_retriever = None
wiki_embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
wiki_text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)


class WikipediaRetriever:
    def __init__(self, top_k_results=3):
        self.top_k_results = top_k_results
        self.api_url = "https://en.wikipedia.org/w/api.php"

    def search(self, query):
        global wiki_vectordb, wiki_retriever
        params = {
            'action': 'query',
            'format': 'json',
            'list': 'search',
            'srsearch': query,
            'srlimit': self.top_k_results,
            'utf8': 1
        }

        response = requests.get(self.api_url, params=params)
        if response.status_code != 200:
            return []

        search_results = response.json().get('query', {}).get('search', [])
        references = []
        documents = []

        for result in search_results:
            title = result['title']
            url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
            references.append(url)

            # Step 2: Scrape full article content
            content = self.scrape_wikipedia_content(url)
            if content:
                documents.append(Document(
                    page_content=content,
                    metadata={"source": url}
                ))

        # Step 3: Store content in FAISS
        if documents:
            chunks = wiki_text_splitter.split_documents(documents)
            if wiki_vectordb is None:
                wiki_vectordb = FAISS.from_documents(chunks, wiki_embeddings)
                wiki_retriever = wiki_vectordb.as_retriever()
            else:
                wiki_vectordb.add_documents(chunks)

        # Step 4: Retrieve semantically relevant sources
        if wiki_retriever:
            results = wiki_retriever.get_relevant_documents(query)
            top_sources = []
            seen = set()
            for doc in results:
                src = doc.metadata.get("source")
                if src and src not in seen:
                    top_sources.append(src)
                    seen.add(src)
                if len(top_sources) >= self.top_k_results:
                    break
            return top_sources

        # Fallback if vector search fails
        return references

    def scrape_wikipedia_content(self, url):
        try:
            response = requests.get(url, timeout=5)
            soup = BeautifulSoup(response.content, 'html.parser')
            paragraphs = soup.find_all('p')
            return '\n'.join([p.get_text() for p in paragraphs if p.get_text(strip=True)]).strip()
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return ""


def wikipedia_with_clickable_link(query):
    retriever = WikipediaRetriever(top_k_results=3)
    references = retriever.search(query)

    # Clean references: Remove any unwanted newlines or special characters
    clean_references = [ref.replace("\n", "") for ref in references]

    # Debugging: Check the cleaned references
    # print(f"Clean References: {clean_references}")

    return clean_references

#
# query = "American History"
# response = wikipedia_with_clickable_link(query)
#
# # Print the URLs (references) returned
# for ref in response:
#     print(ref)

# --------------------------------------------------------------
### Initialize Arxiv API Wrapper for Document Retrieval
#---------------------------------------------------------------

# --- Globals for ArXiv ---
arxiv_vectordb = None
arxiv_retriever = None

arxiv_embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
arxiv_text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

llm_filter = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    max_tokens=700,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

class ArxivRetriever:
    def __init__(self, top_k_results=3):
        self.top_k_results = top_k_results

    def is_relevant_to_topic_arxiv(self, text, topic):
        """Use LLM to decide if this text is about the given topic."""
        messages = [
            SystemMessage(content="You're given a scientific paper abstract and title."),
            HumanMessage(content=f"""Given the following text, determine if this paper is about: "{topic}"?

Text:
{text}

Answer only "yes" or "no".""")

        ]
        response = llm_filter.invoke(messages)
        return response.content.strip().lower() == "yes"

    def search(self, query):
        global arxiv_vectordb, arxiv_retriever

        try:
            search = arxiv.Search(
                query=query,
                max_results=self.top_k_results * 5,
                sort_by=arxiv.SortCriterion.Relevance
            )
            results = list(search.results())
        except Exception as e:
            print(f"Error querying ArXiv API: {e}")
            return []

        documents = []
        references = []

        for paper in results:
            try:
                title = paper.title
                abstract = paper.summary
                url = paper.entry_id

                if not (title and abstract and url):
                    continue

                full_text = f"{title.strip()}\n\n{abstract.strip()}"

                # ✅ Step: Ask LLM if it's about the topic
                if self.is_relevant_to_topic_arxiv(full_text, query):
                    references.append(url)
                    documents.append(Document(
                        page_content=full_text,
                        metadata={"source": url}
                    ))

            except Exception as e:
                print(f"Skipping paper due to error: {e}")
                continue

        # Skip if LLM said none are relevant
        if not documents:
            return []

        # ✅ Embed & store in FAISS
        chunks = arxiv_text_splitter.split_documents(documents)
        if arxiv_vectordb is None:
            arxiv_vectordb = FAISS.from_documents(chunks, arxiv_embeddings)
            arxiv_retriever = arxiv_vectordb.as_retriever()
        else:
            arxiv_vectordb.add_documents(chunks)

        # ✅ Search and return top-k sources
        if arxiv_retriever:
            results = arxiv_retriever.get_relevant_documents(query, k=10)
            top_sources = []
            seen = set()
            for doc in results:
                src = doc.metadata.get("source")
                if src and src not in seen:
                    top_sources.append(src)
                    seen.add(src)
                if len(top_sources) >= self.top_k_results:
                    break
            return top_sources

        return references

def arxiv_with_clickable_link(query):
    retriever = ArxivRetriever(top_k_results=3)
    references = retriever.search(query)
    return [ref.replace("\n", "") for ref in references]

#
#
### Test Arxiv Tool
# query = "American History"
# results = arxiv_with_clickable_link(query)  # ✅ You forgot this line
#
# for ref in results:
#     print(ref)

# --------------------------------------------------------------
### Initialize PubMed
#---------------------------------------------------------------
# -----------------------------
# Load Environment Variables
# -----------------------------
load_dotenv()
PUBMED_API_KEY = os.getenv("PUBMED_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# -----------------------------
# LLM for Filtering
# -----------------------------
llm_filter_pubmed = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    max_tokens=700,
    openai_api_key=OPENAI_API_KEY
)

def is_relevant_to_topic_pubmed(text: str, topic: str) -> bool:
    """Use LLM to decide if text is about the query topic."""
    messages = [
        SystemMessage(content="You are a helpful academic assistant."),
        HumanMessage(content=f"""Does the following abstract relate to the topic: "{topic}"?

Text:
{text}

Respond only with "yes" or "no".""")
    ]
    try:
        response = llm_filter_pubmed.invoke(messages)
        return response.content.strip().lower() == "yes"
    except Exception as e:
        print(f"LLM filtering error: {e}")
        return False

# -----------------------------
# PubMed Loader
# -----------------------------
class PubMedLoader:
    def __init__(self, query, top_k=5):
        self.query = query
        self.top_k = top_k
        self.api_key = PUBMED_API_KEY
        self.base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"

    def fetch_article_ids(self):
        params = {
            "db": "pubmed",
            "term": self.query,
            "retmode": "json",
            "retmax": self.top_k,
            "api_key": self.api_key
        }
        try:
            response = requests.get(self.base_url, params=params).json()
            return response.get("esearchresult", {}).get("idlist", [])
        except Exception as e:
            print(f"Error fetching article IDs: {e}")
            return []

    def fetch_article_abstracts(self, article_ids):
        articles = []
        for article_id in article_ids:
            if not article_id.strip():
                continue  # skip blank IDs
            url = (
                f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
                f"?db=pubmed&id={article_id}&retmode=text&rettype=abstract&api_key={self.api_key}"
            )
            try:
                article_text = requests.get(url).text
                articles.append({"id": article_id, "content": article_text})
            except Exception as e:
                print(f"Error fetching article {article_id}: {e}")
        return articles

    def load(self):
        ids = self.fetch_article_ids()
        return self.fetch_article_abstracts(ids) if ids else []

# -----------------------------
# FAISS + Embedding Setup
# -----------------------------
pubmed_vectordb = None
pubmed_retriever = None

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

# -----------------------------
# Main PubMed Retrieval Function
# -----------------------------
def retrieve_pubmed_articles(query: str):
    global pubmed_vectordb, pubmed_retriever

    if pubmed_retriever:
        results = pubmed_retriever.get_relevant_documents(query)
        return list({doc.metadata["source"] for doc in results if "source" in doc.metadata})

    loader = PubMedLoader(query=query, top_k=8)
    docs = loader.load()

    if not docs:
        print("❌ No documents retrieved from PubMed.")
        return []

    print(f"📄 Retrieved {len(docs)} docs. Filtering by LLM...")

    filtered_docs = []
    for doc in docs:
        text = doc.get("content", "").strip()
        article_id = doc.get("id", "").strip()

        if not article_id or not text:
            continue  # skip malformed items

        if is_relevant_to_topic_pubmed(text, query):
            url = f"https://pubmed.ncbi.nlm.nih.gov/{article_id}"
            filtered_docs.append(Document(page_content=text, metadata={"source": url}))
        else:
            print(f"⚠️ Skipping irrelevant doc: {article_id}")

    if not filtered_docs:
        print("⚠️ No relevant documents found.")
        return []

    print(f"✅ Retained {len(filtered_docs)} relevant docs. Indexing in FAISS...")

    chunks = text_splitter.split_documents(filtered_docs)
    if pubmed_vectordb is None:
        pubmed_vectordb = FAISS.from_documents(chunks, embeddings)
        pubmed_retriever = pubmed_vectordb.as_retriever()
    else:
        pubmed_vectordb.add_documents(chunks)

    results = pubmed_retriever.get_relevant_documents(query)
    return list({doc.metadata["source"] for doc in results if "source" in doc.metadata})

# -----------------------------
# Example Usage
# -----------------------------
# Test PubMed Tool
# query = "American History"
# results = retrieve_pubmed_articles(query)
#
# # Print the URLs
# for idx, url in enumerate(results):
#     print(f"\n🔹 Result {idx+1}: {url}")


# --------------------------------------------------------------
# Semantic Scholar Search Tool
#---------------------------------------------------------------

load_dotenv()

SEMANTIC_API_KEY = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

llm_filter_semantic = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    max_tokens=700,
    openai_api_key=OPENAI_API_KEY
)

def is_relevant_to_topic_semantic(text: str, topic: str) -> bool:
    messages = [
        SystemMessage(content="You are a helpful academic assistant."),
        HumanMessage(content=f"""Does the following abstract relate to the topic: "{topic}"?

Text:
{text}

Respond only with "yes" or "no".""")
    ]
    try:
        response = llm_filter_semantic.invoke(messages)
        return response.content.strip().lower() == "yes"
    except Exception as e:
        print(f"LLM filtering error: {e}")
        return False

# FAISS globals
semantic_vectordb = None
semantic_retriever = None

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

def retrieve_semantic_scholar_articles(query: str):
    global semantic_vectordb, semantic_retriever

    if semantic_retriever:
        results = semantic_retriever.get_relevant_documents(query)
        return [doc.metadata["source"] for doc in results if "source" in doc.metadata]

    headers = {
        "x-api-key": SEMANTIC_API_KEY,
        "Content-Type": "application/json"
    }

    params = {
        "query": query,
        "limit": 10,
        "fields": "title,abstract,url"
    }

    try:
        res = requests.get(
            "https://api.semanticscholar.org/graph/v1/paper/search",
            params=params,
            headers=headers
        )
        papers = res.json().get("data", [])
    except Exception as e:
        print(f"Error calling Semantic Scholar API: {e}")
        return []

    documents = []
    references = []

    for paper in papers:
        try:
            title = paper.get("title", "")
            abstract = paper.get("abstract", "")
            url = paper.get("url", "")

            if not (title and abstract and url):
                continue

            full_text = f"{title.strip()}\n\n{abstract.strip()}"

            if is_relevant_to_topic_semantic(full_text, query):
                documents.append(Document(
                    page_content=full_text,
                    metadata={"source": url}
                ))
                references.append(url)

        except Exception as e:
            print(f"Skipping paper due to error: {e}")
            continue

    if not documents:
        return []

    chunks = text_splitter.split_documents(documents)

    if semantic_vectordb is None:
        semantic_vectordb = FAISS.from_documents(chunks, embeddings)
        semantic_retriever = semantic_vectordb.as_retriever()
    else:
        semantic_vectordb.add_documents(chunks)

    return references


# ----------------------------------------
# Gutenberg Search Tool
# ----------------------------------------

gutenberg_vectordb = None
gutenberg_retriever = None

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

llm_filter_gutenberg = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    max_tokens=700
)

def is_relevant_to_topic(text: str, topic: str) -> bool:
    messages = [
        SystemMessage(content="You are a helpful assistant for filtering books by topic."),
        HumanMessage(content=f"""Does the following book description relate to the topic: "{topic}"?

Text:
{text}

Respond only with "yes" or "no". Even partial or indirect relevance counts as "yes".""")
    ]
    try:
        response = llm_filter_gutenberg.invoke(messages)
        return response.content.strip().lower() == "yes"
    except Exception as e:
        print(f"⚠️ LLM filter error: {e}")
        return False

def gutenberg_with_clickable_link(query: str, top_k_results=5):
    global gutenberg_vectordb, gutenberg_retriever

    try:
        response = requests.get(f"https://gutendex.com/books/?search={query}", timeout=15)
        items = response.json().get("results", [])[:top_k_results * 4]
    except Exception as e:
        print(f"❌ Error querying Gutendex API: {e}")
        return []

    references = []
    documents = []

    for item in items:
        try:
            title = item.get("title", "")
            authors = [a["name"] for a in item.get("authors", [])]
            book_id = item.get("id")
            url = f"https://www.gutenberg.org/ebooks/{book_id}"

            if not title or not book_id:
                continue

            # Just use title and authors for filtering
            full_text = f"{title} by {', '.join(authors)}"

            if is_relevant_to_topic(full_text, query):
                references.append(url)
                documents.append(Document(
                    page_content=full_text,
                    metadata={"source": url}
                ))
            else:
                print(f"⛔ Skipped irrelevant: {title} ({book_id})")

        except Exception as e:
            print(f"⚠️ Error processing book {item.get('id')}: {e}")
            continue

    if not documents:
        return []

    chunks = text_splitter.split_documents(documents)
    if gutenberg_vectordb is None:
        gutenberg_vectordb = FAISS.from_documents(chunks, embeddings)
        gutenberg_retriever = gutenberg_vectordb.as_retriever()
    else:
        gutenberg_vectordb.add_documents(chunks)

    # Use FAISS to retrieve final top URLs
    if gutenberg_retriever:
        results = gutenberg_retriever.get_relevant_documents(query)
        top_sources = []
        seen = set()
        for doc in results:
            src = doc.metadata.get("source")
            if src and src not in seen:
                top_sources.append(src)
                seen.add(src)
            if len(top_sources) >= top_k_results:
                break
        return top_sources

    return references

# query = "American History"
# results = gutenberg_with_clickable_link(query)
#
# for url in results:
#     print(url)

# -------------------------------------------------------------
# Internet Archive Search Tool
#---------------------------------------------------------------

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

# Initialize LLM Filter
llm_filter_internet_archive = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    max_tokens=700
)

# Global FAISS store
internet_archive_vectordb = None
internet_archive_retriever = None

# LLM-based filter
def is_relevant_to_topic_internet_archive(text: str, topic: str) -> bool:
    messages = [
        SystemMessage(content="You are a helpful assistant for filtering books by topic."),
        HumanMessage(content=f"""Does the following book metadata relate to the topic: "{topic}"?

Text:
{text}

Respond only with "yes" or "no". Even partial or indirect relevance counts as "yes".""")
    ]
    try:
        response = llm_filter_internet_archive.invoke(messages)
        return response.content.strip().lower() == "yes"
    except Exception as e:
        print(f"LLM filtering error: {e}")
        return False

# Main function
def internet_archive_with_clickable_link(query: str, top_k_results=5):
    global internet_archive_vectordb, internet_archive_retriever

    search_url = "https://archive.org/advancedsearch.php"
    params = {
        'q': f'{query} AND mediatype:texts',
        'fl[]': ['identifier', 'title', 'creator', 'year'],
        'rows': top_k_results * 4,
        'output': 'json'
    }

    try:
        response = requests.get(search_url, params=params)
        items = response.json()['response']['docs']
    except Exception as e:
        print(f"❌ Error querying Internet Archive API: {e}")
        return []

    references = []
    documents = []

    for item in items:
        identifier = item.get("identifier", "")
        title = item.get("title", "Unknown Title")
        creator = item.get("creator", ["Unknown Author"])
        year = item.get("year", "Unknown Year")
        url = f"https://archive.org/details/{identifier}"

        metadata_text = f"{title} by {', '.join(creator)} ({year})"

        if is_relevant_to_topic_internet_archive(metadata_text, query):
            references.append(url)
            documents.append(Document(
                page_content=metadata_text,
                metadata={"source": url}
            ))
        else:
            print(f"⛔ Skipped irrelevant: {metadata_text}")

    if not documents:
        return []

    chunks = text_splitter.split_documents(documents)
    if internet_archive_vectordb is None:
        internet_archive_vectordb = FAISS.from_documents(chunks, embeddings)
        internet_archive_retriever = internet_archive_vectordb.as_retriever()
    else:
        internet_archive_vectordb.add_documents(chunks)

    if internet_archive_retriever:
        results = internet_archive_retriever.get_relevant_documents(query)
        top_sources = []
        seen = set()
        for doc in results:
            src = doc.metadata.get("source")
            if src and src not in seen:
                top_sources.append(src)
                seen.add(src)
            if len(top_sources) >= top_k_results:
                break
        return top_sources

    return references
"""

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

# Global FAISS store and retriever
internet_archive_vectordb = None
internet_archive_retriever = None

def internet_archive_with_clickable_link(query: str, top_k_results=5):
    global internet_archive_vectordb, internet_archive_retriever

    search_url = "https://archive.org/advancedsearch.php"
    params = {
        'q': f'{query} AND mediatype:texts',
        'fl[]': ['identifier', 'title', 'creator', 'year', 'description', 'subject'],
        'rows': top_k_results * 4,  # extra results for better filtering
        'output': 'json'
    }

    try:
        response = requests.get(search_url, params=params)
        items = response.json()['response']['docs']
    except Exception as e:
        print(f"❌ Error querying Internet Archive API: {e}")
        return []

    documents = []
    for item in items:
        identifier = item.get("identifier", "")
        title = item.get("title", "Unknown Title")
        creators = item.get("creator", ["Unknown Author"])
        year = item.get("year", "Unknown Year")
        description = item.get("description", "")
        subjects = item.get("subject", [])
        url = f"https://archive.org/details/{identifier}"

        metadata_text = (
            f"{title} by {', '.join(creators)} ({year})\n"
            f"Description: {description}\n"
            f"Subjects: {', '.join(subjects)}"
        )

        documents.append(Document(
            page_content=metadata_text,
            metadata={"source": url}
        ))

    if not documents:
        return []

    # Split metadata into chunks (in case of long descriptions)
    chunks = text_splitter.split_documents(documents)

    # Build or update FAISS store
    if internet_archive_vectordb is None:
        internet_archive_vectordb = FAISS.from_documents(chunks, embeddings)
        internet_archive_retriever = internet_archive_vectordb.as_retriever()
    else:
        internet_archive_vectordb.add_documents(chunks)

    # Use vector search to retrieve relevant results
    results = internet_archive_retriever.get_relevant_documents(query)
    references = []
    seen = set()

    for doc in results:
        url = doc.metadata.get("source")
        if url and url not in seen:
            references.append(url)
            seen.add(url)
        if len(references) >= top_k_results:
            break

    return references

query = "Key Events of the War: 1939-1941"
results = internet_archive_with_clickable_link(query)

print("\n📚 Internet Archive References Found:\n")
for idx, url in enumerate(results, start=1):
    print(f"{idx}. {url}") """
