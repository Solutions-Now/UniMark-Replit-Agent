import { useQuery } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
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

export default function StudentsIndex() {
  const { toast } = useToast();
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);

  // Fetch students
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Delete student function
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/students/${studentToDelete}`);
      
      // Invalidate the students query to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      
      toast({
        title: "Student deleted",
        description: "The student has been successfully deleted.",
      });
      
      setStudentToDelete(null);
    } catch (error) {
      toast({
        title: "Error deleting student",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Student table columns
  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "studentId",
      header: "Student ID",
      cell: ({ row }) => <div className="font-medium">{row.original.studentId}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium mr-3">
            {`${row.original.firstName?.[0] || ""}${row.original.lastName?.[0] || ""}`.toUpperCase()}
          </div>
          <div className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "grade",
      header: "Grade",
    },
    {
      accessorKey: "parentId",
      header: "Parent",
      cell: ({ row }) => {
        // In a real implementation, we would fetch parent data
        return <div>Parent ID: {row.original.parentId || "Not assigned"}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Link href={`/students/${row.original.id}`}>
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
                onClick={() => setStudentToDelete(row.original.id)}
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
                  student and remove their data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setStudentToDelete(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteStudent}
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
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Students</h1>
              <p className="text-neutral-500">Manage school students</p>
            </div>
            <Link href="/students/new">
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add New Student
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            {isLoading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : students && students.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={students} 
                searchField="firstName"
                searchPlaceholder="Search students..."
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4">No students found</p>
                <Link href="/students/new">
                  <Button>Add your first student</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
