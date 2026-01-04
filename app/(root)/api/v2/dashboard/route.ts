import {NextResponse} from "next/server";
import {getAuthPayload} from "@/lib/get-auth";
import {getReviewDashboardByEmail} from "@/features/dashboard/actions/get-review-dashboard-by-email";

export async function GET(req: Request) {
  try {
    const payload = await getAuthPayload(req)
    const data = await getReviewDashboardByEmail(payload.email);
    return NextResponse.json(
      {data},
      {status: 200}
    )
  } catch (err) {
    console.error("[ERROR_GET_DASHBOARD]", err)
    return NextResponse.json(
      { message: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}
