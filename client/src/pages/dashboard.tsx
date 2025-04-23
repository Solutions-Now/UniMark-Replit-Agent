import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stats-card";
import { MapView } from "@/components/dashboard/map-view";
import { ActiveRounds } from "@/components/dashboard/active-rounds";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Student } from "@shared/schema";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ArrowDown, Download, Plus } from "lucide-react";

// Student table columns
const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "studentId",
    header: "ID",
    cell: ({ row }) => {
      const initials = `${row.original.firstName?.[0] || ""}${
        row.original.lastName?.[0] || ""
      }`.toUpperCase();
      return (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium mr-3">
            {initials}
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-900">
              {row.original.firstName} {row.original.lastName}
            </div>
            <div className="text-xs text-neutral-500">
              ID: {row.original.studentId}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => <div className="text-sm">{row.original.grade}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      // In a real app, status would come from the API
      const statuses = ["On Bus", "At School", "Absent"];
      const statusIndex = row.index % 3;
      const status = statuses[statusIndex];
      const statusClasses = {
        "On Bus": "bg-success-500 bg-opacity-10 text-success-500",
        "At School": "bg-neutral-300 text-neutral-800",
        Absent: "bg-danger-500 bg-opacity-10 text-danger-500",
      };
      
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusClasses[status as keyof typeof statusClasses]
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "parentId",
    header: "Parent",
    cell: ({ row }) => (
      <div className="text-sm text-neutral-900">
        {/* In a real app, parent data would be fetched */}
        {row.index % 5 === 0
          ? "Michael Smith"
          : row.index % 5 === 1
          ? "Sarah Johnson"
          : row.index % 5 === 2
          ? "Daniel Williams"
          : row.index % 5 === 3
          ? "Jennifer Miller"
          : "Richard Davis"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <Link href={`/students/${row.original.id}`}>
            <Button variant="link" className="text-primary-600 hover:text-primary-900">
              Edit
            </Button>
          </Link>
        </div>
      );
    },
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch students
  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Extract first name for greeting
  const firstName = user?.fullName?.split(" ")[0] || "Admin";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Sidebar />
      <div className="lg:ml-64 flex-1 min-h-screen">
        <Header />

        {/* Main Dashboard Content */}
        <div className="p-6">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">
                Dashboard
              </h1>
              <p className="text-neutral-500">Welcome back, {firstName}!</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Link href="/bus-rounds/new">
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Bus
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Students"
              value={stats?.totalStudents || 324}
              icon="students"
              trend={{
                value: 4.3,
                direction: "up",
                label: "from last month",
              }}
            />
            <StatCard
              title="Active Buses"
              value={stats?.totalBuses || 12}
              icon="buses"
              trend={{
                value: 2.1,
                direction: "down",
                label: "from yesterday",
              }}
            />
            <StatCard
              title="Ongoing Routes"
              value={stats?.activeRounds || 4}
              icon="rounds"
              trend={{
                value: 12,
                direction: "up",
                label: "from last week",
              }}
            />
            <StatCard
              title="New Notifications"
              value={stats?.recentNotifications?.length || 18}
              icon="notifications"
              trend={{
                value: 8.4,
                direction: "up",
                label: "from yesterday",
              }}
            />
          </div>

          {/* Map and Bus Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Bus Tracking Map */}
            <div className="lg:col-span-2">
              <MapView />
            </div>

            {/* Active Bus Rounds */}
            <ActiveRounds />
          </div>

          {/* Recent Notifications & Student Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Table */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
                <h2 className="font-medium text-lg text-neutral-900">
                  Recent Students
                </h2>
                <Link href="/students">
                  <Button
                    variant="link"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View All Students
                  </Button>
                </Link>
              </div>
              <div className="p-4">
                <DataTable
                  columns={columns}
                  data={students || []}
                  searchField="firstName"
                  searchPlaceholder="Search students..."
                />
              </div>
            </div>

            {/* Recent Notifications */}
            <NotificationsList />
          </div>
        </div>
      </div>
    </div>
  );
}
