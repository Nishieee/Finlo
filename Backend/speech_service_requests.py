# speech_service_requests.py
"""
Working Speech-to-SQL Service using requests library
Uses the method that worked in your test
"""

import os
import time
import tempfile
import requests
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import UploadFile, HTTPException
import logging
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WorkingSpeechToSQLService:
    """
    Speech-to-SQL service using requests library (proven to work on your system)
    """
    
    def __init__(self, openai_api_key: Optional[str] = None, base_url: str = "http://localhost:8000"):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.base_url = base_url
        self.whisper_api_url = "https://api.openai.com/v1/audio/transcriptions"
        
        # Supported audio formats
        self.supported_formats = {'.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'}
        self.max_file_size = 25 * 1024 * 1024  # 25MB
        
        if not self.openai_api_key:
            logger.warning("OpenAI API key not found. Speech functionality will not work.")
    
    def validate_audio_file(self, audio_file: UploadFile) -> Dict[str, Any]:
        """Validate audio file"""
        try:
            if not audio_file.filename:
                return {"valid": False, "error": "No audio file provided"}
            
            if audio_file.size and audio_file.size > self.max_file_size:
                return {
                    "valid": False, 
                    "error": f"File too large. Max size: {self.max_file_size // (1024*1024)}MB"
                }
            
            file_extension = Path(audio_file.filename).suffix.lower()
            if file_extension not in self.supported_formats:
                return {
                    "valid": False,
                    "error": f"Unsupported format. Supported: {', '.join(self.supported_formats)}"
                }
            
            return {
                "valid": True,
                "filename": audio_file.filename,
                "size": audio_file.size or 0,
                "format": file_extension
            }
            
        except Exception as e:
            return {"valid": False, "error": f"Validation error: {str(e)}"}
    
    async def transcribe_with_whisper(self, audio_file: UploadFile, language: str = "en") -> Dict[str, Any]:
        """
        Transcribe audio using requests library (the method that worked)
        """
        start_time = time.time()
        temp_file_path = None
        
        try:
            if not self.openai_api_key:
                return {
                    "success": False,
                    "error": "OpenAI API key not configured",
                    "processing_time_ms": 0
                }
            
            # Validate file
            validation = self.validate_audio_file(audio_file)
            if not validation["valid"]:
                return {
                    "success": False,
                    "error": validation["error"],
                    "processing_time_ms": int((time.time() - start_time) * 1000)
                }
            
            logger.info(f"🎤 Transcribing: {audio_file.filename} ({validation.get('size', 0)} bytes)")
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=Path(audio_file.filename).suffix) as temp_file:
                audio_content = await audio_file.read()
                temp_file.write(audio_content)
                temp_file.flush()
                temp_file_path = temp_file.name
            
            # Use requests library (the one that worked for you)
            with open(temp_file_path, 'rb') as audio_file_handle:
                files = {
                    'file': (audio_file.filename, audio_file_handle, 'audio/mpeg')
                }
                data = {
                    'model': 'whisper-1',
                    'language': language,
                    'response_format': 'json',
                    'temperature': 0
                }
                headers = {
                    'Authorization': f'Bearer {self.openai_api_key}'
                }
                
                logger.info("📤 Sending to Whisper API (using requests)...")
                response = requests.post(
                    self.whisper_api_url,
                    files=files,
                    data=data,
                    headers=headers,
                    timeout=60
                )
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                result = response.json()
                transcribed_text = result.get('text', '').strip()
                
                logger.info(f"✅ Transcription successful: '{transcribed_text}' ({processing_time_ms}ms)")
                
                return {
                    "success": True,
                    "text": transcribed_text,
                    "processing_time_ms": processing_time_ms,
                    "character_count": len(transcribed_text),
                    "word_count": len(transcribed_text.split()) if transcribed_text else 0
                }
            else:
                logger.error(f"❌ Whisper API Error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"Whisper API error: {response.status_code}",
                    "error_detail": response.text,
                    "processing_time_ms": processing_time_ms
                }
                
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Whisper API request timed out",
                "processing_time_ms": int((time.time() - start_time) * 1000)
            }
        except Exception as e:
            logger.error(f"❌ Transcription error: {str(e)}")
            return {
                "success": False,
                "error": f"Transcription failed: {str(e)}",
                "processing_time_ms": int((time.time() - start_time) * 1000)
            }
        finally:
            # Clean up temp file
            if temp_file_path and Path(temp_file_path).exists():
                try:
                    Path(temp_file_path).unlink()
                except Exception as e:
                    logger.warning(f"Failed to delete temp file: {e}")
    
    def call_generate_sql_api(self, input_text: str, execute: bool = True) -> Dict[str, Any]:
        """
        Call your existing /generate-sql endpoint using requests
        """
        start_time = time.time()
        
        try:
            logger.info(f"🔄 Calling SQL API for: '{input_text}'")
            
            response = requests.post(
                f"{self.base_url}/generate-sql",
                json={"input_text": input_text, "execute": execute},
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                result = response.json()
                result["internal_processing_time_ms"] = processing_time_ms
                logger.info(f"✅ SQL generation successful ({processing_time_ms}ms)")
                return result
            else:
                logger.error(f"❌ SQL API Error: {response.status_code}")
                return {
                    "input_text": input_text,
                    "generated_sql": "",
                    "sql_type": "ERROR",
                    "executed": False,
                    "result": None,
                    "error": f"SQL API failed: {response.status_code}",
                    "user_friendly_message": "❌ Failed to process your request",
                    "formatted_data": {},
                    "internal_processing_time_ms": processing_time_ms
                }
                
        except requests.exceptions.Timeout:
            return {
                "input_text": input_text,
                "generated_sql": "",
                "sql_type": "ERROR",
                "executed": False,
                "result": None,
                "error": "SQL API request timed out",
                "user_friendly_message": "❌ Request timed out",
                "formatted_data": {},
                "internal_processing_time_ms": int((time.time() - start_time) * 1000)
            }
        except Exception as e:
            logger.error(f"❌ SQL API error: {str(e)}")
            return {
                "input_text": input_text,
                "generated_sql": "",
                "sql_type": "ERROR",
                "executed": False,
                "result": None,
                "error": f"Internal error: {str(e)}",
                "user_friendly_message": f"❌ System error: {str(e)}",
                "formatted_data": {},
                "internal_processing_time_ms": int((time.time() - start_time) * 1000)
            }
    
    async def process_speech_to_sql(self, audio_file: UploadFile, execute: bool = True, language: str = "en") -> Dict[str, Any]:
        """
        Complete speech-to-SQL pipeline using the working method
        """
        overall_start_time = time.time()
        
        try:
            logger.info(f"🎤 Processing speech-to-SQL: {audio_file.filename}")
            
            # Step 1: Transcribe audio
            whisper_result = await self.transcribe_with_whisper(audio_file, language)
            
            if not whisper_result["success"]:
                return {
                    "success": False,
                    "transcribed_text": "",
                    "sql_response": {
                        "input_text": "",
                        "generated_sql": "",
                        "sql_type": "ERROR",
                        "executed": False,
                        "result": None,
                        "error": "Speech recognition failed",
                        "user_friendly_message": f"❌ {whisper_result['error']}",
                        "formatted_data": {}
                    },
                    "processing_time": {
                        "whisper_ms": whisper_result["processing_time_ms"],
                        "sql_generation_ms": 0,
                        "total_ms": int((time.time() - overall_start_time) * 1000)
                    },
                    "error": whisper_result["error"]
                }
            
            transcribed_text = whisper_result["text"]
            whisper_time_ms = whisper_result["processing_time_ms"]
            
            # Validate transcription
            if not transcribed_text or len(transcribed_text.strip()) < 3:
                return {
                    "success": False,
                    "transcribed_text": transcribed_text,
                    "sql_response": {
                        "input_text": transcribed_text,
                        "generated_sql": "",
                        "sql_type": "ERROR",
                        "executed": False,
                        "result": None,
                        "error": "Transcription too short",
                        "user_friendly_message": "❌ Please speak more clearly and try again",
                        "formatted_data": {}
                    },
                    "processing_time": {
                        "whisper_ms": whisper_time_ms,
                        "sql_generation_ms": 0,
                        "total_ms": int((time.time() - overall_start_time) * 1000)
                    }
                }
            
            # Step 2: Generate SQL
            logger.info(f"🔄 Generating SQL for: '{transcribed_text}'")
            sql_response = self.call_generate_sql_api(transcribed_text, execute)
            sql_time_ms = sql_response.pop("internal_processing_time_ms", 0)
            
            total_time_ms = int((time.time() - overall_start_time) * 1000)
            
            success = sql_response.get("sql_type") != "ERROR"
            
            logger.info(f"✅ Speech-to-SQL complete: {success} ({total_time_ms}ms)")
            
            return {
                "success": success,
                "transcribed_text": transcribed_text,
                "sql_response": sql_response,
                "processing_time": {
                    "whisper_ms": whisper_time_ms,
                    "sql_generation_ms": sql_time_ms,
                    "total_ms": total_time_ms
                },
                "audio_info": {
                    "filename": audio_file.filename,
                    "size_bytes": audio_file.size or 0
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Processing error: {str(e)}")
            return {
                "success": False,
                "transcribed_text": "",
                "sql_response": {
                    "input_text": "",
                    "generated_sql": "",
                    "sql_type": "ERROR",
                    "executed": False,
                    "result": None,
                    "error": str(e),
                    "user_friendly_message": f"❌ Something went wrong: {str(e)}",
                    "formatted_data": {}
                },
                "processing_time": {
                    "whisper_ms": 0,
                    "sql_generation_ms": 0,
                    "total_ms": int((time.time() - overall_start_time) * 1000)
                },
                "error": str(e)
            }

# Simple utility functions
async def speech_to_sql_simple(audio_file: UploadFile, execute: bool = True) -> Dict[str, Any]:
    """Simple function to use the working speech-to-SQL service"""
    service = WorkingSpeechToSQLService()
    return await service.process_speech_to_sql(audio_file, execute)

# Add this to your main.py to create the working endpoint
"""
# Add these imports to your main.py
from speech_service_requests import WorkingSpeechToSQLService, speech_to_sql_simple
from fastapi import File, UploadFile, Form

# Initialize the working service
working_speech_service = WorkingSpeechToSQLService()

@app.post("/speech-to-sql")
async def speech_to_sql_endpoint(
    audio: UploadFile = File(..., description="Audio file"),
    execute: bool = Form(True, description="Execute the SQL"),
    language: str = Form("en", description="Language code")
):
    \"\"\"Working speech-to-SQL endpoint using requests library\"\"\"
    result = await working_speech_service.process_speech_to_sql(
        audio_file=audio,
        execute=execute,
        language=language
    )
    return result

@app.post("/transcribe-only")
async def transcribe_only_endpoint(
    audio: UploadFile = File(...),
    language: str = Form("en")
):
    \"\"\"Transcribe audio to text only\"\"\"
    result = await working_speech_service.transcribe_with_whisper(audio, language)
    return result
"""