# Evenite — Full Project Summary

## Overview

Evenite is a full-stack Student Event Management Platform for college students and event hosts. It combines event discovery, social networking, gamification, AI-powered content generation, and real-time engagement into a single platform. Three distinct user roles exist: **Student**, **Host**, and **Admin**, each with their own dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS, Framer Motion, Recharts, Leaflet |
| Backend | Node.js 18+, Express.js 4, Socket.io 4 |
| AI Microservice | Python 3, FastAPI 2, SQLite (WAL mode) |
| Database | MongoDB (Mongoose 7 ODM) |
| Auth | JWT (jsonwebtoken), Firebase OAuth (Google) |
| File Storage | Cloudinary (images, banners, certificates, posters) |
| LLM | Groq API — llama-3.3-70b-versatile |
| Image Generation | HuggingFace SDXL (stabilityai/stable-diffusion-xl-base-1.0) + Sharp compositing |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| SMS | Twilio |
| Real-time | Socket.io WebSockets |
| PDF | PDFKit + QRCode |
| Testing | Playwright (E2E), Jest + Supertest (unit/integration) |
| Deployment | Render (frontend, backend, AI service), Docker |

---

## Project Structure

```
/
├── client/              # React 18 frontend (Create React App)
│   ├── src/
│   │   ├── pages/       # 19 page components
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── utils/       # Axios, analytics, Cloudinary helpers
│   │   └── data/        # Static data (institutes list)
├── server/              # Node.js/Express backend
│   ├── routes/          # 25 route files
│   ├── models/          # 24 Mongoose models
│   ├── services/        # 9 service modules
│   ├── utils/           # Auth, email, SMS, encryption, Cloudinary
│   ├── controllers/     # Gamification controller
│   ├── scripts/         # Bayesian classifier training script
│   └── index.js         # App entry point
├── ai_service/          # Python FastAPI AI microservice (port 8000)
│   ├── main.py          # All API routes
│   ├── predictor.py     # 10-dim viral scoring + online gradient descent
│   ├── prompt_optimizer.py  # UCB1 template selection + EMA
│   ├── llm_service.py   # Groq API with retry + JSON salvage
│   ├── image_service.py # HF SDXL + Sharp-equivalent text overlay
│   ├── db.py            # SQLite persistence layer
│   └── genloop.db       # SQLite database
├── tests/               # Playwright E2E tests (4 files, 55 tests)
├── docker-compose.yml
├── render.yaml
└── vercel.json
```

---

## Application Routes (Frontend)

| Path | Component | Access |
|---|---|---|
| `/` | LandingPage | Public |
| `/login` | HomePage | Public |
| `/about` | About | Public |
| `/contact` | Contact | Public |
| `/register-host` | HostRegister | Public |
| `/reset-password` | PasswordReset | Public |
| `/oauth-callback` | OAuthCallback | Public |
| `/host/:hostId` | HostPage | Public |
| `/review/:eventId` | ReviewPage | Public |
| `/certificate/:id` | CertificateVerify | Public |
| `/payment-demo` | PaymentUIDemo | Public |
| `/dashboard` | Dashboard | Student / Admin / Host |
| `/host-dashboard` | HostDashboard | Host / Admin |
| `/admin` | AdminPanel | Admin only |
| `/admin/verification` | AdminVerification | Admin only |
| `/event/:eventId/live` | AttendeeLiveView | Authenticated |
| `/host/live/:eventId` | HostLivePanel | Host / Admin |
| `/profile` | Profile | Authenticated |
| `/settings` | Settings | Authenticated |
| `/profile/friends` | AllFriends | Authenticated |
| `/chat` | ChatPage | Authenticated |
| `/circles` | Circles | Authenticated |
| `/circles/:id` | CircleDetail | Authenticated |


---

## Student Dashboard (`/dashboard`)

The primary interface for students. Uses a collapsible sidebar with animated transitions.

### Sidebar Tabs

| Tab | Description |
|---|---|
| Explore | Browse all events — sub-tabs: All, For You (AI), Trending, Map |
| Live Vibes | Real-time sentiment feed from ongoing events + live chat |
| Near Me | Geolocation-based event discovery via Leaflet map |
| Bucket List | Personal event goals tracker (category + target count) |
| My Events | Registered events, attended events, ticket wallet with QR codes |
| Saved | Bookmarked events |
| Following | Events from subscribed/followed hosts |
| Friends | Friend requests, friend list, user search, squad manager, circles |
| Leaderboard | Global, seasonal, friends, and skill-based leaderboards |
| Achievements | Badges, achievements, skill XP, career readiness score |
| Updates | Notifications (friend requests, squad invites, circle invites, system) |

### Key Features

- **Smart NLP Search** — AI-powered event search via `/api/host/public/smart-search` with 800ms debounce
- **Event Detail Modal** — Full event info, registration, Razorpay payment, waiting list join
- **Ticket Wallet** — QR code tickets for registered events, PDF download
- **Calendar View** — Month/week calendar showing registered and upcoming events
- **Circles** — Interest-based communities with posts, events, and invites
- **Squads** — Small friend groups for team event registration
- **P2P Encrypted Chat** — AES end-to-end encrypted direct messaging via Socket.io
- **AI Recommendations** — Personalized event suggestions based on onboarding data and history
- **Support Chatbot** — AI-powered support with frustration detection and escalation to admin
- **Student Onboarding** — Multi-step onboarding capturing career preferences, interests, personality type

