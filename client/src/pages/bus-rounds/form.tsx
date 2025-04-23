import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusRoundSchema, BusRound, Bus, Student, User } from "@shared/schema";
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
import { ArrowLeft, GripHorizontal, Loader2, Plus, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = insertBusRoundSchema;
type FormValues = z.infer<typeof formSchema>;

export default function BusRoundForm() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = !!params.id;
  const [activeTab, setActiveTab] = useState("details");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [roundStudents, setRoundStudents] = useState<number[]>([]);

  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "morning",
      startTime: "",
      endTime: "",
      busId: undefined,
      status: "pending",
    },
  });

  // Fetch buses for the select dropdown
  const { data: buses } = useQuery<Bus[]>({
    queryKey: ["/api/buses"],
  });

  // Fetch students
  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Fetch round data if editing
  const { data: round, isLoading: isLoadingRound } = useQuery<BusRound>({
    queryKey: [`/api/bus-rounds/${params.id}`],
    enabled: isEditing,
  });

  // Fetch round students if editing
  const { data: roundStudentsData, isLoading: isLoadingRoundStudents } = useQuery({
    queryKey: [`/api/bus-rounds/${params.id}/students`],
    enabled: isEditing,
  });

  // Update form with round data when available
  useEffect(() => {
    if (round) {
      form.reset({
        name: round.name,
        type: round.type,
        startTime: round.startTime,
        endTime: round.endTime,
        busId: round.busId,
        status: round.status,
      });
    }
  }, [round, form]);

  // Update round students when data is available
  useEffect(() => {
    if (roundStudentsData?.length) {
      const studentIds = roundStudentsData.map((rs: any) => rs.studentId);
      setRoundStudents(studentIds);
    }
  }, [roundStudentsData]);

  // Create/Update round mutation
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/bus-rounds/${params.id}`, data);
      } else {
        return apiRequest("POST", "/api/bus-rounds", data);
      }
    },
    onSuccess: async (response) => {
      const roundData = await response.json();
      
      toast({
        title: isEditing ? "Bus round updated" : "Bus round created",
        description: isEditing
          ? "Bus round has been successfully updated."
          : "New bus round has been successfully created.",
      });

      if (!isEditing && selectedStudents.length > 0) {
        // If we have selected students, move to the students tab
        setActiveTab("students");
        if (roundData.id) {
          // Set the created round id in the URL for student assignment
          navigate(`/bus-rounds/${roundData.id}`);
        }
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/bus-rounds"] });
        navigate("/bus-rounds");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Assign student to round mutation
  const assignStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return apiRequest("POST", `/api/bus-rounds/${params.id}/students`, {
        studentId,
        order: roundStudents.length + 1, // Add to the end
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/bus-rounds/${params.id}/students`]
      });
      
      toast({
        title: "Student assigned",
        description: "Student has been assigned to the bus round.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error assigning student",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove student from round mutation
  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return apiRequest("DELETE", `/api/bus-rounds/${params.id}/students/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/bus-rounds/${params.id}/students`]
      });
      
      toast({
        title: "Student removed",
        description: "Student has been removed from the bus round.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing student",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const handleStudentCheckboxChange = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const assignSelectedStudents = async () => {
    if (!params.id || selectedStudents.length === 0) return;
    
    // Assign each selected student
    for (const studentId of selectedStudents) {
      await assignStudentMutation.mutateAsync(studentId);
    }
    
    // Clear selection after assigning
    setSelectedStudents([]);
  };

  const removeStudent = (studentId: number) => {
    if (!params.id) return;
    removeStudentMutation.mutate(studentId);
  };

  if (isEditing && isLoadingRound) {
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

  // Filter students that aren't already in the round
  const availableStudents = students?.filter(
    student => !roundStudents.includes(student.id)
  );

  // Get assigned students
  const assignedStudents = students?.filter(
    student => roundStudents.includes(student.id)
  );

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
              onClick={() => navigate("/bus-rounds")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bus Rounds
            </Button>
            <h1 className="text-2xl font-heading font-bold text-neutral-900">
              {isEditing ? "Edit Bus Round" : "Create Bus Round"}
            </h1>
            <p className="text-neutral-500">
              {isEditing
                ? "Update bus round information and assigned students"
                : "Create a new bus round for your school"}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Round Details</TabsTrigger>
              {isEditing && (
                <TabsTrigger value="students">Assign Students</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Bus Round Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Round Name</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g., Morning Round #101" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Round Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select round type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="morning">Morning</SelectItem>
                                  <SelectItem value="afternoon">Afternoon</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                When this round operates
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="busId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assign Bus</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value?.toString()}
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a bus" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {buses?.length ? (
                                    buses.map((bus) => (
                                      <SelectItem
                                        key={bus.id}
                                        value={bus.id.toString()}
                                      >
                                        Bus #{bus.busNumber} ({bus.licenseNumber})
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="" disabled>
                                      No buses available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The bus that will run this route
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., 8:00 AM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., 9:15 AM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {isEditing && (
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Current status of this round
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/bus-rounds")}
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
                            <>{isEditing ? "Update Round" : "Create Round"}</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {availableStudents?.length === 0 ? (
                      <div className="text-center py-6 text-neutral-500">
                        No more students available to assign
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <Input 
                            placeholder="Search students..." 
                            className="mb-2"
                          />
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-500">
                              {selectedStudents.length} students selected
                            </span>
                            <Button 
                              size="sm"
                              disabled={selectedStudents.length === 0 || assignStudentMutation.isPending}
                              onClick={assignSelectedStudents}
                            >
                              {assignStudentMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Plus className="h-4 w-4 mr-2" />
                              )}
                              Add Selected
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          {availableStudents?.map((student) => (
                            <div key={student.id} className="flex items-center space-x-2 p-2 hover:bg-neutral-50 rounded-md">
                              <Checkbox 
                                id={`student-${student.id}`}
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={(checked) => 
                                  handleStudentCheckboxChange(student.id, !!checked)
                                }
                              />
                              <div className="flex items-center flex-1">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium mr-3">
                                  {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <div>
                                  <div className="font-medium">{student.firstName} {student.lastName}</div>
                                  <div className="text-xs text-neutral-500">{student.grade}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRoundStudents ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                      </div>
                    ) : assignedStudents?.length === 0 ? (
                      <div className="text-center py-6 text-neutral-500">
                        No students assigned to this round yet
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {assignedStudents?.map((student, index) => (
                          <div key={student.id} className="flex items-center space-x-2 p-2 bg-neutral-50 rounded-md">
                            <div className="bg-neutral-200 text-neutral-600 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex items-center flex-1">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium mr-3">
                                {student.firstName[0]}{student.lastName[0]}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{student.firstName} {student.lastName}</div>
                                <div className="text-xs text-neutral-500">{student.grade}</div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeStudent(student.id)}
                                disabled={removeStudentMutation.isPending}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <GripHorizontal className="h-4 w-4 text-neutral-400" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate("/bus-rounds")}
                >
                  Done
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
