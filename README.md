#### BUILD AN APP #### 

an AI powered assistant that takes a USERINPUT which could be: 
1. Recorded Audio (via an in app or on device record-no feature OR upload audio file)
2. 2. Manual text entry (via in-app text input OR file upload .txt .doc .docx, etc. 

 
## for the audio transcription use Open AI Whisper 


### WHISPER: 

Endpoint: https://api.openai.com/v1/audio/transcriptions

Required Headers:
Authorization: Bearer YOUR_API_KEY
Content-Type: multipart/form-data

Minimum Required Key-Value Pairs:
file: your_audio_file
model: whisper-1

Optional Parameters:
response_format: text
language: en


2. with the USERINPUT, pass it on to ChatGPT-4o along with a system message that says "Please convert the user input into a consise "Meeting Agenda""

### CHAT GPT-4o 
Endpoint: https://api.openai.com/v1/chat/completions

Required Headers:
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
Minimum Required Key-Value Pairs:

model: gpt-4o
messages: [
    {role: system, content: your_system_prompt},
    {role: user, content: your_text}
]



### Display the content to user and allow them to download in Word Doc


# Requirements
- EXTREMLY MOBILE FIRST OPTIMIZED Layout 
- BUT ALSO WEB / COMPUTER OPTIMIZED Layout 
