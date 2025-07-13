"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  Pill,
  User,
  Plus,
  AlertTriangle,
  Bell,
  CheckCircle,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { PermissionGuard } from "@/components/permission-guard";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constant";

// API response types
interface ApiPatient {
  id: number;
  name: string;
  dateOfBirth: string;
}

interface ApiMedication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
}

interface ApiAssignment {
  id: number;
  patient: ApiPatient;
  medication: ApiMedication;
  startDate: string;
  numberOfDays: number;
}

// Client-side data types
interface Patient extends ApiPatient {
  age: number;
}

interface Medication extends ApiMedication {}

interface Assignment {
  id: string;
  patientId: string;
  medicationId: string;
  startDate: string;
  totalDays: number;
  remainingDays: number;
  status: "active" | "completed" | "overdue";
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [patientsRes, medicationsRes, assignmentsRes] = await Promise.all(
          [
            fetch(API_BASE_URL + "/patient/patient-list"),
            fetch(API_BASE_URL + "/medication/medication-list"),
            fetch(API_BASE_URL + "/assignment/assignment-list"),
          ]
        );

        if (!patientsRes.ok || !medicationsRes.ok || !assignmentsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const patientsData = await patientsRes.json();
        const medicationsData = await medicationsRes.json();
        const assignmentsData = await assignmentsRes.json();

        // Calculate age for patients
        const patientsWithAge: Patient[] = patientsData.data.map(
          (patient: ApiPatient) => ({
            ...patient,
            id: patient.id.toString(),
            age: calculateAge(patient.dateOfBirth),
          })
        );

        setPatients(patientsWithAge);
        setMedications(
          medicationsData.data.map((m: ApiMedication) => ({
            ...m,
            id: m.id.toString(),
          }))
        );

        // Process assignments with calculated status
        const processedAssignments = processAssignments(assignmentsData.data);
        setAssignments(processedAssignments);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error("Dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
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
  };

  // Calculate assignment status and remaining days
  const processAssignments = (
    apiAssignments: ApiAssignment[]
  ): Assignment[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return apiAssignments.map((assignment) => {
      const startDate = new Date(assignment.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + assignment.numberOfDays);

      // Calculate remaining days
      const timeDiff = endDate.getTime() - today.getTime();
      const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // Determine status
      let status: "active" | "completed" | "overdue" = "active";
      if (remainingDays < 0) status = "overdue";
      if (remainingDays === 0) status = "completed";

      return {
        id: assignment.id.toString(),
        patientId: assignment.patient.id.toString(),
        medicationId: assignment.medication.id.toString(),
        startDate: assignment.startDate,
        totalDays: assignment.numberOfDays,
        remainingDays,
        status,
      };
    });
  };

  const getPatientAssignments = (patientId: string) => {
    return assignments.filter(
      (assignment) => assignment.patientId === patientId
    );
  };

  const getMedicationById = (medicationId: string) => {
    return medications.find((med) => med.id.toString() === medicationId);
  };

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

  const activeAssignments = assignments.filter(
    (a) => a.status === "active"
  ).length;
  const overdueAssignments = assignments.filter(
    (a) => a.status === "overdue"
  ).length;
  const completedAssignments = assignments.filter(
    (a) => a.status === "completed"
  ).length;

  // Calculate treatments ending soon (within 7 days)
  const endingSoonAssignments = assignments.filter(
    (a) => a.status === "active" && a.remainingDays <= 7
  ).length;

  const handleViewOverdue = () => {
    router.push("/assignments?status=overdue");
  };

  const handleViewCompleted = () => {
    router.push("/assignments?status=completed");
  };

  const handleReviewEndingSoon = () => {
    router.push("/assignments?endingSoon=true");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role-based welcome message */}
        {user && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-900">
                  Welcome back, {user.name.split(" ")[0]}!
                </h2>
                <p className="text-sm text-blue-700">
                  {user.role === "admin" &&
                    "You have full administrative access to all system features."}
                  {user.role === "doctor" &&
                    "You can manage patients, medications, and treatment assignments."}
                  {user.role === "nurse" &&
                    "You can view patient information and update treatment progress."}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">Access Level</p>
                <p className="font-medium text-blue-800 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Treatments
              </CardTitle>
              <Pill className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activeAssignments}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {overdueAssignments}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {completedAssignments}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Role Based */}
        <div className="flex flex-wrap gap-4 mb-6">
          <PermissionGuard
            resource="patients"
            action="create"
            fallback={
              <Button variant="outline" disabled>
                <Lock className="w-4 h-4 mr-2" />
                Add Patient (Restricted)
              </Button>
            }
          >
            <Link href="/patients/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </Link>
          </PermissionGuard>

