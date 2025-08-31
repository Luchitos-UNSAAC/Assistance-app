import {getActiveQuestionByCallId} from "@/features/calls/actions/get-active-questions-by-call-id";
import QuestionsToFill from "@/features/calls/components/question-to-fill";

export default async function FormCallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questions = await getActiveQuestionByCallId(id);
  console.log('Fetched questions:', questions);
  return <QuestionsToFill questions={questions} />;
}