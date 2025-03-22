# --------------------------------------------------------------
###Imports
# --------------------------------------------------------------

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
import requests


# --------------------------------------------------------------
###Load environment variables
# --------------------------------------------------------------
load_dotenv()

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
#
# # Modify the Wikipedia tool to call this retriever
# def wikipedia_with_clickable_link(query):
#     retriever = WikipediaRetriever()
#     result = retriever.search(query)
#     references = result["references"]
#     return references
#


class WikipediaRetriever:
    def __init__(self, top_k_results=3):
        self.top_k_results = top_k_results
        self.api_url = "https://en.wikipedia.org/w/api.php"

    def search(self, query):
        params = {
            'action': 'query',
            'format': 'json',
            'list': 'search',
            'srsearch': query,
            'srlimit': self.top_k_results,
            'utf8': 1
        }

        # Send a request to Wikipedia's API to search for articles
        response = requests.get(self.api_url, params=params)

        if response.status_code == 200:
            search_results = response.json().get('query', {}).get('search', [])
            references = []

            # Extract the titles and create URLs
            for result in search_results:
                title = result['title']
                references.append(f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}")

            return references
        else:
            return []

def wikipedia_with_clickable_link(query):
    retriever = WikipediaRetriever(top_k_results=5)
    references = retriever.search(query)

    # Remove any unwanted newlines or special characters
    clean_references = [ref.replace("\n", "") for ref in references]

    return clean_references


# query = "Indigenous Peoples and Societies of Americas"
# response = wikipedia_with_clickable_link(query)
#
# # Print the URLs (references) returned
# for ref in response:
#     print(ref)

# ## Test Wikipedia Tool
# query = "Quantum Computing"
# response = wikipedia_with_clickable_link(query)
#
# print(response)


# --------------------------------------------------------------
### Initialize Arxiv API Wrapper for Document Retrieval
#---------------------------------------------------------------


# class ArxivRetriever:
#     def __init__(self, top_k_results=3):
#         self.top_k_results = top_k_results
#         self.api_url = "http://export.arxiv.org/api/query"
#
#     def search(self, query):
#         params = {
#             'search_query': f'all:{query}',  # Search for the query in all fields
#             'start': 0,
#             'max_results': self.top_k_results,
#             'sortBy': 'relevance',
#             'sortOrder': 'descending'
#         }
#
#         # Send a request to ArXiv's API to search for articles
#         response = requests.get(self.api_url, params=params)
#
#         if response.status_code == 200:
#             # Parse the XML response from ArXiv API
#             entries = response.text.split('<entry>')
#             references = []
#
#             # Extract the title and create URLs for the top results
#             for entry in entries[1:]:  # The first split is empty, so we skip it
#                 # Extract the title of the article
#                 title_start = entry.find('<title>') + len('<title>')
#                 title_end = entry.find('</title>')
#                 title = entry[title_start:title_end].strip()
#
#                 # Generate the ArXiv URL using the article ID
#                 id_start = entry.find('<id>') + len('<id>')
#                 id_end = entry.find('</id>')
#                 article_id = entry[id_start:id_end].strip()
#                 article_url = article_id
#
#                 # Append the URL to the references list
#                 references.append(article_url)
#
#             return references
#         else:
#             return []
#
#
# # Testing the ArXiv Search API Approach
# def arxiv_with_clickable_link(query):
#     retriever = ArxivRetriever(top_k_results=5)
#     references = retriever.search(query)
#
#     return references
#
#
# query = "Quantum Computing"
# response = arxiv_with_clickable_link(query)
#
# # Print the URLs (references) returned
# for ref in response:
#     print(ref)

# --------------------------------------------------------------
### Initialize Google Scholar API Wrapper for Document Retrieval
#---------------------------------------------------------------

# class GoogleScholarRetriever:
#     def __init__(self):
#         self.wrapper = GoogleSearchAPIWrapper(
#             google_api_key=google_api_key,
#             google_cse_id=google_cse_id
#         )
#         self.search = GoogleSearchRun(api_wrapper=self.wrapper)
#
#     def search(self, query):
#         """Fetches Google Scholar search results and returns text and URLs."""
#         results = self.search.run(query)
#         return results
#
#
# def google_scholar_with_clickable_link(query):
#     retriever = GoogleScholarRetriever()
#     results = retriever.search(query)
#
#     for entry in results:
#         # Extract URL
#         url = entry['link']
#
#         # Display result in PyCharm terminal with Rich
#         console.print(
#             f"[bold green]Google Scholar Response: Title: {entry['title']}\nSnippet: {entry['snippet']}[/bold green]")
#         console.print(f"[bold blue][link={url}]Click here to see the article[/link][/bold blue]\n")
#
#     return results
#
# ### Test Google Scholar Tool
# query = "Quantum Computing"
# response = google_scholar_with_clickable_link(query)
#
# # Print raw response (just in case you want to check the text)
# print(response)

################ Newest Google Scholar API Wrapper

