import os
import json
import re
import time
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key="REMOVED_OPENAI_API_KEY")

# ------------------------------
# Step 1: Generate Table of Contents
# ------------------------------
def get_lesson_plan(topic):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an AI tutor that creates structured lesson plans for educational topics. Ensure clarity, organization, and relevance."
            },
            {
                "role": "user",
                "content": f"Create a structured lesson plan for teaching {topic}. Provide ONLY a table of contents with lesson titles, numbered sequentially. Do NOT include subtopics, assessments, activities, group projects, discussions, or summaries. Format the response as follows:\n\n## Table of Contents\n\n1. Lesson Name 1\n2. Lesson Name 2\n3. Lesson Name 3\n..."
            }
        ]
    )
    response_text = response.choices[0].message.content
    lesson_titles = re.findall(r"\d+\.\s(.+)", response_text)
    return lesson_titles

# ------------------------------
# Step 2: Extract and Clean JSON
# ------------------------------
def clean_json_response(response_text):
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

# ------------------------------
# Step 3: Load All Previous Lessons for Context
# ------------------------------
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
                        title = lesson_json["lesson"]["title"]
                        overview = lesson_json["lesson"]["overview"]
                        content = lesson_json["lesson"]["content"]
                        takeaways = lesson_json["lesson"]["takeaways"]
                        texts.append(f"{title}\n{overview}\n{content}\n{takeaways}")
    return "\n".join(texts) if texts else ""

# ------------------------------
# Step 4: Generate Lesson
# ------------------------------
def generate_lesson(lesson_name, topic, toc, previous_lessons_context="", retry=False):
    table_of_contents = "\n".join(toc)
    prev_summary = previous_lessons_context if previous_lessons_context else "No previous lesson context available."

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": 'You are an AI tutor that creates structured and interactive learning lessons. Ensure lessons are engaging, well-organized, and contain quizzes. For every lesson you generate, you follow the following JSON format: \{"lesson": \{title: "", overview:"", previous_summary:"", content: \{ you are free to take liberties here\}, quizzes: {question, options, answer}, flashcards: {term, definition} \}, graphs: {title, code}, takeaways: [] \}. You dont need to have all interactive elements in one lesson but you may have them as you see fit and relevant.'
            },
            {
                "role": "user",
                "content": f"Generate a detailed lesson on '{lesson_name}'. This is part of a structured course. Here is the course's Table of Contents:\n\n{table_of_contents}\n\nIf possible, provide a brief summary of the previous lessons to maintain continuity: {prev_summary}\n\nFormat the lesson as JSON. Include lesson content, quizzes, flashcards, graphs (code in Svelte using Layer Cake), and key takeaways.",
            }
        ]
    )

    lesson_json_str = response.choices[0].message.content
    print(lesson_json_str)  # Debugging: Print raw API response
    lesson_data = clean_json_response(lesson_json_str)

    if lesson_data is None and not retry:
        print("🔄 Retrying API call due to JSON error...")
        time.sleep(5)
        return generate_lesson(lesson_name, topic, toc, previous_lessons_context, retry=True)

    if lesson_data is None:
        print("❌ Final JSON Parse Failed After Retry. Consider manual debugging.")
    
    return lesson_data

# ------------------------------
# Step 5: Save Generated Lesson to File
# ------------------------------
def save_lesson(topic, lesson_name, lesson_data):
    folder = topic.replace(" ", "_")
    if not os.path.exists(folder):
        os.makedirs(folder)
    filename = lesson_name.replace(" ", "_") + ".json"
    filepath = os.path.join(folder, filename)
    with open(filepath, "w") as f:
        json.dump(lesson_data, f, indent=2)
    print(f"✅ Lesson saved to {filepath}")

# ------------------------------
# Step 6: Main function with Continuous Prompting
# ------------------------------
def main():
    topic = input("Enter topic: ").strip()
    print(f"📚 Generating Table of Contents for: {topic}")
    toc = get_lesson_plan(topic)

    if not toc:
        print("❌ No lessons found in TOC.")
        return

    print("\n📌 Table of Contents:")
    for i, lesson in enumerate(toc, 1):
        print(f"{i}. {lesson}")

    lesson_index = 0
    while lesson_index < len(toc):
        selected_lesson = toc[lesson_index]
        print(f"\n📝 Generating lesson for: {selected_lesson}")

        prev_context = load_previous_lessons(topic)
        print("prev_context:" + prev_context)
        lesson_data = generate_lesson(selected_lesson, topic, toc, prev_context)

        if lesson_data:
            print("✅ Lesson Generated Successfully!")
            print(json.dumps(lesson_data, indent=2))
            save_lesson(topic, selected_lesson, lesson_data)

        user_input = input("\n❓ Do you want to continue to the next lesson? (yes/no): ").strip().lower()
        if user_input != "yes":
            print("✅ Lesson generation stopped.")
            break

        lesson_index += 1

if __name__ == "__main__":
    main()
