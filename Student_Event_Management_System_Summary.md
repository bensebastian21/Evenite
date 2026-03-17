# EVENITE — Student Event Management System
## Complete Project Summary (Main Project — Updated)

> An AI-powered centralised platform that streamlines campus event discovery, registration, and promotion for students and hosts through intelligent recommendations, gamification, generative viral marketing, real-time communication, and a full Python AI microservice.

---

## Abstract

EVENITE is a centralised, AI-powered student event management system built for college campuses. It connects students, event hosts, and administrators on a single platform — enabling event discovery, registration, attendance, gamification, peer networking, and AI-driven viral marketing. The system evolved from a mini project into a full-scale main project featuring a five-tier architecture: a React 18 frontend, a Node.js/Express backend, a dedicated Python FastAPI AI microservice, MongoDB Atlas for data persistence, and Cloudinary for media storage.

---

## System Architecture

### Full Stack Overview

| Tier | Technology | Deployment |
|------|-----------|------------|
| Frontend | React 18 (CRA), React Router v6, Framer Motion, Recharts, Leaflet, Socket.IO Client | Render (https://evenite.onrender.com) |
| Backend | Node.js 18, Express 4, Mongoose 7, Socket.IO 4, node-cron | Render (https://evenite.onrender.com) |
| AI Microservice | Python 3.11, FastAPI 2.0, SQLite (WAL mode), httpx | Render (port 8000) |
| Database | MongoDB Atlas (Mongoose ODM) | MongoDB Atlas Cloud |
| Media Storage | Cloudinary (images, banners, documents) | Cloudinary CDN |


### Architecture Diagram

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
┌──────▼──────────┐  ┌────────▼─────────────────┐ ┌─────────────┐
│  MongoDB Atlas  │  │ Python FastAPI            │ │  Cloudinary │
│  24 Collections │  │ AI Microservice           │ │  CDN        │
│  Geospatial     │  │ GenLoop v2.0 — port 8000  │ │  Images     │
│  Index          │  │ SQLite + UCB1 + Gradient  │ │  Banners    │
└─────────────────┘  │ Descent + HF SDXL         │ │  Documents  │
                     └──────────────────────────┘ └─────────────┘
```

---

## Technology Stack — Full Dependency List

### Backend (server/package.json)

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | HTTP server framework |
| mongoose | ^7.8.7 | MongoDB ODM |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| bcrypt / bcryptjs | ^6.0.0 / ^2.4.3 | Password hashing |
| socket.io | ^4.8.3 | Real-time WebSocket |
| node-cron | ^4.2.1 | Scheduled jobs (feedback loop) |
| nodemailer | ^7.0.5 | Email (OTP, password reset) |
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

### Frontend (client/package.json)

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

### AI Microservice (ai_service/requirements.txt)

| Package | Purpose |
|---------|---------|
| fastapi | ASGI web framework |
| uvicorn | ASGI server |
| httpx | Async HTTP client (Groq API) |
| Pillow | Image generation and text overlay |
| pydantic | Request/response validation |
| python-multipart | File upload support |

---


## Database Schema — MongoDB Collections (24 Models)

### 1. User (students, hosts, admins)

Core identity model with full gamification, onboarding, and privacy settings.

| Field Group | Fields |
|-------------|--------|
| Identity | username, fullname, institute, email (unique), phone (unique sparse), password (optional for Firebase), role (student/host/admin) |
| Address | street, city, pincode, age, course, countryCode |
| Verification | emailVerified, phoneVerified, OTP fields, studentIdPath, isStudentIdVerified, ocrRaw, ocrMismatch |
| Firebase | firebaseUid |
| Profile | profilePic, interests[], website, bannerUrl, socials (twitter/instagram/linkedin), displayBadges[] |
| Settings | notifications (email/reminders/friendRequests), privacy (incognitoMode/onlyFriendsCanViewProfile/allowFriendRequests), ui (density/sidebarCollapsed), accessibility (reduceMotion/highContrast), recommendations (personalizeUsingOnboarding/showTrendingFirst) |
| Gamification | points, level, tier (Bronze→Silver→Gold→Platinum→Diamond→Crown→Ace→Conqueror), seasonPoints, skillXP (technical/creative/management/social) |
| Gamification Stats | eventsAttended, eventsBookmarked, reviewsWritten, friendsConnected, hostSubscriptions, loginStreak, lastLoginDate, maxLoginStreak |
| Badges | id, name, icon, tier (bronze/silver/gold/platinum), earnedAt, description |
| Achievements | id, name, description, unlockedAt |
| Rank History | season, tier, points (per season) |
| Onboarding | preferredCareerSectors[], preferredJobRoles[], futurePlan, careerGoals, skillsToDevelop[], preferredWorkMode, hobbies[], eventTypesInterested[], personalityType, motivationLevel |
| Soft Delete | isDeleted, deletedAt |

Indexes: email (unique), phone (sparse unique), role, points (leaderboard), firebaseUid, resetCode, subscribedHosts, createdAt

### 2. Event

Full event schema with embedded sub-documents for registrations, feedback, Q&A, polls, and AI fields.

| Field Group      | Fields                                                                                                                                                                                                                                                                                                       |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Core             | title, description, shortDescription, date, endDate, registrationDeadline, location, address, city, state, pincode, capacity, price, currency                                                                                                                                                                |
| Team             | isTeamEvent, minTeamSize, maxTeamSize                                                                                                                                                                                                                                                                        |
| Media            | imageUrl, images[], category, tags[], requirements, agenda, contactEmail, contactPhone, website                                                                                                                                                                                                              |
| Online           | isOnline, platform, meetingLink                                                                                                                                                                                                                                                                              |
| Relations        | hostId (ref: User), coHosts[] (ref: User)                                                                                                                                                                                                                                                                    |
| Registrations    | studentId, squadId, registeredAt, status (registered/cancelled), attended                                                                                                                                                                                                                                    |
| Feedback         | studentId, rating (1-5), comment, createdAt                                                                                                                                                                                                                                                                  |
| Waiting List     | studentId, addedAt                                                                                                                                                                                                                                                                                           |
| Geolocation      | coordinates [longitude, latitude] — 2dsphere index                                                                                                                                                                                                                                                           |
| Live Engagement  | isQaActive, qaList (question/upvotes/upvotedBy/answered/reply), polls (question/options/voters/isActive)                                                                                                                                                                                                     |
| AI Fields        | posterUrl, generatedDescription, engagementScore, keywords[]                                                                                                                                                                                                                                                 |
| Viral Metrics    | views, clicks, registrations                                                                                                                                                                                                                                                                                 |
| Gamification     | gamificationRewards[]                                                                                                                                                                                                                                                                                        |
| Soft Delete      | isDeleted, deletedAt                                                                                                                                                                                                                                                                                         |

Indexes: SemanticTextIndex (title×10, tags×5, category×3, shortDescription×2, description×1), isPublished+isDeleted+date, hostId+isDeleted+date, coHosts, createdAt

### 3. Bookmark

Separate collection for event bookmarks to improve query efficiency and scalability.

| Field | Description |
|-------|-------------|
| Relations | studentId (ref: User), eventId (ref: Event) |
| Metadata | bookmarkedAt |

Indexes: {studentId, eventId} (unique), studentId, eventId

### 4. Host

Separate host collection with document-based approval workflow.

| Field        | Description                                                                                   |
|--------------|-----------------------------------------------------------------------------------------------|
| Identity     | username, fullname, institute, email, phone, password                                         |
| Approval     | documentPath, approvalStatus (pending/approved/rejected), approvedBy, approvedAt, rejectionReason |
| Auth         | resetPasswordToken, resetCode, firebaseUid                                                    |
| Soft Delete  | isDeleted, deletedAt                                                                          |

### 5. ContentVariant (GenLoop AI)

Stores each AI-generated marketing variant with full performance metrics.

| Field   | Description                                                                                                                                                  |
|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| IDs     | variantId (unique), runId, eventId, hostId, promptTemplateId                                                                                                 |
| Content | posterUrl, imageFallback, textCopy (title/shortHook/descriptionHtml/socialPosts/keywords/callToAction/gamificationRewards/badges/urgencyTriggers/targetAudienceInsight) |
| ML      | predictedViralScore                                                                                                                                          |
| Status  | active / winner / eliminated / partial / stale                                                                                                               |
| Metrics | impressions, clicks, shares, registrations, ctr, shareRate, registrationConversionRate                                                                      |

### 6. GenerationRun

Tracks each AI generation run with loop iteration for multi-round A/B testing.

| Field      | Description                               |
|------------|-------------------------------------------|
| IDs        | runId (unique), eventId, hostId           |
| Config     | variantCount, promptTemplateId, loopIteration |
| Status     | in_progress / completed / failed / stale  |
| Timestamps | createdAt, completedAt                    |

### 7. Analytics

Event analytics with deduplication and variant tracking.

| Field    | Description                                                     |
|----------|-----------------------------------------------------------------|
| Core     | eventId, hostId, type (impression/click/registration), source, userId |
| GenLoop  | variantId, signal (impression/click/share/registration/orphaned) |
| Dedup    | dedupeKey (sparse index)                                        |
| Metadata | Mixed metadata object, timestamp                                |

### 8. Certificate

| Field      | Description                                            |
|------------|--------------------------------------------------------|
| Relations  | eventId, hostId, studentId                             |
| Content    | title, studentName, hostName, institute, url, filename |
| Timestamps | issuedAt, createdAt, updatedAt                         |

### 9. CertificateTemplate

Host-defined templates for certificate generation.

| Field  | Description                                              |
|--------|----------------------------------------------------------|
| Owner  | hostId                                                   |
| Style  | backgroundUrl, primaryColor, secondaryColor, fontSettings |
| Layout | textPositioning (JSON), customGraphics[]                 |

### 10. ChatThread (AI Support)

| Field      | Description                                                                                          |
|------------|------------------------------------------------------------------------------------------------------|
| Owner      | ownerType (student/host/admin), ownerId                                                              |
| Messages   | role (system/user/assistant), content, at                                                            |
| Escalation | isEscalated, escalationStatus (Open/In-Progress/Closed), frustrationLevel (Low/Medium/High), escalationSummary, escalatedAt |

### 11. Circle (Interest Groups)

| Field    | Description                                          |
|----------|------------------------------------------------------|
| Core     | name, description, interestTags[], bannerUrl, iconColor |
| Members  | members[], admins[], pendingRequests[], pendingInvites[] |
| Config   | visibility (public/private), joinPolicy (open/request) |
| Relations| events[]                                             |

### 12. CirclePost

Social feed posts within Interest Circles.

| Field        | Description                               |
|--------------|-------------------------------------------|
| Core         | circleId, author (ref: User), content, images[] |
| Interactive  | likes[], comments (author/content/at)     |
| Timestamps   | createdAt, updatedAt                      |

Indexes: {circleId: 1, createdAt: -1}

### 13. Squad (Friend Groups)

| Field | Description                                                       |
|-------|-------------------------------------------------------------------|
| Core  | name, leaderId, members[], pendingMembers[], description, iconColor |

### 14. Notification

| Field   | Description                                                                              |
|---------|------------------------------------------------------------------------------------------|
| Core    | userId, type (System/Friend Request/Achievement/Event/Reminder/Squad/Circle Invite)      |
| Content | title, message, data (linked entity IDs), read, status (active/processed)                 |
| TTL     | Auto-expires after 30 days                                                               |

### 15. Transaction (Payments)

| Field      | Description                             |
|------------|-----------------------------------------|
| Relations  | eventId, hostId, studentId              |
| Financial  | amount, currency, platformFee, hostEarnings |
| Type       | TicketSale / Refund / Payout            |
| Status     | Pending / Completed / Failed / Refunded |
| Payment    | paymentId (Razorpay/Stripe), metadata   |

### 16. Review

| Field          | Description                                           |
|----------------|-------------------------------------------------------|
| Core           | eventId, reviewerId, overallRating (1-5)              |
| Custom Fields  | fieldName, fieldType (text/rating/textarea), value/rating |
| AI             | sentimentScore, sentimentLabel (Positive/Neutral/Negative) |
| Config         | isAnonymous, isDeleted                                |

### 17. ReviewField

Dynamic fields defined by hosts for event-specific feedback.

| Field     | Description                                     |
|-----------|-------------------------------------------------|
| Core      | eventId, fieldName, fieldType (text/rating/textarea) |
| Config    | isRequired, placeholder, order                   |
| Garbage   | isDeleted, deletedAt                             |

Indexes: {eventId: 1, order: 1}

### 18. PromptTemplate (GenLoop)

| Field | Description                                                   |
|-------|---------------------------------------------------------------|
| Core  | templateId (unique), promptText, tone (Professional/Hype/Academic) |
| ML    | avgViralScore (EMA-updated), usageCount                       |

### 19–24. Additional Collections

| Collection    | Purpose                                                              |
|---------------|----------------------------------------------------------------------|
| FriendRequest | from, to, status (pending/accepted/declined) — unique compound index |
| Goal          | studentId, title, targetCount, category, isCompleted                 |
| Memory        | eventId, studentId, type (photo/text), content, imageUrl, likes[], comments[] |
| Subscription  | studentId, hostId, isActive, lastNotificationSent — unique compound index |
| FraudLog      | Fraud detection records with status management                       |
| Message       | P2P chat messages                                                   |

---


## Backend API Routes (26 Route Modules)

| Route           | Base Path          | Key Endpoints                                                                                                                                           |
|-----------------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| auth            | /api/auth          | register, login, Google OAuth, OTP verify, password reset, admin CRUD, host applications, student verification, metrics, fraud logs, financials          |
| host            | /api/host          | event CRUD, registrations, attendance (QR), cover/gallery upload, co-host search, smart-search (NLP), live engagement (Q&A/polls), certificate generation |
| users           | /api/users         | profile, settings, gamification stats, leaderboard, skill XP, badges, achievements, onboarding                                                          |
| events          | /api/events        | public event listing, event detail, registration, cancellation, feedback, waitlist                                                                     |
| genloop         | /api/genloop       | generate variants, track signals, upload poster, select winner, retrain, export feedback, A/B status, analytics, ML status |
| analytics       | /api/analytics     | event analytics aggregation, signal tracking                                                                                                            |
| friends         | /api/friends       | send/accept/decline requests, list friends, KNN suggestions                                                                                             |
| gamification    | /api/gamification  | award points, update tier, seasonal leaderboard                                                                                                         |
| recommendations | /api/recommendations| AI-powered event recommendations                                                                                                                      |
| bayesian        | /api/bayesian      | event category classification                                                                                                                           |
| knn             | /api/knn           | K-nearest-neighbor friend suggestions                                                                                                                   |
| decisiontree    | /api/decisiontree  | event popularity prediction                                                                                                                             |
| certificates    | /api/certificates  | issue, download, verify (public QR link)                                                                                                                |
| chat            | /api/chat          | AI support chatbot threads, escalation                                                                                                                  |
| circles         | /api/circles       | create, join, invite, post, manage interest groups                                                                                                      |
| squads          | /api/squads        | create, invite, respond, manage friend squads                                                                                                           |
| bookmarks       | /api/bookmarks     | add/remove/list bookmarked events                                                                                                                       |
| subscriptions   | /api/subscriptions | follow/unfollow hosts                                                                                                                                   |
| notifications   | /api/notifications | CRUD, mark read, status update                                                                                                                          |
| memories        | /api/memories      | post-event photo/text memories, likes, comments                                                                                                         |
| goals           | /api/goals         | bucket list goals, completion tracking                                                                                                                 |
| reviews         | /api/reviews       | custom review fields, dynamic field management, sentiment analysis                                                                                      |
| marketing       | /api/marketing     | AI-powered event marketing copy generation (Groq/Gemini)                                                                                                |
| support         | /api/support       | support ticket management                                                                                                                               |
| p2pChat         | /api/p2pChat       | peer-to-peer real-time messaging                                                                                                                        |
| contact         | /api/contact       | contact form submission                                                                                                                                 |

---

## Backend Services

### 1. LLM Service (server/services/llmService.js)

- Model: `llama-3.3-70b-versatile` via Groq API
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- JSON mode enforced (`response_format: { type: 'json_object' }`)
- Retry logic: up to 2 retries on parse failure
- Salvage fallback: regex-based field extraction when JSON.parse fails
- Generates: title, shortHook, descriptionHtml, socialPosts (twitter/instagram/linkedin), keywords[]

### 2. Image Service (server/services/imageService.js)

- Phase 1: HuggingFace SDXL generates background artwork (90s timeout)
- Phase 2: Sharp composites SVG text overlay (title, hook, venue, date) on top
- Fallback: Sharp-generated gradient background if HF unavailable
- Saves final JPEG to `server/uploads/genloop/`, returns local path for Cloudinary upload
- Handles profile pictures, banners, and event gallery images via Cloudinary multer storage

### 3. Multi-Modal Pipeline (server/services/multiModalPipeline.js)

- Orchestrates text generation (LLM) + image generation (Cloudinary/HuggingFace) per variant
- Falls back gracefully if either step fails
- Returns combined variant object with posterUrl + textCopy

### 4. Prompt Optimizer (server/services/promptOptimizer.js)

- Selects best template per tone by `avgViralScore DESC` (MongoDB sort)
- Seeds default Professional/Hype/Academic templates if none exist for a tone
- EMA-based scoring: `avg_new = 0.9 * avg_old + 0.1 * realized_score`
- `recordOutcome(templateId, score)` — updates MongoDB PromptTemplate
- Note: Node.js uses score-based selection; Python service uses full UCB1

### 5. Engagement Predictor (server/services/engagementPredictor.js)

10-dimensional weighted viral scoring:

| Dimension | Weight | Scoring Logic |
|-----------|--------|---------------|
| w1 — Title Quality | 0.13 | Length sweet spot (30-70 chars) + power word hits |
| w2 — Keyword Density | 0.15 | Keyword hits / total words in description |
| w3 — Tone Multiplier | 0.10 | Professional=0.7, Hype=1.0, Academic=0.6 |
| w4 — Social Post Quality | 0.12 | Length + hashtag count |
| w5 — Historical CTR | 0.10 | Real CTR from Analytics collection |
| w6 — Description Richness | 0.10 | Length + paragraph structure |
| w7 — CTA Urgency | 0.10 | Urgency word hits in call-to-action |
| w8 — Gamification Rewards | 0.10 | Count + high-value keyword bonus |
| w9 — Badges | 0.05 | Named achievement badge count |
| w10 — Urgency Triggers | 0.05 | Scarcity trigger count |

Online weight update: `w_new = (1-α)*w + α*gradient` where gradient = realizedCTR - predicted

### 6. Feedback Loop (server/services/feedbackLoop.js)

- Cron: every 5 minutes (`*/5 * * * *`)
- `syncAnalyticsToVariants()` — aggregates real Analytics data into ContentVariant metrics
- Marks runs `completed` when total impressions ≥ 100
- Marks runs `stale` when older than 72h with zero impressions
- On completion: triggers `recordOutcome()` with composite score = `CTR × 50 + registrationConversionRate × 50`

### 7. A/B Router (server/services/abRouter.js)

- Routes traffic between active variants for A/B testing

### 8. Fraud Detector (server/services/fraudDetector.js)

- Detects suspicious registration patterns
- Logs to FraudLog collection
- Admin dashboard review and status management

### 9. Ticket Service (server/services/ticketService.js)

- QR code generation per registration
- Attendance marking via QR scan
- PDF ticket generation with PDFKit

---


## Python AI Microservice — GenLoop v2.0

### Overview

FastAPI application (`ai_service/main.py`) running as an independent microservice. Provides the full generative viral loop pipeline with persistent ML learning via SQLite.

### SQLite Schema (ai_service/db.py)

| Table | Key Columns |
|-------|-------------|
| prompt_templates | template_id, tone, prompt_text, avg_viral_score, usage_count |
| generation_runs | run_id, event_id, host_id, variant_count, status, prompt_template_id, loop_iteration |
| content_variants | variant_id, run_id, event_id, text_copy (JSON), tone, predicted_viral_score, status, impressions, clicks, shares, registrations, ctr, share_rate, reg_conv_rate |
| analytics_events | id, variant_id, event_id, signal, dedupe_key (unique sparse), source |
| ml_weights | id=1 (singleton), weights (JSON), mae |

WAL journal mode enabled. Context manager `tx()` provides atomic transactions.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/genloop/generate | Generate 1-5 variants with UCB1 template + ML scoring |
| POST | /api/genloop/track/{variantId} | Track signal (impression/click/share/registration) with deduplication |
| POST | /api/genloop/select-winner/{variantId} | Mark winner, eliminate others in run |
| POST | /api/genloop/retrain | Batch retrain ML weights from variants with ≥N impressions |
| POST | /api/genloop/upload-poster/{variantId} | Upload variant poster to Cloudinary |
| POST | /api/genloop/export-feedback | Export completed run feedback data |
| GET | /api/genloop/ab-status/{eventId} | A/B test status with confidence levels |
| GET | /api/genloop/analytics/{eventId} | Full loop analytics across all iterations |
| GET | /api/genloop/ml-status | Current weights + template performance |
| GET | /api/genloop/variant-poster/{variantId} | Serve raw image file for Cloudinary upload |
| GET | /health | Health check (Groq + HF token status) |

### LLM Service (ai_service/llm_service.py)

- Groq API via async httpx
- UCB1 template selection before each call
- JSON salvage fallback with regex extraction
- Retry logic with exponential backoff
- Generates: title, short_hook, description_html, social_posts, keywords, call_to_action, gamification_rewards, badges, urgency_triggers, target_audience_insight

### Image Service (ai_service/image_service.py)

- Primary: HuggingFace SDXL (`stabilityai/stable-diffusion-xl-base-1.0`)
- Fallback: Pillow-based poster with text overlay
- Style modifiers: Vibrant, Minimalist, Retro, Futuristic, Illustrated, Dark, Neon
- Category-specific visual elements per event type
- Saves to `uploads/genloop/` directory

### Predictor (ai_service/predictor.py)

Same 10-dimensional scoring as Node.js service, with SQLite-persisted weights.

**Online gradient descent:**
```
w_new = max(0.01, w + α * (realized_ctr - predicted) * feature_value)
weights re-normalized to sum = 1.0 after each update
```

**Batch retrain:**
- Multiple gradient passes over all variants with sufficient impressions
- Only saves new weights if MAE improves (prevents regression)

### Prompt Optimizer (ai_service/prompt_optimizer.py)

UCB1 formula:
```
UCB1_score = avg_viral_score + C * sqrt(ln(total_uses) / usage_count)
C = 10.0 (exploration constant)
```

EMA outcome recording:
```
avg_new = (1 - 0.1) * avg_old + 0.1 * realized_viral_score
```

Three seed templates auto-inserted on first use: Professional, Hype, Academic.

---

## ML Classifiers (server/scripts/)

### 1. Bayesian Event Classifier (bayesian_classifier.py)

- Naive Bayes with Laplace smoothing
- 10 categories: Technology, Business, Arts, Science, Sports, Education, Health, Entertainment, Social, Other
- Softmax probability normalization
- Model persistence: JSON save/load (cross-compatible Python/JavaScript format)
- Integrated into Event model via `eventSchema.methods.classifyCategory()`
- Hot-reload on retrain: `eventClassifier.loadModel(modelPath)`
- Training endpoint: `POST /api/bayesian/train`
- Additional scripts: `train_classifier.py`, `classify_event.py`, `get_event_categories.py`, `train_js_classifier.js`

### 2. Decision Tree Classifier (decision_tree.py)

- Custom implementation (no sklearn dependency)
- Information gain splitting with entropy calculation
- Features: attendance_count, price, duration_hours, is_weekend
- Predicts event popularity (binary: popular/not popular)
- Max depth: 10, min samples split: 2
- JSON model persistence (`decision_tree_model.json`)
- Additional training scripts: `train_decision_tree.py`, `train_decision_tree_comprehensive.py`, `train_dt_model.py`, `predict_decision_tree.py`

### 3. KNN Friend Suggestions (knn_friends.py)

- Similarity metric: institute match (weight 3) + Jaccard interest similarity (weight 2)
- Normalized score 0–1
- Called from Node.js via child_process stdin/stdout JSON pipe
- Returns top-K similar users sorted by similarity score

### 4. Event Classifier Training (server/scripts/trainEventClassifier.js)

- JavaScript wrapper that fetches all events from MongoDB
- Calls `Event.trainClassifier(events)` static method
- Saves model to `server/data/eventClassifierModel.json`
- Hot-reloads global classifier instance

### 5. Seasonal Reset (server/scripts/seasonalReset.js)

- Standalone Node.js script (run manually or via cron)
- Archives current tier + seasonPoints to `rankHistory[]`
- Resets `seasonPoints = 0` and `tier = 'Bronze'` for all active students
- Only processes students with `seasonPoints > 0`

---


## Frontend — React 18 Application

### Pages

| Page | Route | Description |
|------|-------|-------------|
| HomePage | / | Public landing page with hero, features, CTA |
| LandingPage | / (alt) | Alternative landing page variant |
| Login | /login | Email/password + Google OAuth login (component) |
| Register | /register | Student registration with institute selection (component) |
| HostRegister | /host-register | Host registration with document upload (component) |
| StudentOnboarding | /onboarding | Multi-step career/interest onboarding (component) |
| Dashboard | /dashboard | Full student dashboard (16 tabs) |
| HostDashboard | /host-dashboard | Full host dashboard (13 tabs) |
| HostPage | /host/:id | Public host profile page |
| AdminPanel | /admin | Admin control panel (14 tabs) |
| AdminVerification | /admin/verify | Student ID verification queue |
| AttendeeLiveView | /live/:eventId | Live event engagement (Q&A, polls) |
| HostLivePanel | /host/live/:eventId | Host live event control panel |
| ChatPage | /chat | P2P messaging page |
| Circles | /circles | Interest group discovery |
| CircleDetail | /circles/:id | Circle detail and posts |
| AllFriends | /friends | Full friends management |
| CertificateVerify | /verify/:certId | Public certificate verification |
| Profile | /profile | User profile page |
| ReviewPage | /review/:eventId | Event review submission page |
| Settings | /settings | User settings page |
| About | /about | About page |
| Contact | /contact | Contact form |
| OAuthCallback | /auth/callback | Google OAuth redirect handler (component) |
| PasswordReset | /reset-password | Password reset flow (component) |

### Student Dashboard Navigation (12 Main Tabs / 16 Targets)

| Tab | Features |
|-----|---------|
| Home (Explore) | Multi-view discovery: All Events, For You (AI), Trending, and Map |
| Live Vibes | Real-time sentiment feed + live chat |
| Near Me | Radius-based discovery using geolocation |
| Bucket List | Goal tracking and semester targets |
| My Events | Registration management, QR tickets, certificates |
| Saved | Personal bookmark collection |
| Following | Host subscription updates |
| Social Hub | Friends, Squads, Circles, User Search, KNN Suggestions |
| Leaderboard | Competitive rankings (Global/Institute/Skill) |
| Achievements | Badge collection, Skill XP, Career Readiness Score |
| Updates | Real-time notification center |
| Wallet | Digital ticket and transaction management |

### Host Dashboard Navigation (10 Sidebar Tabs + Tools)

| Tab | Features |
|-----|---------|
| Events | Event lifecycle management (Templates, Co-Hosts, Gallery) |
| Registrations | Attendee lists, QR scans, XLSX import/export |
| Feedback | Sentiment analysis, custom review fields |
| Discover | Cross-college event browsing |
| Analytics | Channel performance charts and trends |
| Studio | GenLoop A/B test iterations and timeline |
| Certificates | Template editor and bulk issuance |
| AI Event Studio | Viral content generation engine |
| AI Insights | Deep feedback analysis dashboard |
| AI Marketing | LLM-powered marketing copywriter |
| Other Tools | Live Q&A moderation, Host Profile, AI Support Chatbot |

### Admin Panel Navigation (12 Sidebar Tabs)

| Tab | Features |
|-----|---------|
| Dashboard | Platform-wide KPIs (Users, Events, Revenue) |
| Analytics | Deep-dive trends and category distribution |
| View Hosts | Full host directory and management |
| Host Applications | Verification queue for new host registrations |
| Verify Students | OCR-assisted ID verification desk |
| Manage Events | Central event control and moderation |
| Live Traffic | Real-time active users and click heatmap |
| Fraud & Spam | Security log review and status management |
| Financials | Transaction ledger and revenue reconciliation |
| Support Hub | Escalated ticket management desk |
| Monitor | Real-time activity stream |
| Notifications | Global broadcast broadcasts |

### Key Components

| Component | Purpose |
|-----------|---------|
| GenLoopStudio | AI content generation form with variant display |
| ABTestManager | A/B test status and winner selection |
| LoopIterationTimeline | Visual timeline of generation loop iterations |
| MarketingCopywriter | AI marketing copy tool |
| ViralLoopAnalyticsPanel | Analytics charts for viral loop metrics |
| ModernPaymentUI | Premium Razorpay-integrated payment interface with virtual card |
| GamifiedComponents | EventCard, BadgeCard, LevelProgress, Leaderboard, SkillLeagues |
| BadgeDetailModal | Badge detail with criteria progress |
| CertificateEditor | Drag-and-drop certificate template editor |
| AiFeedbackDashboard | AI-powered feedback insights |
| EventMap | Leaflet map with event clustering |
| EventsNearMe | Geolocation-based event discovery |
| LiveSentimentFeed | Real-time event sentiment stream |
| BucketListGoals | Goal creation and progress tracking |
| SupportChatbot | AI chatbot with frustration detection and escalation |
| QRCodeScanner | html5-qrcode based attendance scanner |
| SquadManager | Squad creation, invite, and management |
| InviteFriendsModal | Friend invitation to circles |
| ChatInterface / DashboardChat | Real-time P2P messaging |
| TicketWallet | Student ticket collection with QR codes |
| GlobalTrafficTracker | Admin real-time traffic visualization |
| SupportEscalationHub | Admin escalated ticket management |

---


## GenLoop — Generative Viral Loop System (Key Feature)

### Overview

GenLoop is the flagship AI feature of EVENITE. It implements a closed-loop generative marketing system where AI generates event promotional content, real user interactions train the ML model, and each generation loop produces better-performing variants.

### Full Pipeline

```
Host fills event form
        ↓
POST /api/genloop/generate
        ↓
Try Python AI service (5 min timeout) → fallback to Node.js pipeline (3 min timeout)
        ↓
UCB1 selects best prompt template (exploration vs exploitation)
        ↓
Groq LLM (llama-3.3-70b) generates text copy
        ↓
HuggingFace SDXL generates poster background → Sharp composites SVG text overlay
        ↓
10-dim ML predictor scores viral potential
        ↓
1-5 variants returned to host
        ↓
Host publishes event → variants shown to students
        ↓
Students interact (impression/click/share/register)
        ↓
POST /api/genloop/track/:variantId
        ↓
Online gradient descent updates ML weights
        ↓
Feedback loop cron (every 5 min) syncs Analytics → ContentVariant
        ↓
At 100 impressions: run marked completed, prompt EMA updated
        ↓
Host selects winner → others eliminated
        ↓
Next generation loop uses improved weights + templates
```

### Variant Status Lifecycle

```
active → winner (host selects)
active → eliminated (when another variant wins)
active → stale (72h with zero impressions)
in_progress → partial (text gen failed, image only)
```

### Confidence Levels (A/B Status)

| Impressions | Confidence |
|-------------|-----------|
| < 30 | insufficient_data |
| 30–99 | low |
| 100–499 | medium |
| ≥ 500 | high |

### Deduplication

Impression deduplication uses SHA-256 hash of `variantId + viewer_fingerprint + hour_bucket` to prevent inflated counts from repeated views.

---

## Gamification System (PUBG-Style)

### Tier Progression

Bronze → Silver → Gold → Platinum → Diamond → Crown → Ace → Conqueror

### Point Awards

| Action | Points |
|--------|--------|
| Register for event | 50 |
| Bookmark event | 5 |
| Subscribe to host | 20 |
| Submit feedback | 30 |
| Write review | 15 |
| Earn certificate | 100 |
| Daily login streak | 5/day |
| First event attended | 100 (bonus) |
| Social action | 10 |

### Level Formula

`minPoints = 10 × level²`

Milestones: Level 1 (Rookie), Level 10 (Explorer), Level 50 (Enthusiast), Level 100 (Expert), Level 500 (Legend)

### Skill XP Categories

Technical, Creative, Management, Social — boosted by event category attendance and onboarding preferences.

### Badge System

| Category | Bronze | Silver | Gold |
|----------|--------|--------|------|
| Socialite | 1 friend | 10 friends | 50 friends |
| Curator | 5 bookmarks | 20 bookmarks | 100 bookmarks |
| Explorer | 1 event | 5 events | 20 events |
| Critic | 1 review | 10 reviews | 25 reviews |
| Dedicated | 3-day streak | 7-day streak | 30-day streak |
| Verified | — | — | Email verified (+150 XP) |

### Career Readiness Score

`score = points×0.35 + eventsAttended×0.25 + loginStreak×0.20 + badges×0.20`

### Seasonal Reset

- Monthly: `seasonPoints` reset to 0, `tier` reset to Bronze
- Previous season archived in `rankHistory[]`
- Run via `server/scripts/seasonalReset.js`

---

## Authentication & Security

### Authentication Methods

| Method | Implementation |
|--------|---------------|
| Email/Password | bcrypt hashing, JWT tokens |
| Google OAuth | Firebase Auth + firebaseUid mapping |
| Email OTP | Nodemailer SMTP, 6-digit code, expiry |
| Phone OTP | Twilio SMS, 6-digit code, expiry |
| Password Reset | Code-based reset with expiry |

### Security Measures

| Measure | Implementation |
|---------|---------------|
| Rate Limiting | express-rate-limit on all API routes |
| HTTP Headers | Helmet.js security headers |
| CORS | Configured per-origin with credentials |
| Input Validation | Zod schemas on critical endpoints |
| Soft Delete | isDeleted flag — no hard deletes |
| Role-Based Access | student / host / admin middleware guards |
| JWT Expiry | Configurable token expiry |
| Student ID Verification | OCR (Tesseract.js) + manual admin review |

---

## Real-Time Features (Socket.IO)

| Feature | Event | Description |
|---------|-------|-------------|
| Live Q&A | qa:new, qa:upvote, qa:answer | Real-time question submission and answers |
| Live Polls | poll:vote, poll:results | Real-time poll voting and results |
| P2P Chat | message:send, message:receive | Direct messaging between students |
| Admin Heatmap | active_users_count, new_click | Real-time traffic and click tracking |
| Notifications | notification:new | Push notifications to connected clients |

---

## Deployment & Hosting

### Frontend (Render)

- Deployed on Render: `https://evenite.onrender.com`
- Build: `react-scripts build`
- Cloudinary: `dpzhd5yvm` cloud, `evenite_uploads` preset

### Backend (Render)

- Deployed on Render: `https://evenite.onrender.com`
- All routes served under `/api/...`
- CORS: credentials + all Vercel/evenite origins
- MongoDB: lazy connect on first request (serverless-safe)

### AI Microservice

- Run: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
- SQLite DB: `ai_service/genloop.db` (auto-created)
- Uploads: `ai_service/uploads/genloop/`
- Environment: `GROQ_API_KEY`, `HF_API_TOKEN`

### Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| MONGODB_URI | Backend | MongoDB Atlas connection string |
| JWT_SECRET | Backend | JWT signing key |
| GROQ_API_KEY | Backend + AI | Groq LLM API key |
| CLOUDINARY_CLOUD_NAME | Backend | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Backend | Cloudinary API key |
| CLOUDINARY_API_SECRET | Backend | Cloudinary API secret |
| CLIENT_ORIGIN | Backend | Allowed CORS origin |
| NODEMAILER_* | Backend | SMTP email credentials |
| TWILIO_* | Backend | SMS OTP credentials |
| HF_API_TOKEN | AI Service | HuggingFace API token |
| REACT_APP_API_BASE_URL | Frontend | Backend API base URL |
| REACT_APP_CLOUDINARY_* | Frontend | Cloudinary frontend config |

---


## Testing

### Test Framework

- **E2E Testing**: Playwright (test runner)
- **Unit/Integration**: Jest + Supertest (backend)
- **Test Location**: `tests/` directory

### Test Suites

#### 1. Student Dashboard Tests (tests/student-dashboard.spec.js)

17 test cases covering the full student journey:

| # | Test |
|---|------|
| 1 | Login page renders correctly |
| 2 | Login with valid credentials redirects to dashboard |
| 3 | Explore — All events sub-tab |
| 4 | Explore — For You sub-tab |
| 5 | Explore — Trending sub-tab |
| 6 | Explore — Map view |
| 7 | Live Vibes tab |
| 8 | Near Me tab |
| 9 | Bucket List / Goals tab |
| 10 | My Events tab |
| 11 | Saved / Bookmarks tab |
| 12 | Following / Subscribed Hosts tab |
| 13 | Friends tab |
| 14 | Leaderboard tab |
| 15 | Achievements tab |
| 16 | Notifications / Updates tab |
| 17 | No uncaught runtime errors on load |

#### 2. Host Dashboard Tests (tests/host-dashboard.spec.js)

15 test cases covering the full host workflow:

| # | Test |
|---|------|
| 1 | Login page renders correctly |
| 2 | Login with host credentials redirects to dashboard |
| 3 | Events tab — loads event list and stats cards |
| 4 | Create Event form opens |
| 5 | Registrations tab loads |
| 6 | Feedback tab loads |
| 7 | Discover tab loads |
| 8 | Analytics tab loads |
| 9 | Studio tab loads |
| 10 | Certificates tab loads |
| 11 | AI Event Studio (GenLoop) tab loads |
| 12 | AI Insights tab loads |
| 13 | AI Marketing tab loads |
| 14 | Host Profile tab loads and shows form |
| 15 | No uncaught runtime errors on load |

#### 3. AI Event Generation Tests (tests/ai-event-generation.spec.js)

8 test cases with Playwright route mocking:

| # | Test |
|---|------|
| 1 | GenLoop Studio tab is accessible |
| 2 | All form fields are visible |
| 3 | Empty submit shows validation errors |
| 4 | Fill form and generate (mocked API) |
| 5 | Result shows viral score, title, publish and regenerate buttons |
| 6 | Regenerate triggers second API call (call count verified) |
| 7 | API failure (500) shows error toast |
| 8 | No uncaught runtime errors on load |

Mock response structure includes: runId, variants with variantId, predictedViralScore, posterUrl (SVG base64), textCopy (title/shortHook/descriptionHtml/callToAction/keywords/gamificationRewards/badges/urgencyTriggers/targetAudienceInsight).

#### 4. Admin Dashboard Tests (tests/admin-dashboard.spec.js)

15 test cases covering all admin panel tabs:

| # | Test |
|---|------|
| 1 | Login page renders correctly |
| 2 | Admin login redirects to admin panel |
| 3 | Dashboard tab — overview metrics load |
| 4 | Analytics tab loads charts |
| 5 | View Hosts tab loads host list |
| 6 | Host Applications tab loads |
| 7 | Verify Students tab loads |
| 8 | Manage Events tab loads event list |
| 9 | Live Traffic & Heatmap tab loads |
| 10 | Fraud & Spam tab loads |
| 11 | Financials tab loads |
| 12 | Support Hub tab loads |
| 13 | Monitor Activity tab loads |
| 14 | Notifications tab loads |
| 15 | No uncaught runtime errors on load |

### Running Tests

```bash
# E2E tests (requires running dev server on localhost:3000)
npx playwright test

# Run specific suite
npx playwright test tests/student-dashboard.spec.js

# Backend unit tests
cd server && npm test

# Backend tests with coverage
cd server && npx jest --coverage
```

---

## Key Features Summary

### For Students

1. **Event Discovery** — Browse, search (NLP smart search), filter by category/date/location
2. **AI Recommendations** — Personalized "For You" feed based on onboarding + attendance history
3. **Geolocation** — Map view and "Near Me" events using browser geolocation + MongoDB 2dsphere
4. **Registration** — One-click registration, team registration, waitlist, QR ticket
5. **Gamification** — Evolution system with 8 tiers, skill-specific XP, and seasonal leaderboards
6. **Social** — Squads (friend teams), Circles (interest groups), KNN friend suggestions, P2P chat
7. **Memories** — Post-event photo/text memories with social engagement (likes/comments)
8. **Goals** — Bucket list goals for skill development across categories
9. **Certificates** — Digital participation certificates with public verification links
10. **Live Engagement** — Real-time moderated Q&A and interactive polls
11. **Notifications** — Real-time event, social, and achievement updates
12. **Support** — AI chatbot with frustration detection and human escalation

### For Hosts

1. **Event Management** — Full CRUD with 9 event templates, co-host support, and media gallery
2. **AI GenLoop Studio** — Generate, A/B test, and optimize viral marketing content
3. **Smart Analytics** — Impression deduplication (SHA-256), funnel analysis, and engagement tracking
4. **Attendance System** — QR scanner, manual marking, and XLSX registration management
5. **Certificate Editor** — Custom template designer and bulk issuance system
6. **Live Panel** — Real-time control center for during-event Q&A and polls
7. **AI Insights** — Automated sentiment analysis and AI-generated event performance advice
8. **AI Marketing Copywriter** — Social media (Twitter, IG, LinkedIn) copy generation using Groq
9. **Discover Hub** — Cross-college event discovery to avoid schedule conflicts
10. **Custom Reviews** — Dynamically defined feedback fields per event

### For Admins

1. **Platform Metrics** — Total users, events, revenue, registrations
2. **Host Management** — Approve/reject host applications, edit/delete hosts
3. **Student Verification** — Review student ID uploads with OCR data
4. **Event Management** — Admin-level event CRUD
5. **Fraud Detection** — Review and manage fraud logs
6. **Financials** — Transaction ledger, host earnings, payout recording
7. **Live Traffic** — Real-time active users and click heatmap via Socket.IO
8. **Support Hub** — Manage escalated support tickets
9. **Notifications** — Broadcast system notifications to students/hosts

---

## Project Statistics

| Metric | Count |
|--------|-------|
| MongoDB Collections | 24 |
| Backend Route Modules | 26 |
| Backend Services | 9 |
| ML Classifiers | 3 (Bayesian, Decision Tree, KNN) |
| ML Training Scripts | 14 (Python + JS) |
| Frontend Pages | 19 (pages dir) + 6 auth/onboarding components |
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
| Supported Tones (GenLoop) | 3 (Professional, Hype, Academic) |
| Image Styles (GenLoop) | 7 (Vibrant, Minimalist, Retro, Futuristic, Illustrated, Dark, Neon) |

---

*Document generated: March 2026 | EVENITE v2.5 — Main Project (Full File Audit Complete)*
