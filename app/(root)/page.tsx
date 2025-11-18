import Dashboard from "@/features/dashboard/components/dashboard";
import { getReviewDashboard } from "@/features/dashboard/actions/get-review-dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const reviewDashboard = await getReviewDashboard();
  if (!reviewDashboard) {
    return redirect('/auth/login')
  }
  return (
    <Dashboard reviewDashboard={reviewDashboard} />
  );
}
