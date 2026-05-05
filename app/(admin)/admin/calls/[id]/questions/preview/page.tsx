import PreviewQuestions from "@/features/calls/components/questions-preview";
import {getQuestionsByCallId} from "@/features/calls/actions/get-questions-by-call-id";

export default async function PreviewPage({
                                            params,
                                          }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const {questions, call} = await getQuestionsByCallId(id);
  if (!call) {
    return <div>Call not found</div>;
  }
  return <PreviewQuestions questions={questions} call={call}/>;
}