          <PermissionGuard
            resource="medications"
            action="create"
            fallback={
              <Button variant="outline" disabled>
                <Lock className="w-4 h-4 mr-2" />
                Add Medication (Restricted)
              </Button>
            }
          >
            <Link href="/medications/new">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </Link>
          </PermissionGuard>

          <PermissionGuard
            resource="assignments"
            action="create"
            fallback={
              <Button variant="outline" disabled>
                <Lock className="w-4 h-4 mr-2" />
                New Assignment (Restricted)
              </Button>
            }
          >
            <Link href="/assignments/new">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
            </Link>
          </PermissionGuard>
        </div>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications & Alerts
            </CardTitle>
            <CardDescription>Important updates and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueAssignments > 0 && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">
                      Overdue Treatments
                    </p>
                    <p className="text-sm text-red-600">
                      {overdueAssignments} treatment
                      {overdueAssignments > 1 ? "s are" : " is"} overdue and
                      require immediate attention.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                    onClick={handleViewOverdue}
                  >
                    View Details
                  </Button>
                </div>
              )}

              {endingSoonAssignments > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800">
                      Treatments Ending Soon
                    </p>
                    <p className="text-sm text-yellow-600">
                      {endingSoonAssignments} treatment
                      {endingSoonAssignments > 1 ? "s will" : " will"} end
                      within the next 7 days. Consider scheduling follow-ups.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 bg-transparent"
                    onClick={handleReviewEndingSoon}
                  >
                    Review
                  </Button>
                </div>
              )}

              {completedAssignments > 0 && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">
                      Recent Completions
                    </p>
                    <p className="text-sm text-green-600">
                      {completedAssignments} treatment
                      {completedAssignments > 1 ? "s have" : " has"} been
                      completed successfully.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                    onClick={handleViewCompleted}
                  >
                    View All
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex space-x-4 mb-6">
          <Link href="/patients">
            <Button variant="outline">Manage Patients</Button>
          </Link>
          <Link href="/medications">
            <Button variant="outline">Manage Medications</Button>
          </Link>
          <Link href="/assignments">
            <Button variant="outline">Manage Assignments</Button>
          </Link>
        </div>

        {/* Patient List with Assignments */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Patient Treatment Overview
          </h2>

          {patients.map((patient) => {
            const patientAssignments = getPatientAssignments(
              patient.id.toString()
            );

            return (
              <Card key={patient.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{patient.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Born:{" "}
                        {new Date(
                          patient.dateOfBirth
                        ).toLocaleDateString()}{" "}
                        (Age: {patient.age})
                      </CardDescription>
                    </div>
                    <PermissionGuard
                      resource="assignments"
                      action="create"
                      fallback={
                        <Button size="sm" disabled>
                          <Lock className="w-3 h-3 mr-1" />
                          Restricted Access
                        </Button>
                      }
                    >
                      <Link href={`/assignments/new?patientId=${patient.id}`}>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Assign Medication
                        </Button>
                      </Link>
                    </PermissionGuard>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {patientAssignments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No medication assignments
                    </div>
                  ) : (
                    <div className="divide-y">
                      {patientAssignments.map((assignment) => {
                        const medication = getMedicationById(
                          assignment.medicationId
                        );
                        const progress = getProgressPercentage(
                          assignment.remainingDays,
                          assignment.totalDays
                        );

                        return (
                          <div key={assignment.id} className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">
                                  {medication?.name}
                                </h4>
                                <p className="text-gray-600">
                                  {medication?.dosage} • {medication?.frequency}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Started:{" "}
                                  {new Date(
                                    assignment.startDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge
                                className={getStatusColor(assignment.status)}
                              >
                                {assignment.status.charAt(0).toUpperCase() +
                                  assignment.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Treatment Progress</span>
                                <span>
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
                                  assignment.status === "overdue"
                                    ? "bg-red-100"
                                    : ""
                                }`}
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Day 1</span>
                                <span>Day {assignment.totalDays}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
