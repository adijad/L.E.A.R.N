# tts_converter.py
import os
import uuid
from elevenlabs.client import AsyncElevenLabs

# Instantiate client once
eleven = AsyncElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))  # Set in your .env

async def generate_tts_audio(text: str, voice_id="kdmDKE6EkgrWrrykO9Qt", output_dir="static/audio") -> str:
    """Generate TTS audio, save as MP3, and return relative file path."""
    stream = eleven.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id="eleven_flash_v2_5",
        output_format="mp3_44100_128"
    )

    os.makedirs(output_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, "wb") as f:
        async for chunk in stream:
            f.write(chunk)

    return filepath
