import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
  meetingUrl: z.string(),
  projectId: z.string(),
  meetingId: z.string(),
});

export const maxDuration = 60; //5 minutes

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { meetingUrl, projectId, meetingId } = bodyParser.parse(body);
    const { summaries } = await processMeeting(meetingUrl);

    await db.issue.createMany({
      data: summaries?.map((summary, index) => ({
        meetingId,
        start: summary.startTime,
        end: summary.endTime,
        gist: summary.gist,
        headline: summary.headline,
        summary: summary.summary,
      })),
    });

    await db.meeting.update({
      where: { id: meetingId },
      data: { status: "COMPLETED", name: summaries[0]!.headline },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
