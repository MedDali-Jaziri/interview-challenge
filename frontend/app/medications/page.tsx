"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  ArrowLeft,
  Pill,
  Lock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { PermissionGuard } from "@/components/permission-guard";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constant";

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
}

function MedicationsContent() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    uniqueFrequencies: 0,
    mostCommonFrequency: "",
  });

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          API_BASE_URL + "/medication/medication-list"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch medications");
        }

        const data = await response.json();
        setMedications(data.data || []);

        // Calculate stats
        const frequencies = data.data.map((m: Medication) => m.frequency);
        const frequencyCount: Record<string, number> = {};

        frequencies.forEach((freq: string) => {
          frequencyCount[freq] = (frequencyCount[freq] || 0) + 1;
        });

        let mostCommon = "";
        let maxCount = 0;
        for (const freq in frequencyCount) {
          if (frequencyCount[freq] > maxCount) {
            mostCommon = freq;
            maxCount = frequencyCount[freq];
          }
        }

        setStats({
          total: data.data.length,
          uniqueFrequencies: new Set(frequencies).size,
          mostCommonFrequency: mostCommon,
        });
      } catch (err) {
        setError("Failed to load medication data. Please try again later.");
        console.error("Medication fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  const filteredMedications = medications.filter(
    (medication) =>
      medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.frequency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteMedication = async (id: number) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/medication/medication-remove/?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete medication");
      }

      // Refresh medication list
      setMedications((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError("Failed to delete medication. Please try again.");
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading medication data...</p>
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
                Medication Management
              </h1>
              <p className="text-gray-600">
                Manage medication database and information
              </p>
            </div>
          </div>
          <PermissionGuard
            resource="medications"
            action="create"
            fallback={
              <div className="flex items-center text-gray-500">
                <Lock className="w-4 h-4 mr-2" />
                <span className="text-sm">View Only Access</span>
              </div>
            }
          >
            <Link href="/medications/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Medication
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
                  You have read-only access to medication information.
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
              placeholder="Search medications by name or frequency..."
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
              <CardTitle className="text-lg">Total Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unique Frequencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.uniqueFrequencies}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Most Common Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-purple-600">
                {stats.mostCommonFrequency}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medication List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map((medication) => (
            <Card
              key={medication.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Pill className="w-5 h-5 mr-2 text-blue-600" />
                    <CardTitle className="text-xl">{medication.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">ID: {medication.id}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Dosage</p>
                    <p className="font-semibold">{medication.dosage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Frequency</p>
                    <p className="font-semibold">{medication.frequency}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="flex space-x-2">
                      <PermissionGuard
                        resource="medications"
                        action="update"
                        fallback={
                          <Button size="sm" variant="outline" disabled>
                            <Lock className="w-3 h-3 mr-1" />
                            View Only
                          </Button>
                        }
                      >
                        <Link href={`/medications/${medication.id}/edit`}>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </Link>
                      </PermissionGuard>

                      <PermissionGuard
                        resource="medications"
                        action="delete"
                        fallback={<></>}
                      >
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMedication(medication.id)}
                        >
                          Delete
                        </Button>
                      </PermissionGuard>
                    </div>

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
                      <Link
                        href={`/assignments/new?medicationId=${medication.id}`}
                      >
                        <Button size="sm">Prescribe</Button>
                      </Link>
                    </PermissionGuard>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMedications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No medications found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MedicationsPage() {
  return (
    <AuthGuard>
      <MedicationsContent />
    </AuthGuard>
  );
}