### Gamification System (PUBG-Style)

**Tiers** (season points required):

| Tier | Points |
|---|---|
| Bronze | 0 |
| Silver | 1,000 |
| Gold | 2,500 |
| Platinum | 5,000 |
| Diamond | 10,000 |
| Crown | 20,000 |
| Ace | 35,000 |
| Conqueror | 50,000 |

**Point Actions:**

| Action | Points |
|---|---|
| Register for event | +10 |
| Attend event | +50 |
| Complete profile | +100 |
| First event | +100 |
| Refer friend | +20 |
| Bookmark event | +5 |
| Write review | +15 |
| Make friend | +10 |
| Daily login | +5 |
| Subscribe to host | +25 |

**Skill XP:** Technical, Creative, Management, Social — distributed based on event category attended.

**Badges:** Socialite (bronze/silver/gold), Curator, Explorer, Critic, Dedicated, Verified Member.

**Achievements:** First Blood, Social Butterfly, Marathon Runner, Top Critic, Collector.

---

## Host Dashboard (`/host-dashboard`)

Allows event organizers to manage events, view analytics, and use AI tools.

### Sidebar Tabs

| Tab | Description |
|---|---|
| Events | Create, edit, delete events; gallery management; co-host management |
| Registrations | View/search registrations, mark attendance, export/import XLSX |
| Feedback | View event feedback, ratings, and sentiment analysis |
| Discover | Browse other hosts' events |
| Analytics | Registration trends, revenue charts, event performance metrics |
| Studio | AI Insights — Gemini-powered feedback analysis |
| Certificates | Design and issue participation certificates |
| AI Event Studio | GenLoop Studio — AI-powered event content generation |
| AI Insights | AI feedback analysis dashboard |
| AI Marketing | Marketing copywriter tool |
| Profile | Host bio, website, social links, profile/banner image |

### Event Management Features

- **9 Event Templates**: Hackathon, Workshop, Seminar, Competition, Networking, Cultural, Sports, Tech Talk, Career Fair — each with pre-filled fields, category themes, and cover images
- **Team Events**: Configurable min/max team size (e.g., Sports: 2–11, Hackathon: 2–4)
- **Co-hosts**: Search and add other hosts as co-hosts
- **Gallery**: Upload multiple images, drag-to-reorder, lightbox preview, delete individual images
- **Cover Image**: Upload directly or set from gallery
- **QR Scanner**: Camera-based QR scanner to mark student attendance
- **XLSX Export/Import**: Export registrations with attendance data; import attendance from XLSX
- **PDF Tickets**: Generate and email PDF tickets to registered students
- **Live Panel**: Real-time Q&A and polls during events via Socket.io
- **Certificate Editor**: Drag-and-drop certificate template designer with background, signature, QR code, and element positioning
- **Review Fields**: Customize feedback form fields per event (text, rating, textarea)
- **Notification Bell**: In-dashboard notifications for registrations, feedback, and system events

### Analytics Features

- Registration trends over time (Recharts LineChart)
- Revenue breakdown by event (Recharts BarChart)
- Event performance metrics (views, clicks, registrations)
- Date range filtering
- Feedback stats with sentiment analysis (Positive/Neutral/Negative)
- AI-powered feedback analysis via Gemini API

---

## Admin Dashboard (`/admin`)

Platform-wide oversight and management.

### Admin Tabs

| Tab | Description |
|---|---|
| Dashboard | Platform overview: total students, hosts, events, revenue |
| Analytics | Platform-wide analytics charts |
| View Hosts | List all approved hosts with details |
| Host Applications | Review and approve/reject pending host registrations |
| Verify Students | Review and approve/reject student ID verification documents |
| Manage Events | View, edit, delete any event on the platform |
| Live Traffic & Heatmap | Real-time active users count + click heatmap via Socket.io |
| Fraud & Spam | Review fraud logs (users, events, reviews) flagged by FraudDetector |
| Financials | Transaction history, revenue breakdown, platform fee tracking |
| Support Hub | Escalated support chat threads from students/hosts |
| Monitor Activity | Platform activity monitoring |
| Notifications | Send broadcast notifications to students, hosts, or both |

### Admin Features

- **Student ID Verification**: View uploaded student ID documents, approve/reject with email notification
- **Host Approval**: Review host registration documents, approve/reject with reason
- **Fraud Detection**: Automated flagging of suspicious users, events, and reviews
- **Broadcast Notifications**: Send system notifications to all students, all hosts, or both
- **Live Traffic**: Real-time Socket.io-powered active user count and click heatmap
- **Admin-only routes**: Protected by `requireAdmin` middleware checking `role === 'admin'`


---

## AI Features

### GenLoop Studio — Generative Viral Loop (Flagship Feature)

Generates multi-modal marketing content for events using a full AI pipeline.

**Full Generation Flow:**

