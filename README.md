# Synthia AI — Intelligent Code Companion

[![T3 Stack](https://img.shields.io/badge/stack-T3%20Stack-blue.svg)](https://create.t3.gg/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> *"Developers spend 35% of their time understanding code rather than writing it. Synthia flips this ratio."*

**Synthia AI** is an AI-powered GitHub assistant that understands your codebase, analyzes commits, and answers technical questions through natural language — so your team spends less time reading code and more time writing it.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Why Synthia AI?](#why-synthia-ai)
- [Deployment](#deployment)

---

## Features

| Feature | Description |
|---------|-------------|
| **AI Code Analysis** | Automatic summaries of your latest 15 commits |
| **Precision Q&A** | RAG pipeline powered by Gemini API & Langchain.js |
| **Meeting Intelligence** | Audio processing and transcription via AssemblyAI |
| **Multi-Project Management** | Team collaboration with access controls via Clerk |
| **Credit System** | Pay-as-you-go analysis at ₹1 per file |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14, Shadcn/ui, Tailwind CSS |
| **Backend** | tRPC, Prisma, Clerk |
| **Database** | PostgreSQL, Neon DB, Firestore |
| **AI** | Google Gemini, Langchain.js, AssemblyAI |

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/synthia-ai.git
cd synthia-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your API keys and configuration values.

### 4. Start the development server

```bash
npm run dev
```

Your app will be running at `http://localhost:3000`.

---

## Why Synthia AI?

Most developer tools help you write code faster — Synthia helps you **understand it faster**.

- **Context-Aware** — Learns project-specific patterns from your actual codebase, not generic examples
- **Zero Hallucination** — Every answer is grounded in your real code, not guesswork
- **Team Ready** — Collaborative workspaces with role-based access controls built in

---

## Deployment

Synthia AI is pre-configured for one-click deployment on **Vercel**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

> ⭐ **Star this repo** if Synthia makes your developer life easier!
