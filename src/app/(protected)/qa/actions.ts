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

export async function askChatBot(
  question: string,
  projectId: string,
  prevMessages: { role: string; content: string }[] = [],
  mode: "learn" | "interview" = "learn",
) {
  const stream = createStreamableValue();

  try {
    const queryVector = await loadEmbedding(question);
    const vectorQuery = `[${queryVector.join(",")}]`;

    const result = (await db.$queryRaw`
      SELECT "fileName","sourceCode","summary",
      1 - ("summaryEmbeddings" <=> ${vectorQuery} :: vector)  AS similarity
      FROM "SourceCodeEmbeddings"
      WHERE 1 - ("summaryEmbeddings" <=> ${vectorQuery} :: vector) > .5
      AND "projectId" = ${projectId}
      ORDER BY similarity DESC
        LIMIT 10
    `) as { fileName: string; sourceCode: string; summary: string }[];

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

    return { output: stream.value, filesReferences: finalResult };
  } catch (error) {
    console.error("Critical error in askChatBot:", error);
    // Even if it fails early, we can return the stream value so the frontend can read the error message we inject
    stream.update(
      "An internal error occurred while processing your request. Please check the server logs.",
    );
    stream.done();
    return { output: stream.value, filesReferences: [] };
  }
}
