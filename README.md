# Ghostwriter

An AI-powered content generation tool. Pick a content type, fill in a short
brief, and get structured, editable output you can copy or export.

Supports four content types out of the box:

| Type | Inputs | Output |
|------|--------|--------|
| **Blog Post** | topic, audience, word count, tone, SEO focus, expertise level | structured article with title, intro, sections, conclusion |
| **Email** | purpose, recipient context, key points, tone, urgency, CTA | subject line + body |
| **Story** | genre, characters, setting, length, style, audience, mood | short story with a narrative arc |
| **Social Media** | product, platform (X / LinkedIn / Instagram / Facebook / TikTok / Threads), goal, tone, CTA | platform-tuned posts + hashtags |

Output is fully editable in-browser and can be exported as **Copy**, **TXT**, **MD**, or **PDF**.

---

## Stack

- **Frontend:** React + Vite, `jspdf` for PDF export
- **Backend:** Node.js + Express, `zod` for validation, OpenAI SDK
- **Containerization:** Docker + docker-compose (nginx serving the built frontend, reverse-proxying `/api`)
- **Testing:** Vitest + Supertest (backend), Vitest + React Testing Library (frontend)

---

## Prerequisites

- **Node.js 20+** (`node --version`)
- **npm 10+** (`npm --version`)
- **Docker Desktop** (or Docker Engine + Compose plugin) — only required for the containerized workflow
- **OpenAI API key** with credit — https://platform.openai.com/api-keys

> ⚠️ OpenAI requires a positive credit balance on the account. A valid key alone
> is not enough; you'll get `429 credit_balance_exhausted` otherwise.
> Add credit at https://platform.openai.com/settings/organization/billing.

---

## Project structure
```text
ghostwriter/
├── client/ # React + Vite frontend
│ ├── src/
│ │ ├── components/
│ │ │ ├── ContentForm.jsx
│ │ │ ├── OutputEditor.jsx
│ │ │ └── ExportBar.jsx
│ │ ├── api/
│ │ │ └── generate.js
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── tests/
│ ├── nginx.conf # SPA fallback + /api proxy (prod)
│ ├── Dockerfile
│ └── package.json
├── server/ # Node.js + Express backend
│ ├── src/
│ │ └── index.js
│ ├── routes/
│ │ └── generate.js
│ ├── schemas/
│ │ └── contentSchema.js # zod discriminated union
│ ├── prompts/
│ │ └── templates.js # per-type prompt builders
│ ├── services/
│ │ ├── aiService.js # OpenAI call + error normalization
│ │ └── postProcess.js # warnings + cleanup
│ ├── tests/
│ ├── Dockerfile
│ └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Configuration

The backend reads four environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` (Docker) / `5001` (local) | HTTP port the Express server binds to |
| `OPENAI_API_KEY` | — | Your OpenAI key (required) |
| `AI_MODEL` | `gpt-4o-mini` | OpenAI model to call |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS origin allowed to hit the API |

### Local dev config

Copy the example and fill in your key:

```bash
cp server/.env.example server/.env
# edit server/.env and set OPENAI_API_KEY=sk-...
Docker config
Compose reads from a .env at the repo root:

bash
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...
Both .env files are gitignored. Never commit them.

Running locally (development)
Two terminals.

Terminal 1 — backend:

bash
cd server
npm install
npm run dev
# → Ghostwriter API on :5001
Terminal 2 — frontend:

bash
cd client
npm install
npm run dev
# → Local: http://localhost:5173
Open http://localhost:5173. Vite proxies /api/* to http://localhost:5001.

On macOS, port 5000 is reserved by AirPlay Receiver (Control Center). The
local dev server uses 5001 to avoid the conflict.

Running with Docker (production-like)
bash
# 1. Make sure the root .env exists with your key
cp .env.example .env
nano .env

# 2. Build and start
docker compose up --build

# 3. Open the app
open http://localhost:8080
What you get:

client container: nginx serving the built React bundle on host port 8080

server container: Express API on host port 5001 (mapped to container port 5000)

nginx inside the client container reverse-proxies /api/* to server:5000
over the Docker network

Stop the stack:

bash
docker compose down
Do not run local dev and Docker at the same time — both bind port 5001. Stop one before starting the other.

API
Single endpoint: POST /api/generate

Request body varies by contentType. All four content types use a discriminated
union, so Zod validates the exact field set for the type you send.

Blog
bash
curl -s -X POST http://localhost:5001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "blog",
    "topic": "Remote work productivity",
    "audience": "developers",
    "wordCount": 400,
    "tone": "casual",
    "seoFocus": "deep work, focus",
    "expertiseLevel": "intermediate"
  }'
Email
bash
curl -s -X POST http://localhost:5001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "email",
    "purpose": "reschedule a meeting",
    "recipientContext": "a busy client in a different timezone",
    "keyPoints": "apologize, offer two new slots, confirm availability",
    "tone": "professional",
    "urgency": "normal",
    "cta": "reply with your preferred slot"
  }'
Story
bash
curl -s -X POST http://localhost:5001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "story",
    "genre": "fantasy",
    "characters": "a lonely dragon, a curious librarian",
    "setting": "a floating library at dusk",
    "length": "short",
    "style": "poetic",
    "audience": "children",
    "mood": "whimsical"
  }'
Social
bash
curl -s -X POST http://localhost:5001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "social",
    "product": "a productivity app for writers",
    "platform": "linkedin",
    "goal": "awareness",
    "tone": "professional",
    "cta": "try it free"
  }'
Response
Success:

json
{
  "text": "...generated content...",
  "warnings": [],
  "contentType": "blog"
}
Validation failure:

json
{
  "error": "Validation failed",
  "details": {
    "topic": ["Required"],
    "audience": ["Required"]
  }
}
Provider failure:

json
{
  "error": "OpenAI account has no credits. Add billing at platform.openai.com.",
  "code": "credit_balance_exhausted"
}
Health check
bash
curl http://localhost:5001/health
# {"ok":true}
Testing
Backend
bash
cd server
npm test
11 tests: discriminated-union validation per content type, happy paths,
post-processing warnings, and provider error mapping. Uses Vitest + Supertest;
the OpenAI call is mocked, so no API key or network access is required.

Frontend
bash
cd client
npm test
13 tests: content-type field swapping, payload shape, loading state,
error banner, warnings rendering, export visibility. Uses Vitest + React
Testing Library; requestGeneration is mocked.

Watch mode
Both suites support npm run test:watch for iterative development.

Environment and secrets
server/.env and .env at the root are gitignored

server/.env.example and .env.example are committed as templates

The OpenAI key is passed to the server container at runtime via Compose,
not baked into any image layer

Verify with:

bash
docker compose exec server sh -c 'echo "${OPENAI_API_KEY:0:12}…"'
# prints the first 12 chars only
Verify the image contains no key material:

bash
docker save ghostwriter-server | strings | grep -E 'sk-[A-Za-z0-9_-]{20,}'
# expect: no output
Common issues
Symptom	Cause	Fix
EADDRINUSE :::5001	Something already on port 5001	lsof -ti :5001 | xargs kill
429 credit_balance_exhausted	OpenAI account has no credit	Add credit at platform.openai.com
401 invalid_api_key	Key wrong or revoked	Regenerate at platform.openai.com and re-paste in .env
502 Bad Gateway from nginx	Backend container not running	docker compose logs server
Browser shows Failed to fetch in dev	Vite proxy misconfigured	Confirm client/vite.config.js targets :5001
404 on refresh at /some/route	nginx SPA fallback missing	try_files $uri /index.html; in client/nginx.conf
Docker changes not picked up	Env changes need a container recreate, not just restart	docker compose up -d --force-recreate server
Design decisions
Discriminated union in Zod rather than one flat schema — each content
type validates against only its own fields, so invalid combinations are
rejected before hitting the AI.

Per-type prompt builders in server/prompts/templates.js — keeps prompt
engineering next to the data it depends on.

Type-aware post-processing in server/services/postProcess.js — warns
when, e.g., an email lacks a Subject: line or a social post has no
hashtags.

Port 5001 for local dev — macOS's Control Center owns 5000.

nginx reverse proxy in prod — the React app is served as static files
and same-origin /api/* calls are proxied to the backend, avoiding CORS
entirely in production.

Costs
OpenAI charges per token. gpt-4o-mini is inexpensive but not free. Set a
monthly budget cap in your OpenAI dashboard at
https://platform.openai.com/settings/organization/limits to prevent
unexpected spend.

Typical cost for a short blog post with gpt-4o-mini: well under $0.01.

License
MIT — see LICENSE if present, otherwise treat as MIT.