1. Host fills event metadata: title, topic, audience, venue, date, tone, image style, variant count (1–5)
2. System selects best prompt template via UCB1 algorithm (exploration/exploitation)
3. LLM (Groq llama-3.3-70b-versatile) generates: title, short hook, description HTML, social posts (Twitter/Instagram/LinkedIn), keywords, gamification rewards, badges, urgency triggers, CTA, target audience insight
4. Image service generates poster: HuggingFace SDXL background art + Sharp SVG text overlay (title, hook, venue, date)
5. Engagement predictor scores each variant (0–100 viral score) using 10-dimensional weighted formula
6. All variants saved to MongoDB (ContentVariant) + GenerationRun record
7. Host compares variants in ABTestManager, selects winner
8. Feedback loop cron (every 5 min): syncs real Analytics → ContentVariant metrics → updates ML weights → records prompt template outcomes

**Dual Pipeline Architecture:**
- Primary: Python FastAPI microservice (port 8000) — full UCB1 + SQLite persistence
- Fallback: Node.js pipeline — same logic using MongoDB + in-memory weights
- Auto-detection: Node.js checks `/health` on Python service; falls back transparently

**React Components:**
- `GenLoopStudio.jsx` — Main generation UI with variant count selector, pipeline stage indicator (idle → generating-text → generating-image → scoring → done), variant grid/carousel with viral score badges, Regenerate button
- `ABTestManager.jsx` — Side-by-side variant comparison table with CTR, share rate, confidence level, Select Winner button
- `LoopIterationTimeline.jsx` — Recharts BarChart of winnerScore per loopIteration
- `ViralLoopAnalyticsPanel.jsx` — Best variant viral score, total impressions, CTR, share rate, registration conversion rate

**Engagement Signal Tracking:**
- `POST /api/genloop/track/:variantId` — records impression (deduplicated by fingerprint + 1h bucket), click, share, registration
- Orphaned signals (unknown variantId) stored with `signal: 'orphaned'` — no variant metrics affected
- Deduplication via SHA-256 hash of `variantId + viewerFingerprint + hourBucket`

**A/B Testing:**
- `GET /api/genloop/ab-status/:eventId` — per-variant metrics + confidence (insufficient_data < 30 impressions, low < 100, medium < 500, high ≥ 500)
- `POST /api/genloop/select-winner/:variantId` — sets winner, eliminates all others; returns 409 if already decided
- `GET /api/genloop/analytics/:eventId` — bestVariant, loopHistory[], aggregate metrics
- `POST /api/genloop/retrain` — batch retrain ML weights from variants with ≥ 50 impressions

### Other AI Features

| Feature | Description |
|---|---|
| AI Feedback Analysis | Gemini-powered analysis of event feedback — sentiment, themes, suggestions |
| Marketing Copywriter | AI-generated marketing copy for events (separate from GenLoop) |
| Smart NLP Search | Full-text MongoDB search with weighted fields (title×10, tags×5, category×3) |
| Event Classifier | Naive Bayes classifier — auto-categorizes events into 14 categories |
| KNN Friend Suggestions | K-Nearest Neighbors based on user interest vectors |
| Decision Tree Recommendations | Decision tree model for personalized event recommendations |
| Support Chatbot | AI chatbot with frustration detection (Low/Medium/High) and escalation to admin |

---

## MongoDB Collections (24 total)

