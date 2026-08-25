# L.E.A.R.N: Learning Enhanced by AI & Reasoning

**An AI-powered personalized tutoring platform that dynamically generates grounded, adaptive, and multilingual learning experiences.**

[**View Demo**](https://drive.google.com/file/d/1l2UsFEB8l0X69Jn8Hoo0BH_0_XykqPCq/view)

---

## Overview

L.E.A.R.N is an interactive AI tutoring platform designed to make personalized learning accessible across topics, languages, and learning styles.

Instead of relying on static course content, L.E.A.R.N dynamically creates structured learning paths, lessons, quizzes, explanations, and interactive activities based on a learner's selected topic and progress.

The platform combines **Large Language Models, Retrieval-Augmented Generation (RAG), adaptive learning, multilingual translation, text-to-speech, and interactive learning tools** into a unified tutoring experience.

---

## Key Features

- **Dynamic Lesson Generation**  
  Generates a structured Table of Contents and complete lessons for virtually any educational topic.

- **Retrieval-Augmented Generation (RAG)**  
  Grounds generated lessons using external knowledge sources such as Wikipedia, ArXiv, Semantic Scholar, Project Gutenberg, and the Internet Archive.

- **Adaptive Learning**  
  Adjusts lesson and quiz difficulty based on learner performance and proficiency.

- **32-Language Support**  
  Translates lessons, interactive components, and chatbot responses using Google Translate with LLM-based refinement.

- **Text-to-Speech**  
  Uses ElevenLabs to generate natural multilingual audio versions of lessons.

- **Interactive Learning**  
  Dynamically generates quizzes, flashcards, graphs, timelines, drag-and-drop exercises, matching games, trivia, and visual content.

- **AI Learning Assistant**  
  Provides three contextual chatbot modes:
  - **L.E.A.R.N**: guided lesson walkthroughs
  - **Clarify**: deeper explanations of selected concepts
  - **Questions**: open-ended, context-aware Q&A

- **Content Moderation**  
  Uses LLaMA Guard and Gemini-based relevance checks to filter unsafe, irrelevant, or inappropriate topics before lesson generation.

- **Progress Tracking**  
  Stores lesson progress, completed topics, quiz performance, and personalized learning history.

---

## RAG Pipeline

L.E.A.R.N uses a two-stage retrieval architecture to reduce hallucinations and improve factual grounding.

1. User queries are embedded using **Gemini Embeddings**.
2. **FAISS** searches a vector store containing indexed educational content.
3. If relevant information is not available locally, the system retrieves fresh information from external knowledge sources.
4. Retrieved documents are filtered using semantic similarity.
5. Relevant context is passed to the LLM for grounded lesson generation.
6. Generated lessons include references that allow learners to explore the original sources.

---

## Architecture

L.E.A.R.N follows a modular full-stack architecture built around REST APIs.

```text
                         ┌──────────────────────┐
                         │   L.E.A.R.N Website │
                         │       React.js       │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
          Web Backend       Lesson Generation     Translation
          Spring Boot          FastAPI / AI        Service
                  │                 │
          ┌───────┴──────┐          │
          │              │          ▼
       User DB       Lesson DB    RAG + LLM
                                   │
                              ┌────┴────┐
                              │  FAISS  │
                              └─────────┘

                                    │
                                    ▼
                             Text-to-Speech
                               ElevenLabs
```

The backend separates authentication, persistent user data, lesson generation, translation, RAG, moderation, and text-to-speech into modular services.

---

## Tech Stack

**Frontend**
- React.js
- React Router
- Recharts
- CSS

**Backend**
- Spring Boot
- FastAPI
- REST APIs
- PostgreSQL
- JPA

**AI / ML**
- OpenAI / GPT
- Retrieval-Augmented Generation
- Gemini Embeddings
- FAISS
- Google Translate API
- LLaMA Guard
- ElevenLabs
- Replicate / FLUX

**Knowledge Sources**
- Wikipedia
- ArXiv
- Semantic Scholar
- Project Gutenberg
- Internet Archive
- PubMed

---

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js
- Java / Maven
- PostgreSQL

### Clone the Repository

```bash
git clone https://github.com/adijad/L.E.A.R.N.git
cd L.E.A.R.N
```

### Install Dependencies

```bash
# Python dependencies
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Environment Variables

Create the required `.env` files locally and provide the API credentials used by the services.

```env
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
ELEVENLABS_API_KEY=your_elevenlabs_key
REPLICATE_API_TOKEN=your_replicate_token
DATABASE_URL=your_postgresql_connection
```

> Never commit `.env` files or API credentials to Git.

### Run the Application

Start the required backend services and then launch the React frontend.

```bash
# Spring Boot backend
mvn spring-boot:run

# React frontend
cd frontend
npm start
```

---

## Team

- **Aditya Sambhaji Jadhav**: AI/ML, Gamification
- **Yash Rathi**: AI/ML, Full-Stack Development
- **Sriharsha Vemuri**: Project Management, DevOps
- **B Ankit**: Full-Stack Development, UI/UX

**Project Supervisor:** Prof. Sara Hooshangi

---

## Future Work

Potential extensions include:

- Learning analytics and knowledge-gap identification
- Improved multilingual validation
- Mobile optimization
- Classroom and LMS integrations
- Expanded accessibility features
- Talking-head AI tutor/avatar
