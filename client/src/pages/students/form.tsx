import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, Student, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

const formSchema = insertStudentSchema;
type FormValues = z.infer<typeof formSchema>;

export default function StudentForm() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = !!params.id;

  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      firstName: "",
      lastName: "",
      grade: "",
      parentId: undefined,
    },
  });

  // Fetch parents for the select dropdown
  const { data: parents } = useQuery<User[]>({
    queryKey: ["/api/users?role=parent"],
  });

  // Fetch student data if editing
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: [`/api/students/${params.id}`],
    enabled: isEditing,
  });

  // Update form with student data when available
  useEffect(() => {
    if (student) {
      form.reset({
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        parentId: student.parentId,
      });
    }
  }, [student, form]);

  // Create/Update student mutation
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/students/${params.id}`, data);
      } else {
        return apiRequest("POST", "/api/students", data);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Student updated" : "Student created",
        description: isEditing
          ? "Student has been successfully updated."
          : "New student has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      navigate("/students");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (isEditing && isLoadingStudent) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Sidebar />
        <div className="lg:ml-64 flex-1 min-h-screen">
          <Header />
          <div className="p-6 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Sidebar />
      <div className="lg:ml-64 flex-1 min-h-screen">
        <Header />

        {/* Main Content */}
        <div className="p-6">
          <div className="mb-6">
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => navigate("/students")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Button>
            <h1 className="text-2xl font-heading font-bold text-neutral-900">
              {isEditing ? "Edit Student" : "Add New Student"}
            </h1>
            <p className="text-neutral-500">
              {isEditing
                ? "Update student information"
                : "Create a new student profile"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student ID</FormLabel>
                          <FormControl>
                            <Input placeholder="ST-12345" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique identifier for the student
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Kindergarten">
                                Kindergarten
                              </SelectItem>
                              <SelectItem value="1st Grade">1st Grade</SelectItem>
                              <SelectItem value="2nd Grade">2nd Grade</SelectItem>
                              <SelectItem value="3rd Grade">3rd Grade</SelectItem>
                              <SelectItem value="4th Grade">4th Grade</SelectItem>
                              <SelectItem value="5th Grade">5th Grade</SelectItem>
                              <SelectItem value="6th Grade">6th Grade</SelectItem>
                              <SelectItem value="7th Grade">7th Grade</SelectItem>
                              <SelectItem value="8th Grade">8th Grade</SelectItem>
                              <SelectItem value="9th Grade">9th Grade</SelectItem>
                              <SelectItem value="10th Grade">10th Grade</SelectItem>
                              <SelectItem value="11th Grade">11th Grade</SelectItem>
                              <SelectItem value="12th Grade">12th Grade</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to parent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parents?.length ? (
                              parents.map((parent) => (
                                <SelectItem
                                  key={parent.id}
                                  value={parent.id.toString()}
                                >
                                  {parent.fullName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-parents" disabled>
                                No parents available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Assign this student to a parent
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/students")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>{isEditing ? "Update Student" : "Create Student"}</>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
