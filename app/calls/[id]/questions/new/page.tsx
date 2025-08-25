import NewQuestionPage from "@/features/calls/components/question-form-new";
import QuestionsForm from "@/features/calls/components/question-form-new";

export default async function QuestionNewPage({
                                                params,
                                              }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuestionsForm />;
}