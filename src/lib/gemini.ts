import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAi.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const summarizeCommit = async (diff: string) => {
  console.log(
    `[summarizeCommit] Calling gemini-2.5-flash, diff size: ${diff.length} chars`,
  );
  try {
    const response = await model.generateContent([
      `You are an expert programmer, and you are trying to summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example) :
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aadf691. .bfef603 100644
---a/lib/index.js
+++b/lib/index.js
\`\`\`
This means that \`lib/index. js\` was modified in this commit. Note that this is only an example..
Then there is a specifier of the lines that were modified.
A line starting with \` + \` means it was added.
A line that starting with \` - \` means that line was deleted.
A line that starts with neither nor \` - \` nor \` + \` is code given for context and better understanding.
It is not part of the diff.
[...]
EXAMPLE SUMMARY COMMENTS:
\`\`\`
* Raised the amount of returned recordings from \`10\` to \` 100\` [packages/server/recordings_api.ts],[packages/server/constants.ts]
* Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
* Moved the \`octokit\` initialization to a separate file [src/octokit.ts] [src/index.ts],
* Added an OpenAI API for completions [packages/utils/apis/openai.ts]
* Lowered numeric tolerance for test files
\`\`\
Most commits will have less comments than this examples list.
The last comment does not include the file names ,
Because there were more than two relevant files in the hypothetical commit .
To not include parts of the example 'in your summary .
It is given only as an example of appropriate comments.`,
      `Please summarise the following diff file: \n\n${diff}`,
    ]);
    const text = response.response.text();
    console.log(`[summarizeCommit] OK — summary length: ${text.length} chars`);
    return text;
  } catch (err) {
    console.error(`[summarizeCommit] FAILED:`, err);
    throw err;
  }
};

export const summariseCode = async (doc: Document) => {
  console.log(`[summariseCode] Summarising: ${doc.metadata.source}`);
  try {
    const code = doc.pageContent.slice(0, 10000);
    if (!code || code.trim().length === 0) {
      console.warn(
        `[summariseCode] Skipping empty/whitespace-only file: ${doc.metadata.source}`,
      );
      return "Empty file";
    }
    const response = await model.generateContent([
      `You are an expert senior software engineer who specializes in onboarding junior software engineers onto projects`,
      `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
        Here is the code:
        ---
        ${code}
        ---
        Give a summary no more than 100 words for the code above
      `,
    ]);
    const text = response.response.text();
    console.log(`[summariseCode] OK: ${doc.metadata.source}`);
    return text || "No summary generated";
  } catch (err) {
    console.error(`[summariseCode] FAILED for ${doc.metadata.source}:`, err);
    throw err;
  }
};

export async function loadEmbedding(summary: string) {
  if (!summary || summary.trim().length === 0) {
    console.warn(
      `[loadEmbedding] Called with empty text, returning zero vector`,
    );
    return new Array(768).fill(0);
  }
  console.log(`[loadEmbedding] Embedding text of length: ${summary.length}`);
  try {
    const embeddingModel = genAi.getGenerativeModel({
      model: "gemini-embedding-001",
    });
    // SDK v0.21 doesn't support outputDimensionality, so we truncate to 768
    // to match the existing vector(768) Postgres column
    const result = await embeddingModel.embedContent(summary);
    const values = result.embedding.values.slice(0, 768);
    console.log(`[loadEmbedding] OK — ${values.length} dims`);
    return values;
  } catch (err) {
    console.error(`[loadEmbedding] FAILED:`, err);
    throw err;
  }
}

// console.log(await loadEmbedding("Hello world!"));
