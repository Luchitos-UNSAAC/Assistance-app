import { prisma } from "@/lib/prisma";
type CallForVolunteers = {
  id: string
  title: string
  location: string | null
  modality: string
  deadline: string
  status: string
}

export const getCalls = async () => {
  try {
    const calls = await prisma.callForVolunteers.findMany({
      select: {
        id: true,
        title: true,
        location: true,
        modality: true,
        deadline: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    const mappedCalls: CallForVolunteers[] = calls.map((call) => ({
      id: call.id,
      title: call.title,
      location: call.location,
      modality: call.modality,
      deadline: call.deadline.toISOString(),
      status: call.status,
    }));
    
    return mappedCalls
  } catch (error) {
   return []
  }
};
