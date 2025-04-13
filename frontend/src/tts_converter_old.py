import requests
import os

ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = "pqHfZKP75CvOlQylNhV4"
TTS_OUTPUT_DIR = "audio"

os.makedirs(TTS_OUTPUT_DIR, exist_ok=True)

def generate_tts_audio(text: str, lesson_id: str) -> str:
    if not ELEVEN_API_KEY:
        raise Exception("❌ ELEVENLABS_API_KEY is not set.")

    # Optional: truncate if the lesson is too long
    text = text[:4800] if len(text) > 5000 else text

    # Debug print
    print("🧠 Text sent to ElevenLabs (first 300 chars):\n", text[:300])
    print("🔢 Total characters:", len(text))

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.75,
            "similarity_boost": 0.75
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    content_type = response.headers.get("Content-Type")
    if response.status_code == 200 and content_type == "audio/mpeg":
        safe_id = lesson_id.replace(" ", "_").replace("/", "_")
        audio_path = os.path.join(TTS_OUTPUT_DIR, f"{safe_id}.mp3")

        with open(audio_path, "wb") as f:
            f.write(response.content)

        print(f"✅ Audio file saved at {audio_path}")
        return f"/audio/{safe_id}.mp3"
    else:
        print("❌ Invalid response from ElevenLabs:")
        print("Status Code:", response.status_code)
        print("Content-Type:", content_type)
        print("Response Text:", response.text)
        raise Exception("TTS generation failed: Invalid or non-audio response.")