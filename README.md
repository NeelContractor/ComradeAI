# Comrade AI

The friend who listens, understands, and remembers.

Comrade AI is an AI journaling companion that learns from your writing and provides personalized emotional support through intelligent journaling, voice conversations, text chat, and emotional insights.

## Features

### Intelligent Journaling (`/write`)
Rich markdown editor (Milkdown) with auto-save, mood tagging, and a searchable archive. Journal entries are semantically indexed via SuperMemory so the AI understands your history and emotional patterns over time.

### Voice Conversations (`/talk`)
Real-time voice calls powered by LiveKit. Choose from multiple AI speaker personas (Abhimanyu, Arjuna, Mira, Gargi, Karna, Kavya). A separate Python agent (`voice-agent/`) runs the speech pipeline entirely on Groq's free tier — no paid speech provider needed. Includes a per-user quota system (5 minutes free).

### AskComrade Chat (`/chat`)
Text-based conversations backed by memory-aware context (Groq `openai/gpt-oss-120b`). The AI recalls relevant journal entries and your profile to provide personalized responses. Conversations are persisted with auto-generated titles.

### Mind Graph (`/mind`)
Visual knowledge graph of your memories and emotional patterns using SuperMemory's memory graph component.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| API | tRPC 11 with React Query |
| Database | PostgreSQL (Neon serverless) + Drizzle ORM |
| Auth | Clerk (custom flows + bot sign-up protection) |
| LLM | Groq (`openai/gpt-oss-120b`) |
| Memory | SuperMemory (semantic storage & retrieval) |
| Voice | LiveKit Cloud + `voice-agent/` (Groq STT `whisper-large-v3-turbo`, LLM `gpt-oss-120b`, TTS Orpheus) |
| Editor | Milkdown (markdown) |
| Payments | Dodo Payments |
| Styling | Tailwind CSS 4, shadcn/ui |

## Prerequisites

- [Bun](https://bun.sh) runtime
- [Python 3.10+](https://www.python.org) (only for the voice agent)
- PostgreSQL database (recommended: [Neon](https://neon.tech))
- Account keys for Clerk, Groq, SuperMemory, and LiveKit

## Getting Started

1. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd comrade-ai
bun install
```

2. Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/chat` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/onboarding` |
| `CLERK_SECRET_KEY` | Clerk backend key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret (only needed if you deliver webhooks) |
| `SUPERMEMORY_API_KEY` | SuperMemory API key |
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | Groq API key (chat + voice) |
| `CRON_SECRET` | Secret for cron job endpoints |
| `LIVEKIT_URL` | LiveKit Cloud WSS URL |
| `LIVEKIT_API_KEY` | LiveKit API key |
| `LIVEKIT_API_SECRET` | LiveKit API secret |
| `FEEDBACK_WEBHOOK_URL` | Discord feedback webhook URL |
| `DODO_PAYMENTS_API_KEY` | DODO Payments API key |
| `DODO_PAYMENTS_WEBHOOK_KEY` | DODO Payments webhook key |
| `DODO_PAYMENTS_RETURN_URL` | `http://localhost:3000` |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` or `development` |

3. Push the database schema:

```bash
bun run db:push
```

4. Start the dev server:

```bash
bun dev
```

The app will be available at `http://localhost:3000`.

## Voice Agent

The `/talk` feature requires a separate Python worker that joins LiveKit rooms and runs the speech pipeline. See [`voice-agent/README.md`](voice-agent/README.md) for full setup and the character → voice mapping.

Quick start:

```bash
bun run voice:setup            # create venv + install deps
# fill voice-agent/.env (LIVEKIT_* — must match root .env — and GROQ_API_KEY)
bun run voice:dev              # run the agent in hot-reload dev mode
```

Run everything together: `bun run dev:all` (Next.js + voice agent via concurrently).

> One-time setup: Groq's Orpheus TTS requires accepting the model terms at
> `https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english`
> while logged in, otherwise TTS fails with `model_terms_required`.

## Scripts

```bash
bun dev                    # Start dev server (Next.js + Turbo)
bun run build              # Production build
bun run start              # Serve production build
bun run typecheck          # tsc --noEmit
bun run test               # Vitest
bun run db:push            # Push schema to database
bun run db:studio          # Drizzle Studio
bun run db:generate        # Generate migration
bun run db:migrate         # Run migrations
bun run voice:setup        # Set up the voice agent venv
bun run voice:dev          # Run the voice agent (dev mode)
bun run voice:console      # Run the voice agent in console mode
bun run dev:all            # Run Next.js + voice agent together
```

## License

Private.