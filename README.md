# OwnYourCode AI

**Your codebase, understood.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-398CCB?logo=trpc)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Gemini-API-4285F4?logo=google)](https://ai.google.dev/)

---

Connect your GitHub repository and start asking questions about your code. Our AI indexes your codebase, answers questions about any file or function, and reviews every pull request automatically — grounded entirely in your actual code, not a generic model's assumptions. It works across any repo size, supports private repositories, and stores none of your code after indexing.

---

## Architecture

```mermaid
graph LR
    A[GitHub Repo] -->|webhook + REST| B[Indexing Pipeline]
    B -->|chunk + embed| C[Vector Store]
    C -->|semantic retrieval| D[RAG Query Engine]
    D -->|Gemini API| E[AI Review Output]
    E -->|PR comment / Q&A| F[Developer]
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15, Tailwind CSS, shadcn/ui |
| **API** | tRPC, Next.js App Router |
| **Auth** | Clerk |
| **Database** | PostgreSQL (Neon), Prisma ORM |
| **AI** | Google Gemini, Langchain.js |
| **Storage** | Firestore (embeddings) |

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/yourusername/ownyourcode-ai.git
cd ownyourcode-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in your API keys. See `.env.example` for required variables.

### 4. Set up the database

```bash
npx prisma db push
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Pre-configured for [Vercel](https://vercel.com). Set the same environment variables from `.env` in your Vercel project settings, then deploy.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
