# INTERVIEWOS ⚡

> **An Autonomous AI-Powered Adaptive Interview Platform**  
> Built for the Next-Generation Hiring Frontier.

---

## 🌟 The Defining Product Principle

> *"The AI should not simply ask questions about a resume. It should continuously investigate the evidence behind the candidate's claims and dynamically decide what it needs to know next."*

---

## 🎯 Core Capabilities

1. **Profile-Aware Questioning & Resume Knowledge Map**:
   - Parses candidates' uploaded resumes and recruiter job specifications.
   - Extracts structured claims: skills, claimed levels, projects, metrics, and architecture claims.
   - Initializes a real-time **Resume Coverage Engine** (VERIFIED, PARTIALLY_VERIFIED, NOT_VERIFIED, CONTRADICTED).

2. **Conversational & Adaptive Voice Interview**:
   - Spoken dialogue pipeline using native Web Speech APIs (STT + TTS).
   - Dynamic animated AI interviewer presence (`AIInterviewerOrb`) with real-time waveform visualizer.
   - State-driven question emergence — no rigid Q1 → Q2 → Q3 scripts.

3. **Multi-Dimensional Knowledge Depth Engine (1–5 Scale)**:
   - **Level 1 (Awareness)**: Buzzwords and conceptual naming.
   - **Level 2 (Fundamentals)**: Standard syntax and basic usage.
   - **Level 3 (Practical Application)**: Production experience, error handling, config mechanics.
   - **Level 4 (Problem Solving)**: Failover, cache stampedes, concurrency, edge cases.
   - **Level 5 (Deep Architecture)**: Internal mechanics, source-code trade-offs, disaster recovery.

4. **Reasoning-Based Interview Integrity Monitoring**:
   - **Personal Timing Baseline**: Calibrates the candidate's natural latency and pause distribution during $Q_1$ and $Q_2$. Subsequent latencies are compared using rolling Z-scores.
   - **Strict Non-Accusatory Rule**: Soft observations only — **NEVER** outputs *"CHEATING DETECTED"*.
   - **Cross-Question Consistency**: Compares claims across turns to flag subtle discrepancies (e.g. 50k users vs 200 users) and synthesizes non-accusatory clarification prompts.
   - **Browser Telemetry**: Inconspicuously captures tab visibility, window blur, and fullscreen changes.
   - **Tamper-Evident SHA-256 Hash Chain**: Every milestone (session initialization, question generation, answer submission, integrity event, session completion) is cryptographically linked with SHA-256 blocks for verifiable mathematical proof of zero-tampering.

---

## 🚀 Quickstart Guide

### 1. Requirements
- Node.js `v20+` or `v24+` (Current: Node 24 LTS)
- npm `10+` or `11+`

### 2. Environment Setup
The project uses **Prisma with SQLite** by default for zero-setup, dependency-free local execution. To switch to PostgreSQL, simply update `DATABASE_URL` in `.env`.

```bash
# In C:\Users\poojitha\.gemini\antigravity\scratch\interviewos
npm run db:push
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Automated Tests
```bash
node --test tests/unit/hash_chain.test.js tests/unit/baseline_engine.test.js
```

---

## 🏛️ Architecture Overview

```
src/
├── app/
│   ├── candidate/
│   │   ├── setup/page.tsx         # Resume upload & Job selection
│   │   ├── prep/page.tsx          # Audio hardware test & baseline briefing
│   │   ├── room/[id]/page.tsx     # Live Adaptive Spoken Interview Cockpit
│   │   └── results/[id]/page.tsx  # Candidate completion debrief
│   ├── recruiter/
│   │   ├── dashboard/page.tsx     # Fleet management & candidate directory
│   │   └── interview/[id]/page.tsx# Deep-dive 1-5 matrix, transcripts & hash chain
│   └── api/
│       ├── resume/parse/route.ts
│       └── interviews/[id]/
│           ├── start/route.ts
│           ├── answer/route.ts    # Core evaluation, depth scoring & next question
│           ├── integrity-event/route.ts
│           ├── complete/route.ts
│           └── audit-chain/route.ts
├── components/
│   ├── common/                    # GlassPanel, NeonBadge, Navbar
│   ├── interview/                 # AIInterviewerOrb, AudioWaveform, SpeechController, TelemetryMonitor
│   └── recruiter/                 # KnowledgeMapMatrix, ConsistencyAuditCard, HashChainViewer
├── lib/
│   ├── ai/                        # Claude 3.5 Sonnet client + deterministic simulator fallback
│   ├── crypto/hash_chain.ts       # Cryptographic SHA-256 block ledger
│   ├── engine/                    # State machine, 1-5 depth engine, coverage engine
│   └── integrity/                 # Baseline rolling Z-score & language analyzer
└── prisma/
    ├── schema.prisma              # Database schema
    └── seed.js                    # Seed data
```

---

## 🔒 Security Tenets
- Candidate speech and text are treated as **untrusted input**.
- Prompts are strictly fenced against prompt injection.
- Zero client-side trust for scores, depth levels, or integrity signals.
- All session blocks are verified using `AuditHashBlock` SHA-256 mathematical proofs.
