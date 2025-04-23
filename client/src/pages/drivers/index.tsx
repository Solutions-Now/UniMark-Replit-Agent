import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Mail, Phone, Plus, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function DriversIndex() {
  const { toast } = useToast();
  const [driverToDelete, setDriverToDelete] = useState<number | null>(null);

  // Fetch drivers
  const { data: drivers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users?role=driver"],
  });

  // Delete driver function
  const handleDeleteDriver = async () => {
    if (!driverToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/users/${driverToDelete}`);
      
      // Invalidate drivers query to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/users?role=driver"] });
      
      toast({
        title: "Driver deleted",
        description: "The driver account has been successfully deleted.",
      });
      
      setDriverToDelete(null);
    } catch (error) {
      toast({
        title: "Error deleting driver",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Driver table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => {
        const driver = row.original;
        const initials = driver.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
        
        return (
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium mr-3">
              {initials}
            </div>
            <div className="font-medium">{driver.fullName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-neutral-400" />
          <span>{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-neutral-400" />
          <span>{row.original.phone || "Not provided"}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        // In a real app, this would come from the API
        // Simulating active/inactive status based on row index
        const active = row.index % 3 !== 0;
        
        return (
          <Badge variant={active ? "default" : "secondary"}>
            {active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Link href={`/drivers/${row.original.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => setDriverToDelete(row.original.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  driver account and may affect assigned bus routes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDriverToDelete(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteDriver}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
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
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Bus Drivers</h1>
              <p className="text-neutral-500">Manage bus driver accounts</p>
            </div>
            <Link href="/drivers/new">
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add New Driver
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            {isLoading ? (
              <div className="text-center py-8">Loading drivers...</div>
            ) : drivers && drivers.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={drivers} 
                searchField="fullName"
                searchPlaceholder="Search drivers..."
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4">No driver accounts found</p>
                <Link href="/drivers/new">
                  <Button>Add your first driver</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
