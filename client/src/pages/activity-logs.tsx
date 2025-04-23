import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityLog } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  Bookmark,
  ClipboardCheck, 
  FileText, 
  Filter, 
  Loader2, 
  MapPin, 
  RefreshCw, 
  UserPlus, 
  UserX, 
  Mail,
  UserCheck,
  PlayCircle,
  StopCircle,
  Edit,
  Trash,
  MessageSquare,
  Bus,
  AlertTriangle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Get icon based on action type
function getActionIcon(action: string) {
  switch (action) {
    case "CREATE_USER":
      return <UserPlus className="h-5 w-5" />;
    case "UPDATE_USER":
      return <UserCheck className="h-5 w-5" />;
    case "DELETE_USER":
      return <UserX className="h-5 w-5" />;
    case "CREATE_STUDENT":
      return <UserPlus className="h-5 w-5" />;
    case "UPDATE_STUDENT":
      return <Edit className="h-5 w-5" />;
    case "DELETE_STUDENT":
      return <Trash className="h-5 w-5" />;
    case "CREATE_BUS":
      return <Bus className="h-5 w-5" />;
    case "UPDATE_BUS":
      return <Edit className="h-5 w-5" />;
    case "DELETE_BUS":
      return <Trash className="h-5 w-5" />;
    case "CREATE_BUS_ROUND":
      return <Bookmark className="h-5 w-5" />;
    case "UPDATE_BUS_ROUND":
      return <Edit className="h-5 w-5" />;
    case "DELETE_BUS_ROUND":
      return <Trash className="h-5 w-5" />;
    case "START_BUS_ROUND":
      return <PlayCircle className="h-5 w-5" />;
    case "STOP_BUS_ROUND":
      return <StopCircle className="h-5 w-5" />;
    case "ASSIGN_STUDENT_TO_ROUND":
      return <ClipboardCheck className="h-5 w-5" />;
    case "REMOVE_STUDENT_FROM_ROUND":
      return <ClipboardCheck className="h-5 w-5" />;
    case "SEND_NOTIFICATION":
      return <MessageSquare className="h-5 w-5" />;
    case "RECORD_ABSENCE":
      return <AlertTriangle className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
}

// Get background color based on action type
function getActionBgColor(action: string) {
  if (action.includes("CREATE")) return "bg-primary-100 text-primary-700";
  if (action.includes("UPDATE")) return "bg-blue-100 text-blue-700";
  if (action.includes("DELETE")) return "bg-red-100 text-red-700";
  if (action.includes("START")) return "bg-green-100 text-green-700";
  if (action.includes("STOP")) return "bg-orange-100 text-orange-700";
  if (action.includes("ASSIGN")) return "bg-purple-100 text-purple-700";
  if (action.includes("REMOVE")) return "bg-yellow-100 text-yellow-700";
  if (action.includes("SEND")) return "bg-indigo-100 text-indigo-700";
  if (action.includes("RECORD")) return "bg-amber-100 text-amber-700";
  return "bg-neutral-100 text-neutral-700";
}

// Format timestamp
function formatTimestamp(timestamp: Date) {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}

// Action log item component
function ActivityLogItem({ log }: { log: ActivityLog }) {
  return (
    <div className="p-4 bg-white rounded-md shadow-sm mb-4 border border-neutral-200">
      <div className="flex items-start">
        <div className={`p-2 rounded-md mr-4 ${getActionBgColor(log.action)}`}>
          {getActionIcon(log.action)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium">{log.action.replace(/_/g, " ")}</h3>
            <span className="text-xs text-neutral-500">
              {formatTimestamp(new Date(log.timestamp))}
            </span>
          </div>
          <div className="text-sm text-neutral-600 mb-2">
            User ID: {log.userId || "System"}
          </div>
          <div className="bg-neutral-50 p-2 rounded text-xs font-mono overflow-x-auto">
            {JSON.stringify(log.details, null, 2)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityLogs() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const logsPerPage = 10;

  // Fetch activity logs
  const { data: activityLogs, isLoading, refetch } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
  });

  // Filter and search logs
  const filteredLogs = activityLogs?.filter(log => {
    // Filter by action type
    const actionMatch = filter === "all" || log.action.toLowerCase().includes(filter.toLowerCase());
    
    // Search in action and details
    const searchMatch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
    
    return actionMatch && searchMatch;
  });

  // Paginate logs
  const paginatedLogs = filteredLogs?.slice(
    (page - 1) * logsPerPage,
    page * logsPerPage
  );

  // Total pages
  const totalPages = filteredLogs ? Math.ceil(filteredLogs.length / logsPerPage) : 0;

  // Handle refreshing logs
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast({
      title: "Activity logs refreshed",
      description: "Latest activity logs have been loaded.",
    });
  };

  // Action type options for filter
  const actionTypes = [
    { value: "all", label: "All Activities" },
    { value: "CREATE", label: "Create Actions" },
    { value: "UPDATE", label: "Update Actions" },
    { value: "DELETE", label: "Delete Actions" },
    { value: "USER", label: "User Related" },
    { value: "STUDENT", label: "Student Related" },
    { value: "BUS", label: "Bus Related" },
    { value: "ROUND", label: "Round Related" },
    { value: "NOTIFICATION", label: "Notifications" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Sidebar />
      <div className="lg:ml-64 flex-1 min-h-screen">
        <Header />

        {/* Main Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Activity Logs</h1>
              <p className="text-neutral-500">View system activity and audit logs</p>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Filter Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium">Action Type:</span>
                  </div>
                  <Select value={filter} onValueChange={setFilter} className="mt-1">
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-2/3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium">Search Logs:</span>
                  </div>
                  <Input 
                    type="search"
                    placeholder="Search by action or details..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : paginatedLogs && paginatedLogs.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-neutral-500">
                    Showing {(page - 1) * logsPerPage + 1} to {Math.min(page * logsPerPage, filteredLogs?.length || 0)} of {filteredLogs?.length || 0} entries
                  </div>
                </div>
                
                {paginatedLogs.map((log) => (
                  <ActivityLogItem key={log.id} log={log} />
                ))}
                
                {totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages).keys()].map((i) => {
                        const pageNum = i + 1;
                        
                        // Show first page, last page, and pages around current page
                        if (
                          pageNum === 1 || 
                          pageNum === totalPages || 
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                isActive={page === pageNum}
                                onClick={() => setPage(pageNum)}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        
                        // Show ellipsis for skipped pages
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return (
                            <PaginationItem key={`ellipsis-${pageNum}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No activity logs found</h3>
                <p className="text-neutral-500 text-sm">
                  {filter !== "all" || searchTerm 
                    ? "Try changing your filters or search terms." 
                    : "No system activity has been recorded yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
