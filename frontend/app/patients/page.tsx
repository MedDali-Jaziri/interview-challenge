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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Search,
  Plus,
  ArrowLeft,
  Lock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { PermissionGuard } from "@/components/permission-guard";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constant";

interface Patient {
  id: number;
  name: string;
  dateOfBirth: string;
  age: number;
}

function PatientsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_BASE_URL + "/patient/patient-list");

        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }

        const data = await response.json();
        const patientsWithAge = data.data.map((patient: any) => ({
          ...patient,
          id: patient.id,
          age: calculateAge(patient.dateOfBirth),
        }));

        setPatients(patientsWithAge);

        // Calculate stats
        const today = new Date();
        const thisMonth = today.getMonth();

        setStats({
          total: patientsWithAge.length,
          active: patientsWithAge.length, // This would come from backend in real app
          newThisMonth: patientsWithAge.filter((p: any) => {
            const dobMonth = new Date(p.dateOfBirth).getMonth();
            return dobMonth === thisMonth;
          }).length,
        });
      } catch (err) {
        setError("Failed to load patient data. Please try again later.");
        console.error("Patient fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

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

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePatient = async (id: number) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/patient/patient-remove/?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete patient");
      }

      // Refresh patient list
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError("Failed to delete patient. Please try again.");
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading patient data...</p>
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
                Patient Management
              </h1>
              <p className="text-gray-600">
                Manage patient records and information
              </p>
            </div>
          </div>
          <PermissionGuard
            resource="patients"
            action="create"
            fallback={
              <div className="flex items-center text-gray-500">
                <Lock className="w-4 h-4 mr-2" />
                <span className="text-sm">View Only Access</span>
              </div>
            }
          >
            <Link href="/patients/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Patient
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
                  You have read-only access to patient information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.newThisMonth}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{patient.name}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Age {patient.age}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Patient ID: {patient.id}
                  </div>
                  <div className="flex space-x-2">
                    <PermissionGuard
                      resource="patients"
                      action="update"
                      fallback={
                        <Button size="sm" variant="outline" disabled>
                          <Lock className="w-3 h-3 mr-1" />
                          View Only
                        </Button>
                      }
                    >
                      <Link href={`/patients/${patient.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit Patient
                        </Button>
                      </Link>
                    </PermissionGuard>

                    <PermissionGuard
                      resource="patients"
                      action="delete"
                      fallback={<></>}
                    >
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePatient(patient.id)}
                      >
                        Delete
                      </Button>
                    </PermissionGuard>

                    <PermissionGuard
                      resource="assignments"
                      action="create"
                      fallback={
                        <Button size="sm" disabled>
                          <Lock className="w-3 h-3 mr-1" />
                          Restricted
                        </Button>
                      }
                    >
                      <Link href={`/assignments/new?patientId=${patient.id}`}>
                        <Button size="sm">Assign Medication</Button>
                      </Link>
                    </PermissionGuard>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No patients found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientsPage() {
  return (
    <AuthGuard>
      <PatientsContent />
    </AuthGuard>
  );
}
