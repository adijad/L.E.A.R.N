# L.E.A.R.N - AI-Powered Personal Tutor
  
**Revolutionizing Personalized Learning with AI**

---

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Team](#team)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Project Overview
The **AI-Powered Personal Tutor** is an interactive learning platform designed to provide **adaptive, personalized education** using cutting-edge AI. It dynamically adjusts lessons, quizzes, and explanations based on individual student performance, supports multiple languages, and integrates gamification to enhance engagement. Built for students, teachers, and lifelong learners, this project bridges gaps in traditional education by making high-quality tutoring accessible to all.

---

## Key Features
- **Adaptive Learning**: Lessons adjust difficulty based on quiz scores (0–5: easy, 6–8: medium, 9–10: hard).  
- **Multilingual Support**: Learn in your native language with accurate translations.  
- **Gamification**: Earn badges, points, and rewards for completing lessons.  
- **Talking Head Avatar**: Human-like explanations for immersive learning.  
- **Natural Language Q&A**: Ask questions and receive AI-driven answers instantly.  
- **Accessibility**: High-contrast UI, simplified navigation, and larger fonts.  

---

## Installation
### Prerequisites
- Python 3.8+
- Node.js (for frontend)
- PostgreSQL

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://gitlab.com/your-username/ai-personal-tutor.git
   cd ai-personal-tutor
2. **Install Dependencies**:
    # Backend (Python)
        pip install -r requirements.txt
    # Frontend (React)
        cd frontend
        npm install
3. **Set up environment variables**:
    # Create a .env file in the root directory:
        OPENAI_API_KEY=your_openai_key
        GOOGLE_TRANSLATE_API_KEY=your_google_key
        DATABASE_URL=postgresql://user:password@localhost:5432/tutor_db
4. **Run the Application**:
    # Start the backend server using Java Spring Boot:
        mvn spring-boot:run
    # Start frontend
        cd frontend
        npm start
        
Configuration

Environment Variables

Variable	Description
OPENAI_API_KEY	OpenAI API key for lesson generation
GOOGLE_TRANSLATE_API_KEY	Google Cloud Translation API key
DATABASE_URL	PostgreSQL database connection URL

For Teachers
Access real-time progress reports via the dashboard.
Export student data to CSV for LMS integration.

Team
Sriharsha Vemuri: Project Management, DevOps
Yash Rathi: AI/ML, Full Stack Development
Aditya Sambhaji Jadhav: AI/ML, Gamification
B Ankit: Full Stack Development, UI/UX

Acknowledgments

AI Models: OpenAI GPT-4,
Frameworks: React, Flask, PostgreSQL
Icons: FontAwesome, Material-UI