| Collection | Purpose | Key Fields |
|---|---|---|
| `users` | All users (students, hosts, admins) | username, email, phone, role (student/host/admin), points, level, tier, seasonPoints, skillXP{technical/creative/management/social}, badges[], achievements[], gamificationStats, onboardingData, settings{notifications/privacy/ui/accessibility}, interests[], subscribedHosts[], firebaseUid, isDeleted |
| `hosts` | Host registration applications | email, documentPath, approvalStatus (pending/approved/rejected), approvedBy, rejectionReason, firebaseUid, isDeleted |
| `events` | All events | title, date, endDate, registrationDeadline, hostId, coHosts[], registrations[{studentId, squadId, status, attended}], feedbacks[{studentId, rating, comment}], waitingList[], bookmarks[], liveEngagement{isQaActive, qaList[], polls[]}, ai{posterUrl, engagementScore, keywords[]}, metrics{views, clicks, registrations}, coordinates (2dsphere), isTeamEvent, isPublished, isDeleted |
| `analytics` | Engagement tracking | eventId, hostId, type (impression/click/registration), source, userId, variantId, signal (impression/click/share/registration/orphaned), dedupeKey, timestamp |
| `contentvariants` | AI-generated content variants | variantId (unique), runId, eventId, hostId, promptTemplateId, posterUrl, imageFallback, textCopy{title, shortHook, descriptionHtml, socialPosts{twitter/instagram/linkedin}, keywords[], callToAction, gamificationRewards[], badges[], urgencyTriggers[], targetAudienceInsight}, predictedViralScore, status (active/winner/eliminated/partial/stale), metrics{impressions, clicks, shares, registrations, ctr, shareRate, registrationConversionRate}, isDeleted |
| `generationruns` | AI generation run records | runId (unique), eventId, hostId, variantCount, status (in_progress/completed/failed/stale), promptTemplateId, loopIteration, completedAt |
| `prompttemplates` | AI prompt templates | templateId (unique), promptText, tone (Professional/Hype/Academic), avgViralScore, usageCount |
| `reviews` | Event reviews | eventId, reviewerId, overallRating (1–5), reviewFields[], comment, sentimentScore, sentimentLabel (Positive/Neutral/Negative), isAnonymous, isDeleted — unique per user per event |
| `reviewfields` | Custom review form fields | eventId, fieldName, fieldType (text/rating/textarea), isRequired, placeholder, order, isDeleted |
| `transactions` | Payment records | eventId, hostId, studentId, amount, currency, platformFee, hostEarnings, type (TicketSale/Refund/Payout), status (Pending/Completed/Failed/Refunded), paymentId (Razorpay) |
| `certificates` | Issued certificates | eventId, hostId, studentId, title, studentName, hostName, institute, url, filename, issuedAt |
| `certificatetemplates` | Certificate design templates | eventId (unique), hostId, backgroundUrl, signatureUrl, studentName{x,y,fontSize,color,visible}, eventName, date, signature, qrCode — all with position/style |
| `notifications` | User notifications | userId, type (System/Friend Request/Achievement/Event/Reminder/Squad/Circle Invite), title, message, data{}, read, status (active/processed) — auto-expires after 30 days |
| `friendrequests` | Friend connections | from, to, status (pending/accepted/declined) — unique per pair |
| `messages` | P2P encrypted messages | sender, receiver, content (AES hex), iv (hex), delivered, deliveredAt, read, readAt, type (text/circle_invite), metadata{} |
| `chatthreads` | AI support chat threads | ownerType (student/host/admin), ownerId, title, messages[{role, content, at}], isEscalated, escalationStatus (Open/In-Progress/Closed), frustrationLevel (Low/Medium/High), escalationSummary, escalatedAt |
| `circles` | Interest-based communities | name, description, interestTags[], members[], admins[], events[], bannerUrl, iconColor, visibility (public/private), joinPolicy (open/request), pendingRequests[], pendingInvites[] |
| `circleposts` | Posts within circles | circleId, author, content, images[], likes[], comments[{author, content, createdAt}] |
| `squads` | Small friend groups | name, leaderId, members[], pendingMembers[], description, iconColor |
| `bookmarks` | Event bookmarks | studentId, eventId, bookmarkedAt — unique per student-event pair |
| `subscriptions` | Host follow/subscribe | studentId, hostId, subscribedAt, isActive, lastNotificationSent — unique per student-host pair |
| `goals` | Student bucket list goals | studentId, title, targetCount, category, isCompleted |
| `memories` | Event photo/text memories | eventId, studentId, type (photo/text), content, imageUrl, likes[], comments[{studentId, text}] |
| `fraudlogs` | Fraud detection logs | targetType (User/Event/Review), targetId, targetName, reason, severity (Low/Medium/High), status (Pending/Verified/Dismissed), metadata{}, flaggedBy |


---

## Server API Routes (25 route files)

| Prefix | File | Key Endpoints |
|---|---|---|
| `/api/auth` | `routes/auth.js` | POST /register, /login, /google, /verify-email, /verify-phone, /forgot-password, /reset-password, GET /me, PUT /profile, /settings, /admin/verify-student |
| `/api/host` | `routes/host.js` | CRUD events, registrations, attendance, certificates, gallery, cover, co-hosts, QR verify, XLSX export/import, PDF tickets, public events, smart-search |
| `/api/users` | `routes/users.js` | GET/PUT user profile, upload profile pic |
| `/api/friends` | `routes/friends.js` | POST /send, /accept/:id, /decline/:id, GET /list, /requests, /suggestions |
| `/api/squads` | `routes/squads.js` | CRUD squads, invite members, respond to invite |
| `/api/reviews` | `routes/reviews.js` | POST review, GET event reviews, sentiment analysis |
| `/api/bookmarks` | `routes/bookmarks.js` | POST /toggle, GET /my |
| `/api/certificates` | `routes/certificates.js` | POST /issue, GET /verify/:id, /my |
| `/api/subscriptions` | `routes/subscriptions.js` | POST /toggle, GET /my-hosts, /my-subscribers |
| `/api/support` | `routes/support.js` | POST /chat, /escalate, GET /threads, /admin/threads |
| `/api/chat` | `routes/chat.js` | AI chat threads (Gemini) |
| `/api/p2p-chat` | `routes/p2pChat.js` | Encrypted P2P messaging, message history, unread counts |
| `/api/knn` | `routes/knn.js` | GET /suggestions — KNN friend suggestions |
| `/api/bayesian` | `routes/bayesian.js` | POST /classify, /train |
| `/api/decision-tree` | `routes/decisiontree.js` | POST /recommend |
| `/api/genloop` | `routes/genloop.js` | POST /generate, /track/:variantId, /select-winner/:variantId, /retrain, /upload-poster/:variantId, GET /ab-status/:eventId, /analytics/:eventId, /ml-status, /export-feedback |
| `/api/gamification` | `routes/gamification.js` | GET /leaderboard, /my-stats, POST /award-points |
| `/api/notifications` | `routes/notifications.js` | GET /my, POST /mark-read, /broadcast (admin) |
| `/api/recommendations` | `routes/recommendations.js` | GET /for-you — personalized event recommendations |
| `/api/memories` | `routes/memories.js` | CRUD memories, like, comment |
| `/api/marketing` | `routes/marketing.js` | POST /generate — AI marketing copy (Groq) |
| `/api/goals` | `routes/goals.js` | CRUD bucket list goals |
| `/api/circles` | `routes/circles.js` | CRUD circles, join, leave, invite, posts |
| `/api/analytics` | `routes/analytics.js` | GET platform analytics (admin) |
| `/api/contact` | `routes/contact.js` | POST /contact — contact form email |

