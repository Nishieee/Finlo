#!/usr/bin/env python3
"""
Fixed Whisper API Test Script
Handles SSL issues and provides better error debugging
"""

import os
import sys
import asyncio
import tempfile
import httpx
from pathlib import Path
import time
import ssl

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️  python-dotenv not installed. Make sure OPENAI_API_KEY is set as environment variable.")

def check_environment():
    """Check if OpenAI API key is available"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY not found in environment variables")
        print("📝 Please set your OpenAI API key:")
        print("   export OPENAI_API_KEY='your-api-key-here'")
        print("   OR add it to your .env file")
        return False
    
    print(f"✅ OpenAI API Key found: {api_key[:10]}...{api_key[-4:]}")
    return True

async def test_whisper_api_with_requests(audio_file_path: str):
    """Test using requests library as fallback"""
    try:
        import requests
        
        api_key = os.getenv("OPENAI_API_KEY")
        print("🔄 Trying with requests library (fallback method)...")
        
        with open(audio_file_path, 'rb') as audio_file:
            files = {
                'file': (Path(audio_file_path).name, audio_file, 'audio/mpeg')
            }
            data = {
                'model': 'whisper-1',
                'language': 'en',
                'response_format': 'json'
            }
            headers = {
                'Authorization': f'Bearer {api_key}'
            }
            
            print("📤 Sending request via requests library...")
            response = requests.post(
                'https://api.openai.com/v1/audio/transcriptions',
                files=files,
                data=data,
                headers=headers,
                timeout=60
            )
        
        if response.status_code == 200:
            result = response.json()
            transcribed_text = result.get('text', '').strip()
            
            print(f"✅ SUCCESS with requests library!")
            print(f"📝 Transcribed text: '{transcribed_text}'")
            return True, transcribed_text
        else:
            print(f"❌ Requests failed: {response.status_code} - {response.text}")
            return False, None
            
    except ImportError:
        print("❌ requests library not available")
        return False, None
    except Exception as e:
        print(f"❌ Requests error: {str(e)}")
        return False, None

async def test_whisper_api_httpx_no_verify(audio_file_path: str):
    """Test with SSL verification disabled"""
    
    api_key = os.getenv("OPENAI_API_KEY")
    
    try:
        print("🔄 Trying httpx without SSL verification...")
        start_time = time.time()
        
        # Create SSL context that doesn't verify certificates
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        async with httpx.AsyncClient(
            timeout=60.0,
            verify=False  # Disable SSL verification
        ) as client:
            with open(audio_file_path, 'rb') as audio_file:
                files = {
                    'file': (Path(audio_file_path).name, audio_file, 'audio/mpeg')
                }
                data = {
                    'model': 'whisper-1',
                    'language': 'en',
                    'response_format': 'json'
                }
                headers = {
                    'Authorization': f'Bearer {api_key}'
                }
                
                print("📤 Sending request without SSL verification...")
                response = await client.post(
                    'https://api.openai.com/v1/audio/transcriptions',
                    files=files,
                    data=data,
                    headers=headers
                )
        
        processing_time = time.time() - start_time
        print(f"⏱️  Processing time: {processing_time:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            transcribed_text = result.get('text', '').strip()
            
            print(f"✅ SUCCESS with SSL verification disabled!")
            print(f"📝 Transcribed text: '{transcribed_text}'")
            return True, transcribed_text
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ HTTPX no-verify error: {str(e)}")
        return False, None

async def test_whisper_api_curl_fallback(audio_file_path: str):
    """Test using curl command as ultimate fallback"""
    try:
        import subprocess
        
        api_key = os.getenv("OPENAI_API_KEY")
        print("🔄 Trying with curl command (ultimate fallback)...")
        
        # Construct curl command
        curl_cmd = [
            'curl',
            '-X', 'POST',
            'https://api.openai.com/v1/audio/transcriptions',
            '-H', f'Authorization: Bearer {api_key}',
            '-H', 'Content-Type: multipart/form-data',
            '-F', f'file=@{audio_file_path}',
            '-F', 'model=whisper-1',
            '-F', 'language=en',
            '-F', 'response_format=json'
        ]
        
        print("📤 Running curl command...")
        result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            try:
                import json
                response_data = json.loads(result.stdout)
                transcribed_text = response_data.get('text', '').strip()
                
                print(f"✅ SUCCESS with curl!")
                print(f"📝 Transcribed text: '{transcribed_text}'")
                return True, transcribed_text
            except json.JSONDecodeError:
                print(f"❌ Curl succeeded but response not JSON: {result.stdout}")
                return False, None
        else:
            print(f"❌ Curl failed: {result.stderr}")
            return False, None
            
    except subprocess.TimeoutExpired:
        print("❌ Curl command timed out")
        return False, None
    except FileNotFoundError:
        print("❌ curl command not found on system")
        return False, None
    except Exception as e:
        print(f"❌ Curl error: {str(e)}")
        return False, None

async def test_whisper_api_comprehensive(audio_file_path: str):
    """Try multiple methods to test Whisper API"""
    
    if not Path(audio_file_path).exists():
        print(f"❌ Audio file not found: {audio_file_path}")
        return False
    
    file_size = Path(audio_file_path).stat().st_size
    print(f"📊 File size: {file_size} bytes ({file_size/1024:.1f} KB)")
    
    # Method 1: Try requests library first (most reliable)
    success, transcription = await test_whisper_api_with_requests(audio_file_path)
    if success:
        return True
    
    print("\n" + "-" * 40)
    
    # Method 2: Try httpx without SSL verification
    success, transcription = await test_whisper_api_httpx_no_verify(audio_file_path)
    if success:
        return True
    
    print("\n" + "-" * 40)
    
    # Method 3: Try curl as ultimate fallback
    success, transcription = await test_whisper_api_curl_fallback(audio_file_path)
    if success:
        return True
    
    return False

def install_missing_packages():
    """Install missing packages if needed"""
    try:
        import requests
        print("✅ requests library available")
    except ImportError:
        print("📦 Installing requests library...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
        print("✅ requests installed successfully")

async def main():
    """Main test function with comprehensive error handling"""
    print("🎤 Fixed OpenAI Whisper API Test Script")
    print("=" * 50)
    
    # Check environment
    if not check_environment():
        return
    
    # Install missing packages
    try:
        install_missing_packages()
    except Exception as e:
        print(f"⚠️  Could not install requests: {e}")
    
    # Get audio file path
    if len(sys.argv) > 1:
        audio_file_path = sys.argv[1]
        print(f"📁 Using provided file: {audio_file_path}")
    else:
        audio_file_path = input("Enter path to your audio file: ").strip()
        if audio_file_path.startswith('"') and audio_file_path.endswith('"'):
            audio_file_path = audio_file_path[1:-1]  # Remove quotes
    
    print(f"\n🎤 Testing Whisper API with: {audio_file_path}")
    
    # Run comprehensive test
    success = await test_whisper_api_comprehensive(audio_file_path)
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 WHISPER API TEST PASSED!")
        print("✅ At least one method worked - you can use speech-to-SQL functionality")
        print("\n💡 Recommendation:")
        print("   Use the method that worked in your production code")
    else:
        print("💥 ALL METHODS FAILED!")
        print("❌ Possible issues:")
        print("   1. Invalid API key")
        print("   2. Network/firewall issues")
        print("   3. Audio file format problems")
        print("   4. OpenAI API service issues")
        print("\n🔧 Troubleshooting:")
        print("   1. Verify your API key at https://platform.openai.com/api-keys")
        print("   2. Check your internet connection")
        print("   3. Try a different audio file (MP3, WAV)")
        print("   4. Check OpenAI API status")

def quick_test(file_path: str):
    """Quick test function"""
    print(f"🎤 Quick Whisper Test with: {file_path}")
    
    if not check_environment():
        return
    
    try:
        install_missing_packages()
    except:
        pass
    
    # Run the test
    result = asyncio.run(test_whisper_api_comprehensive(file_path))
    
    if result:
        print("🎉 SUCCESS! Whisper API is working!")
    else:
        print("💥 FAILED! Try troubleshooting steps above.")

if __name__ == "__main__":
    print("🚀 Starting Fixed Whisper API Test...")
    
    # Check if file path provided as command line argument
    if len(sys.argv) > 1:
        audio_file_path = sys.argv[1]
        quick_test(audio_file_path)
    else:
        # Interactive mode
        try:
            asyncio.run(main())
        except KeyboardInterrupt:
            print("\n⏹️  Test cancelled by user")
        except Exception as e:
            print(f"\n💥 Unexpected error: {e}")
    
    print("\n👋 Test complete!")