"use server";

// maxDuration is set in (protected)/layout.tsx (60s) — it cascades to
// server actions invoked from pages under that layout segment.

import { streamText, generateObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { loadEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ─── Conversational Classifier ──────────────────────────────────────────────
// Zero API calls, pure heuristic. Runs in <1ms.
// Returns true if the message is simple chit-chat that doesn't need RAG.

const CONVERSATIONAL_PATTERNS = [
  // greetings
  /^(hi|hey|hello|howdy|sup|what'?s up|yo)\b/i,
  // acknowledgements
  /^(ok|okay|got it|sure|alright|cool|noted|understood|thanks?|thank you|thx|ty|cheers|great|awesome|nice|perfect|sounds good|makes sense)\b/i,
  // yes/no
  /^(yes|no|nope|yep|yup|nah|definitely|absolutely|of course|not really)\b/i,
  // farewells
  /^(bye|goodbye|see you|see ya|later|cya|take care|good night|gn)\b/i,
  // filler / affirmation
  /^(wow|hmm|interesting|i see|i understand|got it|fair enough|lol|haha|hehe)\b/i,
];

// Words that strongly indicate a technical code question — always use RAG
const TECHNICAL_SIGNALS = [
  "function", "class", "method", "variable", "import", "export",
  "component", "hook", "api", "route", "endpoint", "database", "schema",
  "prisma", "query", "mutation", "state", "context", "auth", "middleware",
  "error", "bug", "fix", "why", "how", "what does", "explain", "show me",
  "where is", "where does", "how does", "can you", "what is the", "tell me",
  "which file", "how to", "implement", "architecture", "flow", "logic",
  "code", "type", "interface", "props", "return", "async", "await", "fetch",
  "deploy", "build", "test", "env", "config", "setup",
];

function isConversationalMessage(question: string): boolean {
  const trimmed = question.trim();

  // If it's too long, it's probably a real question (>12 words)
  if (trimmed.split(/\s+/).length > 12) return false;

  // If it contains any technical signals, use RAG
  const lower = trimmed.toLowerCase();
  if (TECHNICAL_SIGNALS.some((t) => lower.includes(t))) return false;

  // Check conversational patterns
  return CONVERSATIONAL_PATTERNS.some((p) => p.test(trimmed));
}

// ─── Fast conversational path (no RAG, no embeddings) ───────────────────────

async function askConversational(
  question: string,
  prevMessages: { role: string; content: string }[],
) {
  const stream = createStreamableValue();

  const conversationHistory = prevMessages.length > 0
    ? prevMessages.map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}:\n${m.content}`).join("\n\n")
    : "";

  const { textStream } = await streamText({
    model: google("gemini-2.0-flash-lite"),
    prompt: `You are a friendly, warm AI assistant embedded in a code intelligence tool called OwnYourCode.
Keep replies concise, natural and conversational — 1 to 3 sentences max.
Never over-explain. Match the user's energy.

${conversationHistory ? `CONVERSATION SO FAR:\n${conversationHistory}\n\n` : ""}USER: ${question}
ASSISTANT:`,
  });

  (async () => {
    try {
      for await (const delta of textStream) {
        stream.update(delta);
      }
    } catch {
      stream.update("Sorry, something went wrong.");
    } finally {
      stream.done();
    }
  })();

  return { output: stream.value, filesReferences: [], isConversational: true };
}

// ─── Full RAG pipeline ───────────────────────────────────────────────────────

export async function askChatBot(
  question: string,
  projectId: string,
  prevMessages: { role: string; content: string }[] = [],
  mode: "learn" | "interview" = "learn",
) {
  // Fast path — skip embeddings, vector search, and smart filtering entirely
  if (isConversationalMessage(question)) {
    return askConversational(question, prevMessages);
  }

  const stream = createStreamableValue();

  try {
    // Step 1: embed question for vector search
    const queryVector = await loadEmbedding(question);
    const vectorQuery = `[${queryVector.join(",")}]`;

    // Step 2: semantic similarity search
    const result = (await db.$queryRaw`
      SELECT "fileName","sourceCode","summary",
      1 - ("summaryEmbeddings" <=> ${vectorQuery} :: vector)  AS similarity
      FROM "SourceCodeEmbeddings"
      WHERE 1 - ("summaryEmbeddings" <=> ${vectorQuery} :: vector) > .5
      AND "projectId" = ${projectId}
      ORDER BY similarity DESC
        LIMIT 10
    `) as { fileName: string; sourceCode: string; summary: string }[];

    // Step 3: LLM-based relevance filtering
    let finalResult = result.slice(0, 3);
    try {
      const { object: filteredIndices } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: z.object({
          indices: z.array(z.number()),
        }),
        prompt: `
        You are a technical architect filtering code files for relevance.
        USER QUESTION: "${question}"
        
        VECTOR SEARCH RESULTS:
        ${result.map((doc, i) => `${i}. [${doc.fileName}]: ${doc.summary}`).join("\n")}
        
        TASK:
        Identify the indices of the files that are STRICTLY RELEVANT to answering this specific question.
        Remove files that are not helpful.
        Return the indices of the relevant files as an array of numbers.
        `,
      });

      const relevantFiles = filteredIndices.indices
        .map((i) => result[i])
        .filter((f): f is (typeof result)[0] => !!f);

      finalResult = relevantFiles;
    } catch (err) {
      console.error("Smart filtering failed in askChatBot", err);
    }

    // Step 4: build context block
    let context = "";
    for (const doc of finalResult) {
      context += `source: ${doc?.fileName}\ncodeContent:\n${doc?.sourceCode}\nsummary of file: ${doc?.summary}\n\n`;
    }

    let conversationHistory = "";
    if (prevMessages.length > 0) {
      conversationHistory = prevMessages
        .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
        .join("\n\n");
    }

    const interviewModeInstructions = mode === "interview" ? `

--- INTERVIEW MODE ACTIVATED ---
You are now acting as a friendly, experienced technical interviewer and mentor.
Your goal is to help the user deeply understand this codebase so they can confidently explain and defend it in a real technical interview.

COMMUNICATION STYLE:
- Be warm, encouraging, and human. Never robotic or overly formal.
- Use simple, clear vocabulary. Avoid unnecessary jargon.
- Keep paragraphs short. Use bullet points and headers liberally.
- Speak like a senior engineer mentoring a junior one.

STRUCTURE your responses using these sections where relevant:
### 💡 Core Concept
Explain the core idea simply, like you're talking to a smart beginner.

### 🔍 Why This Approach?
Explain the reasoning and trade-offs behind the implementation decision.

### 🏗️ Step-by-Step Breakdown
Walk through the logic flow step by step.

### 🌍 Real-World Analogy
Use a simple, relatable analogy to make it click.

### 🎯 Possible Interview Follow-Ups
List 2-3 follow-up questions an interviewer might ask next.

### ⚠️ Common Mistakes
Point out what developers often get wrong with this concept.

BEHAVIOR:
- If the user gives a shallow answer, gently point out what is missing and explain it.
- Ask a thoughtful follow-up question at the end of your response to keep the conversation going.
- Focus on architecture, trade-offs, data flow, and design decisions.
- Help the user build genuine understanding, not just memorization.
--- END INTERVIEW MODE ---
` : "";

    // Step 5: stream the answer
    const { textStream } = await streamText({
      model: google("gemini-2.5-flash"),
      prompt: `
      You are an AI code assistant who answers questions about the codebase. Your target audience is a technical user.
      The AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      ${interviewModeInstructions}
      START BASE CONTEXT BLOCK (Relevant Code Search Results)
      ${context}
      END BASE CONTEXT BLOCK

      START PREVIOUS CONVERSATION HISTORY
      ${conversationHistory || "No previous history."}
      END PREVIOUS CONVERSATION HISTORY

      START LATEST QUESTION
      ${question}
      END LATEST QUESTION

      The AI assistant will take into account the PREVIOUS CONVERSATION HISTORY and BASE CONTEXT BLOCK.
      If the context does not provide an answer, use your best software engineering knowledge, but don't invent code that definitively isn't there if asked about specific internal logic.
      Answers should be provided in Markdown syntax, with code snippets if needed. Responses should be as detailed as possible, ensuring clarity and accuracy while avoiding unnecessary or misleading information.
      `,
    });

    (async () => {
      try {
        for await (const delta of textStream) {
          stream.update(delta);
        }
      } catch (e) {
        console.error("Error streaming text in askChatBot:", e);
        stream.update(
          "\n\nI'm sorry, I ran into an error while streaming the response.",
        );
      } finally {
        stream.done();
      }
    })();

    return { output: stream.value, filesReferences: finalResult, isConversational: false };
  } catch (error) {
    console.error("Critical error in askChatBot:", error);
    stream.update(
      "An internal error occurred while processing your request. Please check the server logs.",
    );
    stream.done();
    return { output: stream.value, filesReferences: [], isConversational: false };
  }
}
