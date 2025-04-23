import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Mail, Phone, Plus, Trash2, User as UserIcon } from "lucide-react";
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

export default function ParentsIndex() {
  const { toast } = useToast();
  const [parentToDelete, setParentToDelete] = useState<number | null>(null);

  // Fetch parents
  const { data: parents, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users?role=parent"],
  });

  // Delete parent function
  const handleDeleteParent = async () => {
    if (!parentToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/users/${parentToDelete}`);
      
      // Invalidate parents query to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/users?role=parent"] });
      
      toast({
        title: "Parent deleted",
        description: "The parent account has been successfully deleted.",
      });
      
      setParentToDelete(null);
    } catch (error) {
      toast({
        title: "Error deleting parent",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Parent table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => {
        const parent = row.original;
        const initials = parent.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
        
        return (
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-secondary-500 bg-opacity-10 text-secondary-500 flex items-center justify-center font-medium mr-3">
              {initials}
            </div>
            <div className="font-medium">{parent.fullName}</div>
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
      accessorKey: "studentsCount",
      header: "Students",
      cell: ({ row }) => {
        // In a real implementation, we would fetch the students for each parent
        // For now, we'll use a random number as a placeholder
        const studentsCount = Math.floor(Math.random() * 4) + 1;
        
        return (
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 mr-2 text-neutral-400" />
            <span>{studentsCount} student{studentsCount !== 1 ? 's' : ''}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Link href={`/parents/${row.original.id}`}>
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
                onClick={() => setParentToDelete(row.original.id)}
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
                  parent account and may remove associated student assignments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setParentToDelete(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteParent}
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
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Parents</h1>
              <p className="text-neutral-500">Manage parent accounts</p>
            </div>
            <Link href="/parents/new">
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add New Parent
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            {isLoading ? (
              <div className="text-center py-8">Loading parents...</div>
            ) : parents && parents.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={parents} 
                searchField="fullName"
                searchPlaceholder="Search parents..."
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4">No parent accounts found</p>
                <Link href="/parents/new">
                  <Button>Add your first parent</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