---

## Server Services (9 modules)

| Service | File | Description |
|---|---|---|
| LLM Service | `services/llmService.js` | Groq API text copy generation. `generateTextCopy(metadata, promptText, retries=2)`. Retries on JSON parse failure; JSON salvage via regex extraction. Returns `{title, shortHook, descriptionHtml, socialPosts, keywords}` |
| Multi-Modal Pipeline | `services/multiModalPipeline.js` | Orchestrates text → image → score per variant. Persists ContentVariant + GenerationRun. 3-minute timeout with partial save. Determines loopIteration by counting existing runs |
| Engagement Predictor | `services/engagementPredictor.js` | `score(features)` — 10-dim weighted formula clamped 0–100. `updateWeights(features, realizedCTR)` — EMA α=0.1. `retrain(allVariants)` — retains weights if new MAE is higher. `extractFeatures(textCopy, tone)` — builds feature vector |
| Prompt Optimizer | `services/promptOptimizer.js` | `selectTemplate(eventMetadata)` — queries PromptTemplate by tone, sorts by avgViralScore desc, seeds default if none. `recordOutcome(templateId, score)` — EMA update + usageCount++ |
| Feedback Loop | `services/feedbackLoop.js` | Cron `*/5 * * * *`. `tick()`: syncs Analytics → ContentVariant metrics, updates ML weights for runs with ≥100 impressions, marks runs completed, marks 72h zero-impression runs stale. Never mutates textCopy/posterUrl/predictedViralScore/createdAt |
| A/B Router | `services/abRouter.js` | `assignVariant(userId, runId, variantCount)` — SHA-256 hash of userId+runId, first 8 hex chars as int, modulo variantCount. Deterministic and stateless |
| Image Service | `services/imageService.js` | Phase 1: HF SDXL REST API generates background art (768×1024, 40 steps, guidance 9.0, 90s timeout). Phase 2: Sharp composites SVG text overlay (title, hook, venue, date with gradient bands). Falls back to styled gradient if HF unavailable. Saves to `/uploads/genloop/` |
| Fraud Detector | `services/fraudDetector.js` | `analyzeReview(review, user)` — blacklisted words + duplicate detection. `analyzeUser(user)` — similar phone patterns + burner email domains. `analyzeEvent(event)` — blacklisted words + excessive links (>5). All flags logged to FraudLog collection |
| Ticket Service | `services/ticketService.js` | `generatePDFTicket(event, user, registrationId)` — PDFKit A5 dark-themed PDF with event title, attendee name, QR code (JSON payload), registration ID, and Evenite branding |

---

## Server Utilities

| Utility | File | Description |
|---|---|---|
| Auth Middleware | `utils/auth.js` | `authenticateToken` — JWT verification middleware. `requireAdmin` — role check middleware |
| Cloudinary | `utils/cloudinary.js` | Multer-Cloudinary storage configs for profile pics, banners, event images, certificates |
| Email | `utils/email.js` | Nodemailer: password reset, email OTP verification, ticket delivery, host approval/rejection |
| SMS | `utils/sms.js` | Twilio: phone OTP verification |
| Encryption | `utils/encryption.js` | AES-256 encryption/decryption for P2P messages |
| Bayesian Classifier | `utils/bayesianClassifier.js` | Naive Bayes text classifier. `train(text, category)`, `classify(text)`, `getTopCategories(text, n)`, `saveModel/loadModel` |
| AI Feedback Analyzer | `utils/aiFeedbackAnalyzer.js` | Gemini API sentiment analysis for event reviews |


---

## Real-time Features (Socket.io)

`server/socket.js` handles all WebSocket events. Server runs on HTTP server wrapping Express.

### P2P Encrypted Chat Events

| Event | Direction | Description |
|---|---|---|
| `send_message` | Client → Server | Send AES-encrypted message to recipient |
| `receive_message` | Server → Client | Deliver encrypted message to recipient |
| `message_sent` | Server → Sender | Acknowledge sent message with ID |
| `message_delivered_ack` | Client → Server | Mark message as delivered |
| `mark_read` | Client → Server | Mark messages as read |
| `messages_read` | Server → Client | Notify sender of read receipt |

### Live Event Engagement Events

| Event | Direction | Description |
|---|---|---|
| `join_event_room` | Client → Server | Join event-specific Socket.io room |
| `toggle_qa` | Client → Server | Enable/disable Q&A for event (host only) |
| `ask_question` | Client → Server | Submit a question during live event |
| `new_question` | Server → Room | Broadcast new question to all attendees |
| `upvote_question` | Client → Server | Upvote a question |
| `question_upvoted` | Server → Room | Broadcast updated upvote count |
| `reply_question` | Client → Server | Host replies to a question |
| `question_answered` | Server → Room | Broadcast answer to all attendees |
| `create_poll` | Client → Server | Create a live poll |
| `poll_created` | Server → Room | Broadcast new poll to room |
| `vote_poll` | Client → Server | Cast a vote on a poll option |
| `poll_updated` | Server → Room | Broadcast updated vote counts |
| `close_poll` | Client → Server | Close a poll |

