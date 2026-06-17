<div align="center">

<img src="https://img.shields.io/badge/EVENITE-v2.5-6C63FF?style=for-the-badge&logoColor=white" alt="EVENITE v2.5" />

# EVENITE — Student Event Management System

**An AI-powered, centralised campus event platform with generative viral marketing, gamification, and real-time engagement.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.0-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![Deployed on Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render)](https://evenite.onrender.com)

[🌐 Live Demo](https://evenite.onrender.com) · [📖 API Docs](#api-routes) · [🧠 GenLoop AI](#genloop--generative-viral-loop-system) · [🎮 Gamification](#gamification-system)

</div>

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [GenLoop — Generative Viral Loop System](#genloop--generative-viral-loop-system)
- [Gamification System](#gamification-system)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [ML Classifiers](#ml-classifiers)
- [Real-Time Features](#real-time-features)
- [Authentication & Security](#authentication--security)
- [Frontend Pages & Dashboards](#frontend-pages--dashboards)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Project Statistics](#project-statistics)

---

## Overview

EVENITE is a full-scale, centralised AI-powered event management system built for college campuses. It connects students, event hosts, and administrators on a single platform — enabling event discovery, registration, attendance, peer networking, gamification, and AI-driven viral marketing.

The system features a **five-tier architecture**: a React 18 frontend, a Node.js/Express backend, a dedicated Python FastAPI AI microservice, MongoDB Atlas for data persistence, and Cloudinary for media storage.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React 18)                        │
│  Student Dashboard │ Host Dashboard │ Admin Panel │ Public Pages │
│  Render — https://evenite.onrender.com                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / REST / WebSocket
┌──────────────────────────▼──────────────────────────────────────┐
│                   BACKEND (Node.js / Express)                   │
│  26 Route Modules │ 9 Services │ 14 ML Scripts │ Socket.IO      │
│  Render — https://evenite.onrender.com                          │
└──────┬──────────────────────┬──────────────────┬───────────────┘
       │ Mongoose ODM         │ HTTP (axios)      │ Cloudinary SDK
┌──────▼──────────┐  ┌────────▼──────────────────┐ ┌────────────┐
│  MongoDB Atlas  │  │ Python FastAPI             │ │ Cloudinary │
│  24 Collections │  │ AI Microservice            │ │ CDN        │
│  Geospatial     │  │ GenLoop v2.0 — port 8000   │ │ Images     │
│  Index          │  │ SQLite + UCB1 + Gradient   │ │ Banners    │
└─────────────────┘  │ Descent + HF SDXL          │ │ Documents  │
                     └───────────────────────────┘ └────────────┘
```

| Tier | Technology | Deployment |
|------|-----------|------------|
| Frontend | React 18 (CRA), React Router v6, Framer Motion, Recharts, Leaflet, Socket.IO Client | Render |
| Backend | Node.js 18, Express 4, Mongoose 7, Socket.IO 4, node-cron | Render |
| AI Microservice | Python 3.11, FastAPI 2.0, SQLite (WAL mode), httpx | Render (port 8000) |
| Database | MongoDB Atlas (Mongoose ODM) | MongoDB Atlas Cloud |
| Media Storage | Cloudinary (images, banners, documents) | Cloudinary CDN |

---

## Tech Stack

### Backend (`server/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | HTTP server framework |
| mongoose | ^7.8.7 | MongoDB ODM |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| bcrypt / bcryptjs | ^6.0.0 / ^2.4.3 | Password hashing |
| socket.io | ^4.8.3 | Real-time WebSocket |
| node-cron | ^4.2.1 | Scheduled jobs (feedback loop) |
| nodemailer | ^7.0.5 | Email OTP / password reset |
| twilio | ^5.10.3 | SMS OTP verification |
| cloudinary | ^1.41.3 | Image/document CDN |
| multer | ^1.4.5-lts.1 | File upload middleware |
| sharp | ^0.34.5 | Server-side image processing |
| pdfkit | ^0.13.0 | Certificate PDF generation |
| qrcode | ^1.5.4 | QR code generation for tickets |
| axios | ^1.13.5 | HTTP client (AI service proxy) |
| @google/generative-ai | ^0.18.0 | Gemini AI integration |
| exceljs | ^4.4.0 | XLSX attendance export/import |
| zod | ^4.3.6 | Schema validation |
| helmet | ^8.1.0 | HTTP security headers |
| express-rate-limit | ^8.2.1 | API rate limiting |
| uuid | ^13.0.0 | Unique ID generation |

### Frontend (`client/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| react / react-dom | ^18.2.0 | UI framework |
| react-router-dom | ^6.28.0 | Client-side routing |
| framer-motion | ^12.29.2 | Animations and transitions |
| recharts | ^3.3.0 | Analytics charts |
| leaflet / react-leaflet | ^1.9.4 / ^4.2.1 | Interactive event maps |
| socket.io-client | ^4.8.3 | Real-time updates |
| firebase | ^12.1.0 | Google OAuth |
| @tanstack/react-query | ^5.90.21 | Server state management |
| axios | ^1.11.0 | HTTP client |
| lucide-react | ^0.539.0 | Icon library |
| react-toastify | ^11.0.5 | Toast notifications |
| tesseract.js | ^4.0.2 | OCR for student ID verification |
| html5-qrcode | ^2.3.8 | QR code scanner |
| emoji-picker-react | ^4.17.3 | Chat emoji picker |
| jwt-decode | ^4.0.0 | JWT token parsing |

### AI Microservice (`ai_service/requirements.txt`)

| Package | Purpose |
|---------|---------|
| fastapi | ASGI web framework |
| uvicorn | ASGI server |
| httpx | Async HTTP client (Groq API) |
| Pillow | Image generation and text overlay |
| pydantic | Request/response validation |
| python-multipart | File upload support |

---

## Key Features

### For Students

- **Event Discovery** — Browse, NLP smart search, filter by category/date/location
- **AI Recommendations** — Personalised "For You" feed based on onboarding + attendance history
- **Geolocation** — Map view and "Near Me" using browser geolocation + MongoDB 2dsphere index
- **Registration** — One-click, team registration, waitlist, and QR ticket generation
- **Gamification** — 8-tier PUBG-style evolution system with skill XP and seasonal leaderboards
- **Social** — Squads (friend teams), Circles (interest groups), KNN friend suggestions, P2P chat
- **Memories** — Post-event photo/text memories with likes and comments
- **Goals** — Bucket list goals for skill development across categories
- **Certificates** — Digital participation certificates with public verification QR links
- **Live Engagement** — Real-time moderated Q&A and interactive polls during events
- **AI Support Chatbot** — With frustration detection and human escalation

### For Hosts

- **Event Management** — Full CRUD with 9 event templates, co-host support, and media gallery
- **GenLoop AI Studio** — Generate, A/B test, and optimise viral marketing content
- **Smart Analytics** — Impression deduplication (SHA-256), funnel analysis, engagement tracking
- **Attendance System** — QR scanner, manual marking, and XLSX registration management
- **Certificate Editor** — Custom template designer and bulk issuance
- **Live Panel** — Real-time control center for event Q&A and polls
- **AI Insights** — Automated sentiment analysis and AI-generated performance advice
- **AI Marketing Copywriter** — Social media copy for Twitter, Instagram, and LinkedIn

### For Admins

- **Platform Metrics** — Users, events, revenue, registrations at a glance
- **Host Management** — Approve/reject host applications, edit/delete hosts
- **Student Verification** — Review student ID uploads with OCR-extracted data
- **Fraud Detection** — Review and manage fraud logs
- **Financials** — Transaction ledger, host earnings, payout recording
- **Live Traffic** — Real-time active users and click heatmap via Socket.IO
- **Support Hub** — Manage escalated AI chatbot tickets
- **Notifications** — Broadcast system notifications to all students/hosts

---

## GenLoop — Generative Viral Loop System

GenLoop is the flagship AI feature of EVENITE. It implements a **closed-loop generative marketing system** where AI generates promotional content, real user interactions continuously train the ML model, and each generation loop produces better-performing variants.

### Pipeline

```
Host fills event form
        ↓
POST /api/genloop/generate
        ↓
UCB1 selects best prompt template (exploration vs exploitation)
        ↓
Groq LLM (llama-3.3-70b) generates text copy
        ↓
HuggingFace SDXL generates poster → Sharp composites SVG text overlay
        ↓
10-dimensional ML predictor scores viral potential
        ↓
1–5 variants returned to host
        ↓
Host publishes → variants shown to students
        ↓
Students interact (impression / click / share / register)
        ↓
Online gradient descent updates ML weights in real time
        ↓
Feedback loop cron (every 5 min) syncs Analytics → ContentVariant
        ↓
At 100 impressions: run marked complete, prompt EMA updated
        ↓
Host selects winner → others eliminated
        ↓
Next loop uses improved weights + templates
```

### 10-Dimensional Viral Score

| Dimension | Weight | Scoring Logic |
|-----------|--------|---------------|
| Title Quality | 0.13 | Length sweet spot (30–70 chars) + power word hits |
| Keyword Density | 0.15 | Keyword hits / total words |
| Tone Multiplier | 0.10 | Professional=0.7, Hype=1.0, Academic=0.6 |
| Social Post Quality | 0.12 | Length + hashtag count |
| Historical CTR | 0.10 | Real CTR from Analytics collection |
| Description Richness | 0.10 | Length + paragraph structure |
| CTA Urgency | 0.10 | Urgency word hits in call-to-action |
| Gamification Rewards | 0.10 | Count + high-value keyword bonus |
| Badges | 0.05 | Named achievement badge count |
| Urgency Triggers | 0.05 | Scarcity trigger count |

### UCB1 Template Selection

```
UCB1_score = avg_viral_score + C × √(ln(total_uses) / usage_count)
C = 10.0 (exploration constant)
```

### Online Gradient Descent

```
w_new = max(0.01, w + α × (realized_ctr − predicted) × feature_value)
weights re-normalised to sum = 1.0 after each update
```

### Confidence Levels

| Impressions | Confidence |
|-------------|-----------|
| < 30 | insufficient_data |
| 30–99 | low |
| 100–499 | medium |
| ≥ 500 | high |

### Variant Status Lifecycle

```
active → winner      (host selects)
active → eliminated  (another variant wins)
active → stale       (72h with zero impressions)
in_progress → partial (text gen failed, image only)
```

---

## Gamification System

PUBG-inspired progression system for students.

### Tier Progression

`Bronze → Silver → Gold → Platinum → Diamond → Crown → Ace → Conqueror`

### Point Awards

| Action | Points |
|--------|--------|
| Register for event | 50 |
| Earn certificate | 100 |
| First event attended | 100 (bonus) |
| Submit feedback | 30 |
| Subscribe to host | 20 |
| Write review | 15 |
| Social action | 10 |
| Bookmark event | 5 |
| Daily login streak | 5/day |

### Level Formula

```
minPoints = 10 × level²
```

Milestones: Level 1 (Rookie) → Level 10 (Explorer) → Level 50 (Enthusiast) → Level 100 (Expert) → Level 500 (Legend)

### Skill XP Categories

Technical · Creative · Management · Social

### Badge Tiers

| Category | Bronze | Silver | Gold |
|----------|--------|--------|------|
| Socialite | 1 friend | 10 friends | 50 friends |
| Curator | 5 bookmarks | 20 bookmarks | 100 bookmarks |
| Explorer | 1 event | 5 events | 20 events |
| Critic | 1 review | 10 reviews | 25 reviews |
| Dedicated | 3-day streak | 7-day streak | 30-day streak |

### Career Readiness Score

```
score = points×0.35 + eventsAttended×0.25 + loginStreak×0.20 + badges×0.20
```

---

## Database Schema

24 MongoDB collections with full relational modelling via Mongoose ODM.

| Collection | Purpose |
|------------|---------|
| User | Students, hosts, and admin identity; gamification; onboarding; privacy settings |
| Event | Full event schema with registrations, feedback, Q&A, polls, and AI fields |
| Bookmark | Separate collection for event bookmarks |
| Host | Host identity with document-based approval workflow |
| ContentVariant | GenLoop AI-generated marketing variants with performance metrics |
| GenerationRun | Tracks each AI generation run and loop iteration |
| Analytics | Event analytics with deduplication and variant tracking |
| Certificate | Issued participation certificates with public verification |
| CertificateTemplate | Host-defined certificate templates |
| ChatThread | AI support chatbot threads with escalation state |
| Circle | Interest groups with members, posts, and join policies |
| CirclePost | Social feed posts within Interest Circles |
| Squad | Friend group teams with invite management |
| Notification | Real-time notifications with 30-day TTL auto-expiry |
| Transaction | Payments, refunds, and payouts (Razorpay/Stripe) |
| Review | Custom review fields with AI sentiment scoring |
| ReviewField | Host-defined dynamic feedback fields per event |
| PromptTemplate | GenLoop prompt templates with EMA-tracked viral scores |
| FriendRequest | Friend request state machine (pending/accepted/declined) |
| Goal | Student bucket list goals with completion tracking |
| Memory | Post-event photo/text memories |
| Subscription | Host follow relationships |
| FraudLog | Fraud detection records |
| Message | P2P chat messages |

---

## API Routes

26 backend route modules under `/api/`.

| Route | Base Path | Highlights |
|-------|-----------|-----------|
| auth | /api/auth | Register, login, Google OAuth, OTP, admin CRUD, fraud logs |
| host | /api/host | Event CRUD, attendance (QR), live engagement, certificate generation |
| users | /api/users | Profile, gamification stats, leaderboard, skill XP, onboarding |
| events | /api/events | Public listing, registration, cancellation, feedback, waitlist |
| genloop | /api/genloop | Generate variants, track signals, select winner, retrain, A/B status |
| analytics | /api/analytics | Event analytics aggregation, signal tracking |
| friends | /api/friends | Send/accept/decline requests, KNN suggestions |
| gamification | /api/gamification | Award points, update tier, seasonal leaderboard |
| recommendations | /api/recommendations | AI-powered personalised event recommendations |
| bayesian | /api/bayesian | Event category classification |
| knn | /api/knn | K-nearest-neighbour friend suggestions |
| decisiontree | /api/decisiontree | Event popularity prediction |
| certificates | /api/certificates | Issue, download, verify (public QR link) |
| chat | /api/chat | AI support chatbot threads, escalation |
| circles | /api/circles | Create, join, invite, post, manage interest groups |
| squads | /api/squads | Create, invite, respond, manage friend squads |
| bookmarks | /api/bookmarks | Add/remove/list bookmarked events |
| subscriptions | /api/subscriptions | Follow/unfollow hosts |
| notifications | /api/notifications | CRUD, mark read, status update |
| memories | /api/memories | Post-event memories, likes, comments |
| goals | /api/goals | Bucket list goals and completion tracking |
| reviews | /api/reviews | Custom review fields, sentiment analysis |
| marketing | /api/marketing | AI-powered marketing copy generation (Groq/Gemini) |
| support | /api/support | Support ticket management |
| p2pChat | /api/p2pChat | Peer-to-peer real-time messaging |
| contact | /api/contact | Contact form submission |

---

## ML Classifiers

Three custom ML classifiers live in `server/scripts/`:

### 1. Bayesian Event Classifier

- Naive Bayes with Laplace smoothing
- 10 categories: Technology, Business, Arts, Science, Sports, Education, Health, Entertainment, Social, Other
- Softmax probability normalisation
- JSON model persistence (cross-compatible Python/JavaScript)
- Integrated into Event model via `eventSchema.methods.classifyCategory()`

### 2. Decision Tree Classifier

- Custom implementation (no sklearn dependency)
- Information gain splitting with entropy calculation
- Features: `attendance_count`, `price`, `duration_hours`, `is_weekend`
- Predicts event popularity (binary: popular / not popular)
- JSON model persistence (`decision_tree_model.json`)

### 3. KNN Friend Suggestions

- Similarity: institute match (weight 3) + Jaccard interest similarity (weight 2)
- Normalised score 0–1
- Invoked from Node.js via `child_process` stdin/stdout JSON pipe

---

## Real-Time Features

Socket.IO powers five real-time event channels:

| Feature | Events | Description |
|---------|--------|-------------|
| Live Q&A | `qa:new`, `qa:upvote`, `qa:answer` | Question submission and answers |
| Live Polls | `poll:vote`, `poll:results` | Voting and live result updates |
| P2P Chat | `message:send`, `message:receive` | Direct student-to-student messaging |
| Admin Heatmap | `active_users_count`, `new_click` | Real-time traffic and click tracking |
| Notifications | `notification:new` | Push notifications to connected clients |

---

## Authentication & Security

| Method / Measure | Implementation |
|------------------|---------------|
| Email/Password | bcrypt hashing + JWT tokens |
| Google OAuth | Firebase Auth + firebaseUid mapping |
| Email OTP | Nodemailer SMTP, 6-digit, expiring |
| Phone OTP | Twilio SMS, 6-digit, expiring |
| Rate Limiting | express-rate-limit on all API routes |
| HTTP Headers | Helmet.js security headers |
| CORS | Per-origin with credentials |
| Input Validation | Zod schemas on critical endpoints |
| Role-Based Access | student / host / admin middleware guards |
| Student Verification | OCR (Tesseract.js) + manual admin review |
| Soft Delete | `isDeleted` flag — no hard deletes |

---

## Frontend Pages & Dashboards

### Pages (19 + 6 auth/onboarding components)

`/` Home · `/dashboard` Student Dashboard · `/host-dashboard` Host Dashboard · `/admin` Admin Panel · `/live/:eventId` Live Event View · `/circles` Interest Groups · `/friends` Friends · `/chat` P2P Chat · `/verify/:certId` Certificate Verification · `/review/:eventId` Review · `/settings` Settings · and more.

### Student Dashboard (16 Tabs)

| Tab | Features |
|-----|---------|
| Home (Explore) | All Events, For You (AI), Trending, Map view |
| Live Vibes | Real-time sentiment feed + live chat |
| Near Me | Radius-based geolocation discovery |
| Bucket List | Semester goals and tracking |
| My Events | QR tickets, registration management, certificates |
| Saved | Bookmarked events |
| Following | Host subscription updates |
| Social Hub | Friends, Squads, Circles, KNN suggestions |
| Leaderboard | Global / Institute / Skill rankings |
| Achievements | Badge collection, Skill XP, Career Readiness Score |
| Updates | Real-time notification center |
| Wallet | Digital tickets and transactions |

### Host Dashboard (13 Tabs)

Events · Registrations · Feedback · Discover · Analytics · Studio · Certificates · AI Event Studio · AI Insights · AI Marketing · Live Q&A · Host Profile · AI Support Chatbot

### Admin Panel (14 Tabs)

Dashboard · Analytics · View Hosts · Host Applications · Verify Students · Manage Events · Live Traffic · Fraud & Spam · Financials · Support Hub · Monitor · Notifications

---

## Testing

- **E2E**: Playwright — 55 test cases across 4 suites
- **Unit/Integration**: Jest + Supertest (backend)

| Suite | Test Cases |
|-------|-----------|
| `student-dashboard.spec.js` | 17 — full student journey |
| `host-dashboard.spec.js` | 15 — full host workflow |
| `ai-event-generation.spec.js` | 8 — GenLoop with route mocking |
| `admin-dashboard.spec.js` | 15 — all admin panel tabs |

```bash
# Run all E2E tests (requires dev server on localhost:3000)
npx playwright test

# Run a specific suite
npx playwright test tests/student-dashboard.spec.js

# Backend unit tests
cd server && npm test

# Backend tests with coverage
cd server && npx jest --coverage
```

---

## Deployment

### Frontend & Backend — Render

```
https://evenite.onrender.com
```

- Frontend build: `react-scripts build`
- Backend routes served under `/api/...`
- MongoDB: lazy connect on first request (serverless-safe)

### AI Microservice

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- SQLite DB auto-created at `ai_service/genloop.db`
- Uploads directory: `ai_service/uploads/genloop/`

---

## Environment Variables

### Backend

```env
MONGODB_URI=
JWT_SECRET=
GROQ_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_ORIGIN=
NODEMAILER_HOST=
NODEMAILER_USER=
NODEMAILER_PASS=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### AI Microservice

```env
GROQ_API_KEY=
HF_API_TOKEN=
```

### Frontend

```env
REACT_APP_API_BASE_URL=
REACT_APP_CLOUDINARY_CLOUD_NAME=
REACT_APP_CLOUDINARY_UPLOAD_PRESET=
```

---

## Project Statistics

| Metric | Count |
|--------|-------|
| MongoDB Collections | 24 |
| Backend Route Modules | 26 |
| Backend Services | 9 |
| ML Classifiers | 3 (Bayesian, Decision Tree, KNN) |
| ML Training Scripts | 14 (Python + JS) |
| Frontend Pages | 19 + 6 auth/onboarding components |
| Frontend Components | 55+ |
| Student Dashboard Tabs | 16 |
| Host Dashboard Tabs | 13 |
| Admin Panel Tabs | 14 |
| AI Microservice Endpoints | 11 |
| SQLite Tables | 5 |
| Playwright Test Cases | 55 |
| Viral Score Dimensions | 10 |
| Gamification Tiers | 8 |
| Event Templates | 9 |
| GenLoop Tones | 3 (Professional, Hype, Academic) |
| GenLoop Image Styles | 7 (Vibrant, Minimalist, Retro, Futuristic, Illustrated, Dark, Neon) |

---

<div align="center">

Built with ❤️ using the MERN stack + Python AI microservice · EVENITE v2.5 · 2026

</div>
