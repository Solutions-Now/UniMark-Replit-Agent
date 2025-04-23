import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, User, Student } from "@shared/schema";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

// Extend the user schema for parent registration
const formSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ParentForm() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = !!params.id;

  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
      phone: "",
      role: "parent", // Set role to parent for this form
    },
  });

  // Fetch parent data if editing
  const { data: parent, isLoading: isLoadingParent } = useQuery<User>({
    queryKey: [`/api/users/${params.id}`],
    enabled: isEditing,
  });

  // Fetch students assigned to this parent
  const { data: students } = useQuery<Student[]>({
    queryKey: [`/api/students?parentId=${params.id}`],
    enabled: isEditing,
  });

  // Update form with parent data when available
  useEffect(() => {
    if (parent) {
      form.reset({
        username: parent.username,
        password: "", // Don't show password
        confirmPassword: "", // Don't show password
        email: parent.email,
        fullName: parent.fullName,
        phone: parent.phone || "",
        role: parent.role,
      });
    }
  }, [parent, form]);

  // Create/Update parent mutation
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data;

      if (isEditing) {
        // If editing and password is empty, remove it from the payload
        if (!userData.password) {
          const { password, ...userDataWithoutPassword } = userData;
          return apiRequest("PUT", `/api/users/${params.id}`, userDataWithoutPassword);
        }
        return apiRequest("PUT", `/api/users/${params.id}`, userData);
      } else {
        return apiRequest("POST", "/api/users", userData);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Parent updated" : "Parent created",
        description: isEditing
          ? "Parent account has been successfully updated."
          : "New parent account has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users?role=parent"] });
      navigate("/parents");
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

  if (isEditing && isLoadingParent) {
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
              onClick={() => navigate("/parents")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Parents
            </Button>
            <h1 className="text-2xl font-heading font-bold text-neutral-900">
              {isEditing ? "Edit Parent" : "Add New Parent"}
            </h1>
            <p className="text-neutral-500">
              {isEditing
                ? "Update parent account information"
                : "Create a new parent account"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter email address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter phone number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Create a username"
                            {...field}
                            disabled={isEditing} // Username can't be changed once created
                          />
                        </FormControl>
                        <FormDescription>
                          This will be used for logging into the mobile app
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {isEditing ? "New Password" : "Password"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={
                                isEditing
                                  ? "Enter new password (leave empty to keep current)"
                                  : "Create a password"
                              }
                              {...field}
                            />
                          </FormControl>
                          {isEditing && (
                            <FormDescription>
                              Leave blank to keep current password
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {isEditing
                              ? "Confirm New Password"
                              : "Confirm Password"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={
                                isEditing
                                  ? "Confirm new password"
                                  : "Confirm your password"
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Display assigned students if editing */}
                  {isEditing && students && students.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Assigned Students</h3>
                      <div className="bg-neutral-50 p-4 rounded-md">
                        <ul className="space-y-2">
                          {students.map((student) => (
                            <li key={student.id} className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium mr-2">
                                {student.firstName[0]}{student.lastName[0]}
                              </div>
                              <span>
                                {student.firstName} {student.lastName} ({student.grade})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/parents")}
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
                        <>{isEditing ? "Update Parent" : "Create Parent"}</>
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
