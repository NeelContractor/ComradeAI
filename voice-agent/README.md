# Comrade AI — Voice Agent

Separate Python process powering the `/talk` voice calls. It connects to your
LiveKit Cloud project and auto-joins rooms created by the Next.js app.

## Architecture

```
/talk (browser) ──► LiveKit Cloud ◄── voice-agent (this dir)
      │                   │
      └──── /api/livekit/token (creates room + issues token)
```

When the app creates a room, the token route writes room metadata:
```json
{ "speaker": "priya", "user_name": "Neel", "user_life_journey": "..." }
```

The agent reads that metadata, picks the Groq Orpheus TTS voice, and runs:
`user speech -> Groq STT -> Groq LLM -> Groq TTS -> user hears`.

The whole pipeline runs on **Groq's free tier** using `GROQ_API_KEY` — no paid
Sarvam account needed. The character voice ids in the metadata are Sarvam ids;
`main.py` maps them to Orpheus voices before handing them to the TTS plugin.

## Setup

```bash
cd voice-agent
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

cp .env.example .env
# fill LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET (same as app .env)
# fill GROQ_API_KEY (same key as the app's root .env, or create one at https://console.groq.com/keys)
```

> `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` must **exactly match**
> the values in the project root `.env`.

### One-time: accept the Orpheus TTS terms

If TTS fails with `model_terms_required` (HTTP 400), open the following while
logged in, accept the terms, then restart the agent:

[https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english](https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english)

## Run

```bash
# Terminal 1 — Next.js app
bun dev

# Terminal 2 — voice agent (hot-reload dev mode)
.venv/bin/python main.py dev
```

Test locally without LiveKit (terminal audio):
```bash
.venv/bin/python main.py console
```

## Characters & voices

`src/lib/characters.ts` stores a Sarvam voice id per persona; `main.py` maps it
to a Groq Orpheus voice (`canopylabs/orpheus-v1-english`):

| Character | Voice id (in app) | Groq Orpheus voice |
|-----------|-------------------|--------------------|
| Abhimanyu | amit              | austin             |
| Arjuna    | aditya            | daniel             |
| Mira      | priya             | autumn             |
| Gargi     | ishita            | diana              |
| Karna     | rohan             | troy               |
| Kavya     | kavya             | hannah             |

## Env vars

| Variable | Required | Description |
|----------|----------|-------------|
| `LIVEKIT_URL` | yes | LiveKit Cloud WSS URL |
| `LIVEKIT_API_KEY` | yes | LiveKit API key |
| `LIVEKIT_API_SECRET` | yes | LiveKit API secret |
| `GROQ_API_KEY` | yes | Groq key (STT/LLM/TTS) |