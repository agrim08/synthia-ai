import React from "react";

type Props = {
  params: Promise<{ meetingId: string }>;
};

const MeetingDetailPage = async ({ params }: Props) => {
  const { meetingId } = await params;
  return <div></div>;
};

export default MeetingDetailPage;