# from scholarly import scholarly
#
#
# class GoogleScholarRetriever:
#     def __init__(self, top_k_results=3):
#         self.top_k_results = top_k_results
#
#     def search(self, query):
#         # Search Google Scholar for articles matching the query
#         search_results = scholarly.search_pubs(query)
#
#         references = []
#
#         # Loop through search results and collect the top-k article URLs
#         for i, result in enumerate(search_results):
#             if i >= self.top_k_results:
#                 break
#             # Extract the URL from the search result
#             title = result['bib']['title']
#             url = result[
#                 'url'] if 'url' in result else f"https://scholar.google.com/scholar?q={title.replace(' ', '+')}"
#             references.append(url)
#
#         return references
#
#
# # Testing the Google Scholar Search API Approach
# def google_scholar_with_clickable_link(query):
#     retriever = GoogleScholarRetriever(top_k_results=5)
#     references = retriever.search(query)
#
#     return references
#
#
# query = "Quantum Computing"
# response = google_scholar_with_clickable_link(query)
#
# # Print the URLs (references) returned
# for ref in response:
#     print(ref)

# --------------------------------------------------------------
### Initialize PubMed
#---------------------------------------------------------------

######### Class: PubMedLoader (Fetching Articles)
class PubMedLoader:
    def __init__(self, query, top_k=3):
        self.query = query
        self.top_k = top_k
        self.api_key = os.getenv("PUBMED_API_KEY")
        self.base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"

    def fetch_article_ids(self):
        """Fetches PubMed article IDs for a given query."""
        params = {
            "db": "pubmed",
            "term": self.query,
            "retmode": "json",
            "retmax": self.top_k,
            "api_key": self.api_key
        }
        response = requests.get(self.base_url, params=params).json()
        return response.get("esearchresult", {}).get("idlist", [])

    def fetch_article_abstracts(self, article_ids):
        """Fetches full abstracts for given PubMed article IDs."""
        articles = []
        for article_id in article_ids:
            url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={article_id}&retmode=text&rettype=abstract&api_key={self.api_key}"
            article_text = requests.get(url).text
            articles.append({"id": article_id, "content": article_text})
        return articles

    def load(self):
        """Fetches articles and returns them as raw text."""
        article_ids = self.fetch_article_ids()
        if not article_ids:
            return []

        return self.fetch_article_abstracts(article_ids)


###### Embedding Model & FAISS Initialization

# Initialize Google AI Embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# Initialize FAISS as None (will be created when data is available)
vectordb = None
retriever = None

# Text Splitter for chunking abstracts before storing
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)


########## Function: Retrieve PubMed Articles

def retrieve_pubmed_articles(query):
    global vectordb, retriever

    # Check FAISS first
    if retriever:
        similar_docs = retriever.get_relevant_documents(query)
        if similar_docs:
            print("Retrieving from FAISS (Cached Results)")
            return similar_docs

    print("No Cached Results, Calling PubMed API...")

    # Fetch fresh articles from PubMed API
    pubmed_loader = PubMedLoader(query, top_k=3)
    docs = pubmed_loader.load()

    if not docs:
        print("No articles retrieved from PubMed.")
        return []

    print(f"Retrieved {len(docs)} articles from PubMed")

    # Displaying results with clickable links using Rich
    for doc in docs:
        article_id = doc['id']
        article_content = doc['content']
        url = f"https://pubmed.ncbi.nlm.nih.gov/{article_id}"

        # Render link with Rich
        # console.print(f"[bold green]PubMed Response: {article_content[:300]}...[/bold green]")
        # console.print(f"[bold blue][link={url}]Click here to see the full article[/link][/bold blue]\n")

    # Store new results in FAISS only if there are documents
    doc_objects = [Document(page_content=doc['content']) for doc in docs]

    if doc_objects:
        chunked_documents = text_splitter.split_documents(doc_objects)

        # Store in FAISS
        vectordb = FAISS.from_documents(chunked_documents, embeddings)
        retriever = vectordb.as_retriever()
        print("New results stored in FAISS for future queries.")

    return doc_objects

### Test PubMed Tool

# Test PubMed Retrieval
# query = "Artificial Intelligence in Healthcare"
# results = retrieve_pubmed_articles(query)
#
# # Print the response
# for idx, result in enumerate(results):
#     print(f"\n🔹 Result {idx+1}:\n{result.page_content[:500]}...")
#




# --------------------------------------------------------------
### Tools Integration
# --------------------------------------------------------------


# Wikipedia Tool
wikipedia_tool = Tool(
    name="Wikipedia_Search",  # ✅ Name must be valid for Gemini API
    func=wikipedia_with_clickable_link,  # Calls the function we modified
    description="Search for Wikipedia articles on a given topic. Returns both content and source URL."
)

# PubMed Tool
pubmed_tool = Tool(
    name="PubMed_Search",
    func=retrieve_pubmed_articles,  # Using the PubMed retrieval function
    description="Search for academic research papers from PubMed based on a given query. Use this tool for medical and scientific topics."
)


tools = [wikipedia_tool, pubmed_tool]



























