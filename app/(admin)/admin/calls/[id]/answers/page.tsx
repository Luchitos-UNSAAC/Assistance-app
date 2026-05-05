import React from "react";
import { getAnswersByCallId } from "@/features/calls/actions/get-answers-by-call-id";
import {getSchedulesByCallId} from "@/features/calls/actions/get-schedules-by-call-id";
import CallAnswersTabs from "@/features/calls/components/call-answers-tabs";
import {getCallById} from "@/features/calls/actions/get-call-by-id";

interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function CallAnswersPage({ params }: PageProps) {
  const resolved = (await params) as { id: string };
  const callId = resolved.id;
  
  const [call, answersData, schedulesData] = await Promise.all([
    getCallById(callId),
    getAnswersByCallId(callId),
    getSchedulesByCallId(callId),
  ]);
  
  if (!call) {
    return (<div>Error</div>)
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <CallAnswersTabs
        callId={callId}
        call={call}
        questions={answersData.questions}
        participantsCount={answersData.participantsCount}
        schedules={schedulesData}
      />
    </div>
  );
}
