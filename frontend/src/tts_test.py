# import asyncio
# from elevenlabs import play

# from elevenlabs.client import AsyncElevenLabs

# eleven = AsyncElevenLabs(api_key="MY_API_KEY")  # Defaults to ELEVENLABS_API_KEY


# async def print_models() -> None:
#     audio = await eleven.text_to_speech.convert(
#         text="The first move is what sets everything in motion.",
#         voice_id="kdmDKE6EkgrWrrykO9Qt",
#         model_id="eleven_flash_v2_5",
#         output_format="mp3_44100_128",
#     )
#     play(audio)


# asyncio.run(print_models())

import asyncio
from elevenlabs import play
from elevenlabs.client import AsyncElevenLabs

eleven = AsyncElevenLabs(api_key="REMOVED_ELEVENLABS_API_KEY")  # Replace with your actual key


async def play_audio() -> None:
    stream = eleven.text_to_speech.convert(
        text="The first move is what sets everything in motion.",
        voice_id="kdmDKE6EkgrWrrykO9Qt",
        model_id="eleven_flash_v2_5",
        output_format="mp3_44100_128",
    )

    audio_bytes = bytearray()
    async for chunk in stream:
        audio_bytes.extend(chunk)

    play(bytes(audio_bytes))


asyncio.run(play_audio())
