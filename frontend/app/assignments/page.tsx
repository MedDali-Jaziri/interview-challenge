"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Pill,
  Lock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { PermissionGuard } from "@/components/permission-guard";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/constant";

// Interfaces based on API responses
interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

interface AssignmentWithDetails {
  id: string;
  patientName: string;
  medicationName: string;
  remainingDays: number;
  status: "active" | "completed" | "overdue";
  dosage?: string;
  frequency?: string;
  startDate?: string;
  totalDays?: number;
}

interface RawAssignment {
  "Assignment Id: ": string;
  "Patient Name: ": string;
  "Medication Name: ": string;
  "Remaining Days: ": number;
  // Add other fields here if needed
}

function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function AssignmentsContent() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Fetch data from backend APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data concurrently
        const [patientsRes, medicationsRes, assignmentsRes] = await Promise.all(
          [
            fetch(API_BASE_URL + "/patient/patient-list"),
            fetch(API_BASE_URL + "/medication/medication-list"),
            fetch(API_BASE_URL + "/assignment/remaining-days"),
          ]
        );

        if (!patientsRes.ok) throw new Error("Failed to fetch patients");
        if (!medicationsRes.ok) throw new Error("Failed to fetch medications");
        if (!assignmentsRes.ok) throw new Error("Failed to fetch assignments");

        const patientsData = await patientsRes.json();
        const medicationsData = await medicationsRes.json();
        const assignmentsData = await assignmentsRes.json();

        setPatients(patientsData.data || []);
        setMedications(medicationsData.data || []);

        // Transform assignment data to include status and details
        const transformedAssignments = (assignmentsData.data || []).map(
          (item: RawAssignment): AssignmentWithDetails => {
            const remainingDays = item["Remaining Days: "] || 0;
            const status: AssignmentWithDetails["status"] =
              remainingDays > 0
                ? "active"
                : remainingDays === 0
                ? "completed"
                : "overdue";

            return {
              id: String(item["Assignment Id: "] || ""),
              patientName: item["Patient Name: "] || "Unknown Patient",
              medicationName: item["Medication Name: "] || "Unknown Medication",
              remainingDays,
              status,
            };
          }
        );

        setAssignments(transformedAssignments);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enrich assignments with additional details
  const enrichedAssignments = assignments.map((assignment) => {
    // Find matching patient (case-insensitive)
    const patient = patients.find(
      (p) => p.name.toLowerCase() === assignment.patientName.toLowerCase()
    );

    // Find matching medication (case-insensitive)
    const medication = medications.find(
      (m) => m.name.toLowerCase() === assignment.medicationName.toLowerCase()
    );

    return {
      ...assignment,
      patientId: patient?.id || "",
      medicationId: medication?.id || "",
      dosage: medication?.dosage,
      frequency: medication?.frequency,
      startDate: patient?.dateOfBirth, // Using DOB as fallback for start date
      totalDays: medication ? 30 : assignment.totalDays || 30, // Default to 30 days
    };
  });

  const filteredAssignments = enrichedAssignments.filter((assignment) => {
    const patientName = assignment.patientName || "";
    const medicationName = assignment.medicationName || "";

    const matchesSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || assignment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = (remaining: number, total: number) => {
    if (remaining <= 0) return 100;
    return Math.max(0, ((total - remaining) / total) * 100);
  };

  const activeCount = enrichedAssignments.filter(
    (a) => a.status === "active"
  ).length;
  const overdueCount = enrichedAssignments.filter(
    (a) => a.status === "overdue"
  ).length;
  const completedCount = enrichedAssignments.filter(
    (a) => a.status === "completed"
  ).length;

  const handleMarkComplete = async (assignmentId: string) => {
    try {
      setCompletingId(assignmentId);

      // In a real app, you would update the database
      console.log(`Marking assignment ${assignmentId} as complete`);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state to reflect completion
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId
            ? { ...a, status: "completed", remainingDays: 0 }
            : a
        )
      );

      toast.success("Assignment marked as complete!");
    } catch (error) {
      console.error("Error completing assignment:", error);
      toast.error("Failed to complete assignment. Please try again.");
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Treatment Assignments
              </h1>
              <p className="text-gray-600">
                Manage medication assignments and treatment progress
              </p>
            </div>
          </div>
          <PermissionGuard
            resource="assignments"
            action="create"
            fallback={
              <div className="flex items-center text-gray-500">
                <Lock className="w-4 h-4 mr-2" />
                <span className="text-sm">View Only Access</span>
              </div>
            }
          >
            <Link href="/assignments/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
            </Link>
          </PermissionGuard>
        </div>

        {/* Role-based access notice */}
        {user?.role === "nurse" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="font-medium text-blue-800">Nurse Access Level</p>
                <p className="text-sm text-blue-600">
                  You can view assignments and update treatment progress, but
                  cannot create or delete assignments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {enrichedAssignments.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {activeCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {overdueCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {completedCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by patient or medication name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              onClick={() => setStatusFilter("active")}
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "overdue" ? "default" : "outline"}
              onClick={() => setStatusFilter("overdue")}
              size="sm"
            >
              Overdue
            </Button>
            <Button
              variant={statusFilter === "completed" ? "default" : "outline"}
              onClick={() => setStatusFilter("completed")}
              size="sm"
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Assignment List */}
        <div className="space-y-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => {
              // Find patient details (if available)
              const patient = patients.find(
                (p) =>
                  p.name.toLowerCase() === assignment.patientName.toLowerCase()
              );

              // Calculate progress
              const totalDays = assignment.totalDays || 30;
              const progress = getProgressPercentage(
                assignment.remainingDays,
                totalDays
              );

              return (
                <Card
                  key={assignment.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1 text-gray-500" />
                            <span className="font-semibold text-lg">
                              {assignment.patientName}
                              {patient?.dateOfBirth && (
                                <span className="text-gray-500 font-normal ml-2">
                                  (Age: {calculateAge(patient.dateOfBirth)})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Pill className="w-4 h-4 mr-1 text-gray-500" />
                            <span className="font-medium">
                              {assignment.medicationName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {assignment.dosage && assignment.frequency && (
                            <span>
                              {assignment.dosage} • {assignment.frequency}
                            </span>
                          )}
                          {assignment.startDate && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Started:{" "}
                              {new Date(
                                assignment.startDate
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status.charAt(0).toUpperCase() +
                          assignment.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Treatment Progress</span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {assignment.remainingDays > 0
                            ? `${assignment.remainingDays} days remaining`
                            : assignment.remainingDays === 0
                            ? "Treatment completed"
                            : `${Math.abs(
                                assignment.remainingDays
                              )} days overdue`}
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className={`h-2 ${
                          assignment.status === "overdue" ? "bg-red-100" : ""
                        }`}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Day 1</span>
                        <span>Day {totalDays}</span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <Link href={`/assignments/${assignment.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                      <PermissionGuard
                        resource="assignments"
                        action="update"
                        fallback={
                          <Button size="sm" variant="outline" disabled>
                            <Lock className="w-3 h-3 mr-1" />
                            View Only
                          </Button>
                        }
                      >
                        <Link href={`/assignments/${assignment.id}/edit`}>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </Link>
                      </PermissionGuard>
                      {assignment.status === "active" && (
                        <PermissionGuard resource="assignments" action="update">
                          <Button
                            size="sm"
                            onClick={() => handleMarkComplete(assignment.id)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={completingId === assignment.id}
                          >
                            {completingId === assignment.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Mark Complete
                          </Button>
                        </PermissionGuard>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm || statusFilter !== "all"
                  ? "No assignments found matching your criteria."
                  : "No assignments available."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  return (
    <AuthGuard>
      <AssignmentsContent />
    </AuthGuard>
  );
}
