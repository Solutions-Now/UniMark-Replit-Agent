
import { useQuery } from "@tanstack/react-query";
import { Bus } from "@shared/schema";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BusesIndex() {
  const { toast } = useToast();
  const { data: buses, isLoading } = useQuery<Bus[]>({
    queryKey: ["/api/buses"],
  });

  const columns: ColumnDef<Bus>[] = [
    {
      accessorKey: "busNumber",
      header: "Bus Number",
    },
    {
      accessorKey: "licenseNumber",
      header: "License Number",
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Link href={`/buses/${row.original.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Sidebar />
      <div className="lg:ml-64 flex-1 min-h-screen">
        <Header />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Buses</h1>
              <p className="text-neutral-500">Manage your school buses</p>
            </div>
            <Link href="/buses/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Bus
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            {isLoading ? (
              <div className="text-center py-8">Loading buses...</div>
            ) : buses && buses.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={buses}
                searchField="busNumber"
                searchPlaceholder="Search buses..."
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4">No buses found</p>
                <Link href="/buses/new">
                  <Button>Add your first bus</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
