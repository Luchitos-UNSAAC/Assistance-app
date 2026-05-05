import QuestionsForm from "@/features/calls/components/question-form-new";
import {getQuestionsByCallId} from "@/features/calls/actions/get-questions-by-call-id";

export default async function QuestionNewPage({
                                                params,
                                              }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const {questions, call} = await getQuestionsByCallId(id);
  if (!call) {
    return <div>Call not found</div>;
  }
  return <QuestionsForm questions={questions} call={call}/>;
}