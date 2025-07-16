"use client";

import type React from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Calendar, User, Pill, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Header } from "@/components/header";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/lib/constant";

interface Patient {
  id: number;
  name: string;
  dateOfBirth: string;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
}

function NewAssignmentContent() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");
  const preselectedMedicationId = searchParams.get("medicationId");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    patientId: preselectedPatientId || "",
    medicationId: preselectedMedicationId || "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    totalDays: "3",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [patientsRes, medicationsRes] = await Promise.all([
          fetch(API_BASE_URL + "/patient/patient-list"),
          fetch(API_BASE_URL + "/medication/medication-list"),
        ]);

        if (!patientsRes.ok)
          throw new Error(`Failed to fetch patients: ${patientsRes.status}`);
        if (!medicationsRes.ok)
          throw new Error(
            `Failed to fetch medications: ${medicationsRes.status}`
          );

        const patientsData = await patientsRes.json();
        const medicationsData = await medicationsRes.json();

        // Debugging: Log API responses
        console.log("Patients API response:", patientsData);
        console.log("Medications API response:", medicationsData);

        // Handle different API response structures
        const extractedPatients = Array.isArray(patientsData)
          ? patientsData
          : patientsData.patients || patientsData.data || [];

        const extractedMedications = Array.isArray(medicationsData)
          ? medicationsData
          : medicationsData.medications || medicationsData.data || [];

        setPatients(extractedPatients);
        setMedications(extractedMedications);
      } catch (error) {
        console.error("Data fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const selectedPatient = patients.find(
    (p) => p.id.toString() === formData.patientId
  );
  const selectedMedication = medications.find(
    (m) => m.id.toString() === formData.medicationId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        patientId: Number(formData.patientId),
        medicationId: Number(formData.medicationId),
        startDate: formData.startDate,
        numberOfDays: Number(formData.totalDays),
      };

      console.log("Creating assignment with payload:", payload);

      const response = await fetch(
        API_BASE_URL + "/assignment/create-assignment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to create assignment: ${response.status} - ${errorData}`
        );
      }

      toast({
        title: "Success",
        description: "Assignment created successfully!",
      });

      router.push("/assignments");
    } catch (error) {
      console.error("Create assignment error:", error);
      toast({
        title: "Error",
        description: "Failed to create assignment "+error,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateEndDate = () => {
    if (!formData.startDate || !formData.totalDays) return "";
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(
      startDate.getDate() + Number.parseInt(formData.totalDays) - 1
    );
    return format(endDate, "MMM dd, yyyy");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link href="/assignments">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assignments
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              New Treatment Assignment
            </h1>
            <p className="text-gray-600">Assign a medication to a patient</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Assignment Details
              </CardTitle>
              <CardDescription>
                Create a new medication assignment for a patient.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, patientId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.length > 0 ? (
                        patients.map((patient) => (
                          <SelectItem
                            key={patient.id}
                            value={patient.id.toString()}
                          >
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              {patient.name} (Age:{" "}
                              {calculateAge(patient.dateOfBirth)})
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No patients available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedPatient ? (
                    <p className="text-sm text-gray-600">
                      DOB:{" "}
                      {format(
                        new Date(selectedPatient.dateOfBirth),
                        "MMM dd, yyyy"
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-red-500">
                      {patients.length === 0
                        ? "No patients found in the system"
                        : "Please select a patient"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicationId">Medication *</Label>
                  <Select
                    value={formData.medicationId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, medicationId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a medication" />
                    </SelectTrigger>
                    <SelectContent>
                      {medications.length > 0 ? (
                        medications.map((medication) => (
                          <SelectItem
                            key={medication.id}
                            value={medication.id.toString()}
                          >
                            <div className="flex items-center">
                              <Pill className="w-4 h-4 mr-2" />
                              {medication.name} - {medication.dosage}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No medications available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedMedication ? (
                    <p className="text-sm text-gray-600">
                      Frequency: {selectedMedication.frequency}
                    </p>
                  ) : (
                    <p className="text-sm text-red-500">
                      {medications.length === 0
                        ? "No medications found in the system"
                        : "Please select a medication"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalDays">Treatment Duration (Days) *</Label>
                  <Input
                    id="totalDays"
                    type="number"
                    min="1"
                    max="365"
                    placeholder="Enter number of days"
                    value={formData.totalDays}
                    onChange={(e) =>
                      setFormData({ ...formData, totalDays: e.target.value })
                    }
                    required
                  />
                  {calculateEndDate() && (
                    <p className="text-sm text-gray-600">
                      Treatment will end on: {calculateEndDate()}
                    </p>
                  )}
                </div>

                {/* Assignment Summary */}
                {formData.patientId &&
                  formData.medicationId &&
                  formData.startDate &&
                  formData.totalDays && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Assignment Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Patient:</span>
                          <span>{selectedPatient?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Medication:</span>
                          <span>
                            {selectedMedication?.name} (
                            {selectedMedication?.dosage})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Frequency:</span>
                          <span>{selectedMedication?.frequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Duration:</span>
                          <span>{formData.totalDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Period:</span>
                          <span>
                            {format(
                              new Date(formData.startDate),
                              "MMM dd, yyyy"
                            )}{" "}
                            - {calculateEndDate()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                <div className="flex justify-end space-x-4 pt-6">
                  <Link href="/assignments">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !formData.patientId ||
                      !formData.medicationId ||
                      !formData.startDate ||
                      !formData.totalDays ||
                      patients.length === 0 ||
                      medications.length === 0
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Assignment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewAssignmentPage() {
  return (
    <AuthGuard>
      <NewAssignmentContent />
    </AuthGuard>
  );
}