### Admin Live Traffic Events

| Event | Direction | Description |
|---|---|---|
| `join_admin_room` | Client → Server | Admin joins admin monitoring room |
| `track_click` | Client → Server | Track click coordinates for heatmap |
| `active_users_count` | Server → Admin | Broadcast real-time active user count |
| `new_click` | Server → Admin | Broadcast click data for heatmap rendering |
| `user_online` | Server → All | User presence notification |
| `user_offline` | Server → All | User disconnect notification |

---

## ML / AI Pipeline Details

### Viral Score Prediction — 10 Dimensions

| Dimension | Weight | Scoring Logic |
|---|---|---|
| w1 — Title Quality | 0.13 | Length sweet spot (30–70 chars) + power word bonus (win, hack, prize, etc.) |
| w2 — Keyword Density | 0.15 | Keywords from LLM appearing in description / total words |
| w3 — Tone Multiplier | 0.10 | Professional=0.7, Hype=1.0, Academic=0.6 |
| w4 — Social Post Quality | 0.12 | Twitter length (50–280) + hashtag count bonus |
| w5 — Historical CTR | 0.10 | Real click-through rate from Analytics collection |
| w6 — Description Richness | 0.10 | Plain text length (100–800) + paragraph structure bonus |
| w7 — CTA Urgency | 0.10 | Urgency words in call-to-action (now, limited, spots, deadline, etc.) |
| w8 — Gamification | 0.10 | Reward count / 3 + high-value keyword bonus (cash, internship, prize) |
| w9 — Badges | 0.05 | Named achievement badge count / 3 |
| w10 — Urgency Triggers | 0.05 | Scarcity trigger count / 3 |

**Weight Updates:**
- Online: EMA gradient descent on each click/registration signal (α=0.05 Python, α=0.1 Node.js)
- Weights re-normalized to sum to 1.0 after each update
- Persisted to SQLite (Python) / in-memory (Node.js)
- Batch retrain: `POST /api/genloop/retrain` — only saves if new MAE < current MAE

### Prompt Template Selection — UCB1 Algorithm (Python)

```
UCB1 score = avg_viral_score + C * sqrt(ln(total_uses) / usage_count)
```
- C = 10.0 (exploration constant)
- Seed templates for Professional, Hype, Academic tones
- avgViralScore updated via EMA (α=0.1) on each generation outcome

### Event Classifier — Naive Bayes

Trained on event title + description + tags. 14 categories: Hackathon, Workshop, Seminar, Competition, Networking, Cultural, Sports, Tech Talk, Career Fair, Education, Health, Entertainment, Social, Other. Model saved to `server/data/eventClassifierModel.json`.

### Image Generation Pipeline

1. Build prompt: `"Event poster background artwork for '{title}', Theme: {topic}, Visual focus: {categoryElements}, {styleModifier}, {toneModifier}, NO text, NO words — pure visual background only"`
2. Call HF SDXL: 768×1024, 40 inference steps, guidance scale 9.0, 90s timeout
3. If HF fails: generate styled gradient background using Sharp (7 style presets: Vibrant, Minimalist, Retro, Futuristic, Illustrated, Dark, Neon)
4. Composite SVG text overlay: title (large bold, wrapped), hook (yellow), venue + date (bottom band)
5. Save as JPEG (quality 92) to `/uploads/genloop/`

---

## Python AI Microservice (FastAPI)

Runs on port 8000. Node.js backend tries Python first; falls back to Node.js pipeline if unavailable.

### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/genloop/generate` | Full multi-modal generation pipeline |
| POST | `/api/genloop/track/:variant_id` | Track engagement signal with deduplication |
| POST | `/api/genloop/retrain` | Batch retrain ML weights |
| POST | `/api/genloop/select-winner/:variant_id` | Mark winner, eliminate others |
| GET | `/api/genloop/ab-status/:event_id` | A/B test status with confidence levels |
| GET | `/api/genloop/analytics/:event_id` | Full analytics across all loop iterations |
| GET | `/api/genloop/ml-status` | Current weights, MAE, template performance |
| GET | `/api/genloop/variant-poster/:variant_id` | Serve raw image file for Cloudinary upload |
| GET | `/health` | Health check with Groq/HF token status |

### SQLite Tables (`genloop.db`)

| Table | Description | Key Columns |
|---|---|---|
| `prompt_templates` | Prompt templates with UCB1 stats | template_id, tone, prompt_text, avg_viral_score, usage_count |
| `generation_runs` | Run metadata | run_id, event_id, host_id, variant_count, status, loop_iteration |
| `content_variants` | Generated variants with metrics | variant_id, run_id, text_copy (JSON), predicted_viral_score, impressions, clicks, shares, registrations, ctr, share_rate, reg_conv_rate |
| `analytics_events` | Raw engagement signals | variant_id, signal, dedupe_key (unique sparse), source |
| `ml_weights` | Persisted 10-dim weights + MAE | id=1 (singleton), weights (JSON), mae |


---

## Tests (Playwright E2E)

All tests in `tests/` run against `http://localhost:3000`. Config: Chromium, 90s timeout, HTML reporter, screenshots on failure.

### Test Files

