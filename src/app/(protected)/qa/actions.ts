"use server";

import { streamText, generateObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { loadEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askChatBot(question: string, projectId: string, prevMessages: { role: string; content: string }[] = []) {
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
        model: google("gemini-1.5-flash"),
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

      if (relevantFiles.length > 0) {
        finalResult = relevantFiles;
      }
    } catch (err) {
      console.error("Smart filtering failed in askChatBot", err);
    }

    let context = "";
    for (const doc of finalResult) {
      context += `source: ${doc?.fileName}\ncodeContent:\n${doc?.sourceCode}\nsummary of file: ${doc?.summary}\n\n`;
    }

    let conversationHistory = "";
    if (prevMessages.length > 0) {
      conversationHistory = prevMessages.map(m => `${m.role.toUpperCase()}:\n${m.content}`).join("\n\n");
    }

    (async () => {
      try {
        const { textStream } = await streamText({
          model: google("gemini-1.5-flash"),
          prompt: `
      You are an AI code assistant who answers questions about the codebase. Your target audience is a technical user.
      The AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.

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

        for await (const delta of textStream) {
          stream.update(delta);
        }
      } catch (e) {
        console.error("Error asking question", e);
        stream.update(
          "I'm sorry, I ran into an error processing your request.",
        );
      } finally {
        stream.done();
      }
    })();

    return { output: stream.value, filesReferences: finalResult };
  } catch (error) {
    console.error("Critical error in askChatBot:", error);
    // Even if it fails early, we can return the stream value so the frontend can read the error message we inject
    stream.update("An internal error occurred while processing your request. Please check the server logs.");
    stream.done();
    return { output: stream.value, filesReferences: [] };
  }
}
