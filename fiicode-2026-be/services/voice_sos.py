import os
from tempfile import NamedTemporaryFile
from fastapi import HTTPException, UploadFile
from openai import OpenAI
from starlette.config import Config

from schemas.pulse import PulseCreateSchema

config = Config(".env")
OPENAI_KEY = config("OPENAI_KEY", default=None)

class VoiceSOSService:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_KEY) if OPENAI_KEY else None

    async def parse_audio_sos(self, file: UploadFile, latitude: float, longitude: float, author_id: str) -> dict:
        if not self.client:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")

        # Save uploaded file temporarily for OpenAI Whisper
        temp_file = NamedTemporaryFile(delete=False, suffix=".m4a")
        try:
            content = await file.read()
            temp_file.write(content)
            temp_file.close()

            # 1. Transcribe audio using Whisper
            with open(temp_file.name, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file,
                    language="en",
                    prompt="This is an emergency SOS message about a crisis situation."
                )
            
            transcript_text = transcription.text

            # 2. Extract structured data using GPT-4o-mini
            prompt = (
                f"Extract emergency details from the following audio transcript: '{transcript_text}'.\n"
                "Return a JSON object with the following keys:\n"
                "- 'type': One of ['Medical Help', 'Water Needed', 'SOS', 'Missing Person', 'Road Blocked', 'Evacuation Info']. Choose the closest match.\n"
                "- 'urgency_level': One of ['Low', 'Medium', 'High'].\n"
                "- 'content': The exact transcript or a concise summary of the issue."
            )

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1,
            )

            import json
            extracted = json.loads(response.choices[0].message.content)

            # 3. Create the payload for the pulse
            pulse_data = {
                "author_id": author_id,
                "type": "Emergency",
                "urgency_level": extracted.get("urgency_level", "High"),
                "content": f"[VOICE SOS] {extracted.get('content', transcript_text)}",
                "skills": [],
                "latitude": latitude,
                "longitude": longitude,
            }

            return pulse_data

        except Exception as e:
            print(f"[Voice SOS] Error processing audio: {e}")
            raise HTTPException(status_code=500, detail="Failed to process voice SOS")
        finally:
            if os.path.exists(temp_file.name):
                os.remove(temp_file.name)
