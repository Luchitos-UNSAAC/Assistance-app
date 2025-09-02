import QuestionsForm from "@/features/calls/components/question-form-new";
import {getQuestionsByCallId} from "@/features/calls/actions/get-questions-by-call-id";

export default async function QuestionNewPage({
                                                params,
                                              }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questions = await getQuestionsByCallId(id);
  return <QuestionsForm questions={questions} callId={id}/>;
}