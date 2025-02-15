import React from "react";
import IssueList from "./issueList";

type Props = {
  params: Promise<{ meetingId: string }>;
};

const MeetingDetailPage = async ({ params }: Props) => {
  const { meetingId } = await params;
  return <IssueList meetingId={meetingId} />;
};

export default MeetingDetailPage;
