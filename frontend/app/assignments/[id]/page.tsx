"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Pill,
  Edit,
  CheckCircle,
  AlertCircle,
  Loader2,
  ClipboardList,
  CalendarDays,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/constant";

// Updated interfaces based on API responses
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

interface AssignmentDetails {
  id: string;
  patient: Patient;
  medication: Medication;
  startDate: string;
  numberOfDays: number;
  // Adding calculated fields
  status: "active" | "completed" | "overdue";
  remainingDays: number;
}

export default function AssignmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch assignment details
        const res = await fetch(
          `${API_BASE_URL}/assignment/assignment-details?id=${assignmentId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch assignment details");
        }
        const data = await res.json();
        const assignmentData = data.data;

        // 2. Fetch remaining days
        const remainingRes = await fetch(
          `${API_BASE_URL}/assignment/remaining-days`
        );
        if (!remainingRes.ok) {
          throw new Error("Failed to fetch remaining days");
        }
        const remainingData = await remainingRes.json();

        const remainingList = remainingData.data;

        // 3. Match by assignment ID and extract remaining days
        const matchingEntry = remainingList.find(
          (entry: any) =>
            `${entry["Assignment Id: "]}` === `${assignmentData.id}`
        );

        const remainingDays = matchingEntry
          ? Number(matchingEntry["Remaining Days: "])
          : 0; // fallback

        // 4. Determine status
        let status: "active" | "completed" | "overdue" = "active";
        if (remainingDays === 0) {
          status = "completed";
        } else if (remainingDays < 0) {
          status = "overdue";
        }

        // 5. Set state
        setAssignment({
          ...assignmentData,
          status,
          remainingDays,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load assignment details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchAssignmentDetails();
    }
  }, [assignmentId]);

  // Calculate assignment status based on dates
  const calculateAssignmentStatus = (
    startDate: string,
    totalDays: number
  ): { status: "active" | "completed" | "overdue" } => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + totalDays - 1);
    const today = new Date();

    // Normalize dates to compare without time
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    if (todayDate > endDate) {
      const diffTime = Math.abs(todayDate.getTime() - endDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { status: "completed" };
    } else if (todayDate < start) {
      return { status: "active" };
    } else {
      const diffTime = Math.abs(endDate.getTime() - todayDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { status: "active" };
    }
  };

  const handleMarkComplete = async () => {
    if (!assignment) return;

    try {
      setCompleting(true);

      // API call to mark assignment as complete
      const res = await fetch(
        `${API_BASE_URL}/assignment/${assignment.id}/complete`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to mark assignment as complete");
      }

      // Update local state
      setAssignment({
        ...assignment,
        status: "completed",
      });

      // Redirect to assignments page after a short delay
      setTimeout(() => {
        router.push("/assignments");
      }, 1500);
    } catch (err) {
      console.error("Error completing assignment:", err);
      setError("Failed to mark assignment as complete. Please try again.");
    } finally {
      setCompleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressPercentage = (remaining: number, total: number) => {
    if (remaining <= 0) return 100;
    return Math.max(0, ((total - remaining) / total) * 100);
  };

  const calculateEndDate = (startDate: string, totalDays: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + totalDays - 1);
    return end;
  };

  const calculateAge = (dateOfBirth: string): number => {
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
  };

  // ... rest of the code remains the same (error, loading, and render components)
  // Make sure to update references to:
  //   assignment.patient instead of patient
  //   assignment.medication instead of medication
  //   assignment.numberOfDays instead of assignment.totalDays

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-md">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Assignment
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
            <Link href="/assignments">
              <Button variant="outline">Back to Assignments</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-10 w-32" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Patient Information Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Medication Information Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Treatment Progress Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <Skeleton className="h-5 w-40 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Assignment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The assignment you're looking for doesn't exist.
          </p>
          <Link href="/assignments">
            <Button>Back to Assignments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = getProgressPercentage(
    assignment.remainingDays,
    assignment.numberOfDays
  );
  const endDate = calculateEndDate(
    assignment.startDate,
    assignment.numberOfDays
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/assignments">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Assignments
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Assignment Details
                </h1>
                <p className="text-gray-600">
                  Treatment assignment information
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href={`/assignments/${assignment.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Assignment
                </Button>
              </Link>
              {assignment.status === "active" && (
                <Button
                  onClick={handleMarkComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-lg">
                  {assignment.patient.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">
                  {new Date(
                    assignment.patient.dateOfBirth
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-medium">
                  {calculateAge(assignment.patient.dateOfBirth)} years old
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Patient ID</p>
                <p className="font-medium">{assignment.patient.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Medication Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="w-5 h-5 mr-2" />
                Medication Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Medication</p>
                <p className="font-semibold text-lg">
                  {assignment.medication.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dosage</p>
                <p className="font-medium">{assignment.medication.dosage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Frequency</p>
                <p className="font-medium">{assignment.medication.frequency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Medication ID</p>
                <p className="font-medium">{assignment.medication.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Treatment Progress */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Treatment Progress
              </CardTitle>
              <Badge className={getStatusColor(assignment.status)}>
                {assignment.status.charAt(0).toUpperCase() +
                  assignment.status.slice(1)}
              </Badge>
            </div>
            <CardDescription>
              Track the progress of this treatment assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-semibold">
                  {new Date(assignment.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-semibold">
                  {format(endDate, "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Duration</p>
                <p className="font-semibold">{assignment.numberOfDays} days</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress</span>
                <span className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {assignment.remainingDays > 0
                    ? `${assignment.remainingDays} days remaining`
                    : assignment.remainingDays === 0
                    ? "Treatment completed"
                    : `${Math.abs(assignment.remainingDays)} days overdue`}
                </span>
              </div>
              <Progress
                value={progress}
                className={`h-3 ${
                  assignment.status === "overdue" ? "bg-red-100" : ""
                }`}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Day 1</span>
                <span>Day {assignment.numberOfDays}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Assignment Summary</h4>
              <p className="text-sm text-gray-600">
                {assignment.patient.name} is taking {assignment.medication.name}{" "}
                ({assignment.medication.dosage}){" "}
                {assignment.medication.frequency.toLowerCase()}
                for {assignment.numberOfDays} days, starting from{" "}
                {new Date(assignment.startDate).toLocaleDateString()}.
                {assignment.remainingDays > 0 &&
                  ` There are ${assignment.remainingDays} days remaining in this treatment.`}
                {assignment.remainingDays === 0 &&
                  " This treatment has been completed."}
                {assignment.remainingDays < 0 &&
                  ` This treatment is ${Math.abs(
                    assignment.remainingDays
                  )} days overdue.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
