import CallForVolunteersList from "@/features/calls/components/calls-for-volunteers-list";
import {getCalls} from "@/features/calls/actions/get-calls";

export default async function CallsPage(){
  const calls = await getCalls();
  return <CallForVolunteersList calls={calls}/>;
}