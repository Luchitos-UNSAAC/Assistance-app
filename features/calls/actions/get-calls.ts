import { prisma } from "@/lib/prisma";
type CallForVolunteers = {
  id: string
  title: string
  location: string | null
  modality: string
  deadline: string
  status: string
}

export const getCalls = async (params: {
  page?: number,
  limit?: number,
  search?: string,
  status?: string
}) => {
  const { page = 1, limit = 6, search, status } = params;
  const skip = (page - 1) * limit;

  const where: any = {
    AND: [
      search ? { title: { contains: search, mode: 'insensitive' as const } } : {},
      status && status !== "ALL" ? { status } : {},
    ]
  };

  try {
    const [calls, total] = await Promise.all([
      prisma.callForVolunteers.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.callForVolunteers.count({ where })
    ]);

    return {
      calls: calls.map(c => ({ ...c, deadline: c.deadline.toISOString() })),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    return { calls: [], totalPages: 0 };
  }
};
