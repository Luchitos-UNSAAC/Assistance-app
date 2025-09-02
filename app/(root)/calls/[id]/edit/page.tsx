import {getCallById} from "@/features/calls/actions/get-call-by-id";
import CallForVolunteersEditPage from "@/features/calls/components/call-for-volunteers-form-edit";

export default async function EditCallPage({
                                             params,
                                           }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const call = await getCallById(id);
  if (!call) {
    return <div>Call not found</div>;
  }

  return <CallForVolunteersEditPage call={call} />;
}