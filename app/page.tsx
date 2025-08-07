import Dashboard from "@/features/dashboard/components/dashboard";
import {getReviewDashboard} from "@/features/dashboard/actions/get-review-dashboard";

export default async function DashboardPage() {
  const reviewDashboard = await getReviewDashboard();
  if (!reviewDashboard) {
    return <div>Error loading dashboard data</div>;
  }
  return (
   <Dashboard reviewDashboard={reviewDashboard} />
  );
}
