// app/managers/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import ManagersList from "@/features/managers/components/manager-list";
import { getActiveManagers } from "@/features/managers/actions/get-active-managers";
import { Attendance } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Calendar, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Managers | Dashboard",
  description: "Manage and view all active managers and their attendance records",
};

// Loading component for better UX
function ManagersPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Stats calculation utility
function calculateStats(attendances: Attendance[]) {
  const totalAttendances = attendances.length;
  const presentAttendances = attendances.filter(a => a.status === 'Present').length;
  const attendanceRate = totalAttendances > 0 ? (presentAttendances / totalAttendances) * 100 : 0;
  
  return {
    totalAttendances,
    presentAttendances,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
    absentAttendances: totalAttendances - presentAttendances,
  };
}

// Stats cards component
function StatsCards({ attendances, managersCount }: { 
  attendances: Attendance[], 
  managersCount: number 
}) {
  const stats = calculateStats(attendances);
  
  const statsData = [
    {
      title: "Total Managers",
      value: managersCount.toString(),
      description: "Active managers in system",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Attendances",
      value: stats.totalAttendances.toString(),
      description: "All attendance records",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Present Records",
      value: stats.presentAttendances.toString(),
      description: `${stats.attendanceRate}% attendance rate`,
      icon: UserCheck,
      color: "text-emerald-600",
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      description: `${stats.absentAttendances} absent records`,
      icon: TrendingUp,
      color: stats.attendanceRate >= 80 ? "text-green-600" : stats.attendanceRate >= 60 ? "text-yellow-600" : "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Error boundary component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="text-center space-y-4">
        <div className="text-red-500 text-6xl">⚠️</div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Something went wrong
        </h2>
        <p className="text-gray-600 max-w-md">
          We encountered an error while loading the managers data. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// Main page content component
async function ManagersPageContent() {
  try {
    const activeManagers = await getActiveManagers();
    
    // More efficient way to flatten attendances using flatMap
    const attendancesAll: Attendance[] = activeManagers.flatMap(
      manager => manager.attendances || []
    );

    // Log for debugging (consider removing in production)
    if (process.env.NODE_ENV === 'development') {
      console.log("Active Managers:", activeManagers);
      console.log("Total Attendances:", attendancesAll.length);
    }

    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Managers
          </h1>
          <p className="text-gray-600">
            Manage and monitor all active managers and their attendance records
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          attendances={attendancesAll} 
          managersCount={activeManagers.length}
        />

        {/* Main Content */}
        <div className="space-y-4">
          <ManagersList 
            managers={activeManagers} 
            attendances={attendancesAll} 
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading managers data:", error);
    return <ErrorFallback error={error as Error} />;
  }
}

// Main page component with proper error handling and suspense
export default function ManagersPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Suspense fallback={<ManagersPageSkeleton />}>
        <ManagersPageContent />
      </Suspense>
    </div>
  );
}