| File | Tests | Coverage |
|---|---|---|
| `student-dashboard.spec.js` | 17 | Login page render, login redirect, Explore (All/For You/Trending/Map), Live Vibes, Near Me, Bucket List, My Events, Saved, Following, Friends, Leaderboard, Achievements, Updates, no runtime errors |
| `host-dashboard.spec.js` | 15 | Login, Events tab + stats, Create Event form, Registrations, Feedback, Discover, Analytics, Studio, Certificates, AI Event Studio, AI Insights, AI Marketing, Profile, no runtime errors |
| `admin-dashboard.spec.js` | 15 | Login, Dashboard metrics, Analytics, View Hosts, Host Applications, Verify Students, Manage Events, Live Traffic & Heatmap, Fraud & Spam, Financials, Support Hub, Monitor Activity, Notifications, no runtime errors |
| `ai-event-generation.spec.js` | 8 | GenLoop Studio accessibility, all form fields visible, empty submit validation, mocked API generation, viral score + title + regenerate button display, regenerate triggers 2nd API call, 500 error handling, no runtime errors |

**Total: 55 tests**

### Running Tests

```bash
# Install Playwright
npx playwright install

# Run all tests
npx playwright test

# Run specific file
npx playwright test tests/student-dashboard.spec.js

# View HTML report
npx playwright show-report
```

---

## Deployment

### Live Production URLs

| Service | URL | Platform |
|---|---|---|
| Frontend | https://evenite1.onrender.com | Render |
| Backend API | https://evenite.onrender.com | Render |
| AI Microservice | https://ai-buwx.onrender.com | Render |

### Frontend (Render)

- React app deployed to Render at **https://evenite1.onrender.com**
- `client/.env.production` — `REACT_APP_API_BASE_URL=https://evenite.onrender.com`
- `client/.env.production` — `REACT_APP_OAUTH_START_URL=https://evenite.onrender.com/api/auth/google`

### Backend (Render)

- Node.js/Express deployed to Render at **https://evenite.onrender.com**
- `render.yaml` — Render.com deployment config (Node 18, `npm start`)
- `server/Dockerfile` — Docker container for self-hosting
- CORS configured to allow requests from `https://evenite1.onrender.com`

### AI Service (Render)

- FastAPI microservice deployed to Render at **https://ai-buwx.onrender.com**
- Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Node.js backend health-checks `https://ai-buwx.onrender.com/health` before routing; falls back to Node.js pipeline if unavailable
- `ai_service/start.ps1` — PowerShell startup script (local dev)
- `ai_service/requirements.txt` — Python deps: fastapi, uvicorn, httpx, pillow, pydantic

### Docker

