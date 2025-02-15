import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

const msToTime = (ms: number) => {
  const seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const processMeeting = async (meetingUrl: string) => {
  const transcript = await client.transcripts.transcribe({
    audio: meetingUrl,
    auto_chapters: true,
  });

  const summaries =
    transcript.chapters?.map((chapter) => ({
      startTime: msToTime(chapter.start),
      endTime: msToTime(chapter.end),
      summary: chapter.summary,
      headline: chapter.headline,
      gist: chapter.gist,
    })) || [];
  if (!transcript.text) throw new Error("No transcript found");

  return { summaries };
};

const FILE_URL = "https://assembly.ai/sports_injuries.mp3";
const res = await processMeeting(FILE_URL);
console.log(res);
