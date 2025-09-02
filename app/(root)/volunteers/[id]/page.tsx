import VolunteerDetail from "@/features/volunteers/components/volunteer-detail";
import {getVolunteerById} from "@/features/volunteers/actions/get-volunteer-by-id";

export default async function VolunteerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const volunteer = await getVolunteerById(id);
  if (!volunteer) {
    return <div>Voluntario no encontrado</div>;
  }

  return <VolunteerDetail volunteer={volunteer} />;
}