- `docker-compose.yml` — Client container on port 3000
- `client/Dockerfile` — React app container

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string (required) |
| `JWT_SECRET` | JWT signing secret (required) |
| `CLIENT_ORIGIN` | Frontend URL for CORS |
| `PORT` | Server port (default 5000) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GROQ_API_KEY` | Groq LLM API key |
| `HF_API_TOKEN` | HuggingFace API token for SDXL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `EMAIL_HOST` | SMTP host (e.g. smtp.gmail.com) |
| `EMAIL_USER` | SMTP email address |
| `EMAIL_PASS` | SMTP password / app password |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `AI_SERVICE_URL` | Python service URL (production: https://ai-buwx.onrender.com, local: http://localhost:8000) |
| `GEMINI_API_KEY` | Google Gemini API key for feedback analysis |

### AI Service (`ai_service/.env`)

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq LLM API key |
| `HF_API_TOKEN` | HuggingFace token for SDXL image generation |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_BASE_URL` | Backend API base URL (production: https://evenite.onrender.com) |
| `REACT_APP_OAUTH_START_URL` | Google OAuth start URL (production: https://evenite.onrender.com/api/auth/google) |
| `REACT_APP_FIREBASE_API_KEY` | Firebase API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID |

---

## Key Client-Side Hooks & Utilities

| File | Description |
|---|---|
| `hooks/useCloudinary.js` | Cloudinary direct upload hook |
| `hooks/useDecisionTree.js` | Decision tree recommendation hook |
| `hooks/useEventClassifier.js` | Bayesian event classifier hook |
| `utils/api.js` | Axios instance with base URL from config |
| `utils/analytics.js` | Frontend analytics event logging |
| `utils/cloudinary.js` | Cloudinary URL transformation helpers |
| `utils/imageUtils.js` | Image processing utilities |
| `utils/openRazorpay.js` | Razorpay payment modal opener |
| `config.js` | API base URL config (reads from env) |
| `axiosConfig.js` | Global Axios interceptors |

---

## Key Client Components

| Component | Description |
|---|---|
| `GamifiedComponents.jsx` | GamifiedEventCard, AchievementBadge, BadgeCard, LevelProgress, StatsCard, Leaderboard, SkillLeagues, EVENT_THEMES |
| `EventDetailModal.jsx` | Full event detail with registration, Razorpay payment, waiting list |
| `EventMap.jsx` | Leaflet map showing events near user |
| `EventsNearMe.jsx` | Geolocation-based event discovery |
| `TicketWallet.jsx` | QR code ticket display and PDF download |
| `QRCodeScanner.jsx` | Camera-based QR scanner for attendance marking |
| `CertificateEditor.jsx` | Drag-and-drop certificate template designer |
| `AiFeedbackDashboard.jsx` | Gemini-powered feedback analysis display |
| `SupportChatbot.jsx` | Floating AI support chatbot with frustration detection |
| `ModernPaymentUI.jsx` | Razorpay payment UI component |
| `GlobalTrafficTracker.jsx` | Sends click events to admin via Socket.io for heatmap |
| `BadgeDetailModal.jsx` | Badge detail, progress, and unlock criteria display |
| `chat/ChatInterface.jsx` | P2P encrypted chat interface |
| `chat/ChatOverlay.jsx` | Floating chat overlay (persistent across routes) |
| `chat/DashboardChat.jsx` | Dashboard-embedded chat component |
| `dashboard/LiveSentimentFeed.jsx` | Real-time event sentiment feed |
| `dashboard/BucketListGoals.jsx` | Student goal tracker UI |
| `friends/FriendsList.jsx` | Friend list with online status indicators |
| `friends/FriendsSuggestions.jsx` | KNN-based friend suggestions |
| `friends/UserSearch.jsx` | Search users by name/email |
| `friends/UserProfileModal.jsx` | View user profile, send friend request |
| `friends/FriendRequests.jsx` | Incoming friend request management |
| `friends/InterestsEditor.jsx` | Edit user interests for better suggestions |
| `squads/SquadManager.jsx` | Create/manage squads, invite members |
| `circles/InviteFriendsModal.jsx` | Invite friends to a circle |
| `host/GenLoopStudio.jsx` | AI event content generation UI with variant grid |
| `host/ABTestManager.jsx` | A/B variant comparison table with Select Winner |
| `host/LoopIterationTimeline.jsx` | Recharts BarChart of generation run history |
| `host/ViralLoopAnalyticsPanel.jsx` | Viral loop analytics dashboard |
| `host/MarketingCopywriter.jsx` | AI marketing copy generation tool |
| `admin/SupportEscalationHub.jsx` | Admin support ticket management |
| `events/MemoriesHub.jsx` | Event photo/text memories hub |

---

## Fraud Detection

The `FraudDetector` service (`server/services/fraudDetector.js`) automatically flags:

**Reviews:**
- Blacklisted words: crypto, investment, casino, betting, win money, sex, viagra, lottery
- Duplicate review content from same user within 24 hours

**Users:**
- 3+ accounts with similar phone number prefix (first 7 digits) created within 1 hour
- Burner email domains: tempmail.com, 10minutemail.com, guerrillamail.com

**Events:**
- Blacklisted words in title or description
- More than 5 external links in description

All flags logged to `fraudlogs` collection with severity (Low/Medium/High) and status (Pending/Verified/Dismissed). Admin reviews via Fraud & Spam tab.

---

## Cron Jobs

| Job | Schedule | File | Description |
|---|---|---|---|
| Feedback Loop | `*/5 * * * *` (every 5 min) | `services/feedbackLoop.js` | Syncs Analytics → ContentVariant metrics, updates ML weights for runs with ≥100 impressions, marks runs completed, marks 72h zero-impression runs stale |
| Seasonal Reset | Monthly (manual trigger) | `routes/gamification.js` | Resets seasonPoints for all users at season end |

---

## Security

| Measure | Implementation |
|---|---|
| JWT Authentication | All protected routes require `Authorization: Bearer <token>` |
| Password Hashing | bcrypt (rounds: 10) |
| P2P Message Encryption | AES-256 with per-message IV |
| Rate Limiting | `express-rate-limit` on auth routes |
| Security Headers | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |
| CORS | Manual CORS middleware — allowlist + Render domain detection |
| Firebase OAuth | Google sign-in via Firebase SDK |
| OTP Verification | Email OTP (Nodemailer) + Phone OTP (Twilio) |
| Admin Protection | `requireAdmin` middleware checks `role === 'admin'` |
| Soft Delete | `isDeleted` flag on users and events — no hard deletes |
| Input Validation | Zod schemas on critical routes |
| Fraud Detection | Automated flagging of suspicious content and users |

---

## Data Flow — Event Registration

```
Student clicks Register
  → EventDetailModal → POST /api/host/events/:id/register
  → If paid: openRazorpay() → Razorpay payment modal
  → On success: POST /api/host/events/:id/register with paymentId
  → Server: creates registration, creates Transaction, awards +10 points
  → Server: sends PDF ticket via email (ticketService + nodemailer)
  → Server: emits Socket.io notification to host
  → Client: shows success toast + updates ticket wallet
```

## Data Flow — GenLoop Generation

```
Host fills GenLoopStudio form
  → POST /api/genloop/generate
  → Server checks Python service health
  → If Python available: proxy to FastAPI /api/genloop/generate
    → UCB1 selects prompt template
    → Groq LLM generates text copy (retry + JSON salvage)
    → HF SDXL generates background art
    → Sharp composites text overlay
    → Predictor scores variant (0–100)
    → Saves to SQLite
  → If Python unavailable: Node.js pipeline
    → promptOptimizer.selectTemplate()
    → llmService.generateTextCopy()
    → imageService.generatePoster()
    → engagementPredictor.score()
    → Saves to MongoDB
  → Returns {runId, loopIteration, variants[]}
  → Client displays variant grid with viral score badges
  → Host selects winner → POST /api/genloop/select-winner/:variantId
  → Feedback loop cron updates weights every 5 minutes
```

