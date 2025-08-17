import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Attendance } from "@/lib/store";
import { 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  MoreHorizontal
} from "lucide-react";

// Types
interface Manager {
  id: string;
  name: string;
  email?: string;
  department?: string;
  attendances: Attendance[];
}

interface ManagersListProps {
  managers: Manager[];
  attendances: Attendance[];
}

// Manager Card Component
function ManagerCard({ manager }: { manager: Manager }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const managerStats = useMemo(() => {
    const totalAttendances = manager.attendances.length;
    const presentCount = manager.attendances.filter(a => a.status === 'Present').length;
    const attendanceRate = totalAttendances > 0 ? (presentCount / totalAttendances) * 100 : 0;
    
    return {
      total: totalAttendances,
      present: presentCount,
      absent: totalAttendances - presentCount,
      rate: Math.round(attendanceRate * 100) / 100,
    };
  }, [manager.attendances]);

  const getRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 bg-green-50";
    if (rate >= 75) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02] group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {manager.name}
            </CardTitle>
            {manager.email && (
              <p className="text-sm text-gray-600 truncate">
                {manager.email}
              </p>
            )}
            {manager.department && (
              <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                {manager.department}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRateColor(managerStats.rate)}`}>
              {managerStats.rate}%
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {managerStats.total}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Calendar size={12} />
              Total
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {managerStats.present}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <CheckCircle size={12} />
              Present
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {managerStats.absent}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <XCircle size={12} />
              Absent
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <h4 className="font-medium text-gray-900 text-sm">Recent Attendances</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {manager.attendances.slice(0, 5).map((attendance, index) => (
                <div key={attendance.id || index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {attendance.date ? new Date(attendance.date).toLocaleDateString() : 'No date'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    attendance.status === 'Present' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {attendance.status}
                  </span>
                </div>
              ))}
              {manager.attendances.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  +{manager.attendances.length - 5} more records
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Search and Filter Component
function SearchAndFilter({ 
  searchTerm, 
  setSearchTerm,
  filterBy,
  setFilterBy,
  sortBy,
  setSortBy
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterBy: string;
  setFilterBy: (filter: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search managers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex gap-2">
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="all">All Departments</option>
          <option value="hr">HR</option>
          <option value="engineering">Engineering</option>
          <option value="sales">Sales</option>
          <option value="marketing">Marketing</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="attendance-high">High Attendance</option>
          <option value="attendance-low">Low Attendance</option>
          <option value="department">Department</option>
        </select>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ searchTerm }: { searchTerm?: string }) {
  return (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        {searchTerm ? 'No managers found' : 'No managers'}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchTerm 
          ? `No managers match "${searchTerm}". Try adjusting your search.`
          : 'Get started by adding some managers to the system.'
        }
      </p>
    </div>
  );
}

// Main ManagersList Component
export default function ManagersList({ managers, attendances }: ManagersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isLoading, setIsLoading] = useState(false);

  // Filtered and sorted managers
  const filteredAndSortedManagers = useMemo(() => {
    let filtered = managers.filter(manager => {
      const matchesSearch = manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          manager.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === "all" || 
                           manager.department?.toLowerCase() === filterBy.toLowerCase();
      
      return matchesSearch && matchesFilter;
    });

    // Sort managers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "department":
          return (a.department || "").localeCompare(b.department || "");
        case "attendance-high":
          const aRate = a.attendances.length > 0 
            ? (a.attendances.filter(att => att.status === 'Present').length / a.attendances.length) * 100 
            : 0;
          const bRate = b.attendances.length > 0 
            ? (b.attendances.filter(att => att.status === 'Present').length / b.attendances.length) * 100 
            : 0;
          return bRate - aRate;
        case "attendance-low":
          const aRateLow = a.attendances.length > 0 
            ? (a.attendances.filter(att => att.status === 'Present').length / a.attendances.length) * 100 
            : 0;
          const bRateLow = b.attendances.length > 0 
            ? (b.attendances.filter(att => att.status === 'Present').length / b.attendances.length) * 100 
            : 0;
          return aRateLow - bRateLow;
        default:
          return 0;
      }
    });

    return filtered;
  }, [managers, searchTerm, filterBy, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="text-center space-y-2">
                    <Skeleton className="h-6 w-8 mx-auto" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Managers List
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAndSortedManagers.length} of {managers.length} managers
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Managers Grid */}
      {filteredAndSortedManagers.length === 0 ? (
        <EmptyState searchTerm={searchTerm} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedManagers.map((manager) => (
            <ManagerCard key={manager.id} manager={manager} />
          ))}
        </div>
      )}
    </div>
  );
}