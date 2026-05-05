import CallForVolunteersList from "@/features/calls/components/calls-for-volunteers-list";
import {getCalls} from "@/features/calls/actions/get-calls";

export default async function CallsPage({searchParams}: { searchParams: any }) {
  const {page, status, q} = await searchParams;

  const {calls, totalPages} = await getCalls({
    page: Number(page) || 1,
    status: status as string,
    search: q as string
  });

  return (
    <CallForVolunteersList
      calls={calls}
      totalPages={totalPages}
      currentPage={Number(page) || 1}
    />
  );
}
