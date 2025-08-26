import {getQuestionsByCallId} from "@/features/calls/actions/get-active-questions-by-call-id";
import QuestionsToFill from "@/features/calls/components/question-to-fill";

export default async function FormCallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questions = await getQuestionsByCallId(id);

  return <QuestionsToFill questions={questions} />;
}