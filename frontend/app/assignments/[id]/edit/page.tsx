"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Calendar, User, Pill } from "lucide-react";
import { API_BASE_URL } from "@/lib/constant";

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

interface Assignment {
  id: string;
  patient: Patient;
  medication: Medication;
  startDate: string;
  numberOfDays: number;
}

export default function EditAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  const [formData, setFormData] = useState({
    patientId: "",
    medicationId: "",
    startDate: "",
    totalDays: "",
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients
        const patientRes = await fetch(`${API_BASE_URL}/patient/patient-list`);
        const patientData = await patientRes.json();
        setPatients(patientData.data);

        // Fetch medications
        const medRes = await fetch(
          `${API_BASE_URL}/medication/medication-list`
        );
        const medData = await medRes.json();
        setMedications(medData.data);

        // Fetch assignment
        const assignRes = await fetch(
          `${API_BASE_URL}/assignment/assignment-details?id=${assignmentId}`
        );
        const assignData = await assignRes.json();
        const data = assignData.data;

        setAssignment(data);
        setFormData({
          patientId: data.patient.id,
          medicationId: data.medication.id,
          startDate: data.startDate.slice(0, 10), // format to YYYY-MM-DD
          totalDays: data.numberOfDays.toString(),
        });
      } catch (err) {
        console.error("Failed to load assignment data", err);
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) fetchData();
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/assignment/assignment-update?id=${assignmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: formData.startDate,
            numberOfDays: parseInt(formData.totalDays),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update assignment");
      router.push("/assignments");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEndDate = () => {
    if (!formData.startDate || !formData.totalDays) return "";
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Number(formData.totalDays) - 1);
    return endDate.toLocaleDateString();
  };

  if (loading || !assignment) {
    return <p className="p-10 text-center">Loading assignment details...</p>;
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center">
          <Link href="/assignments">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assignments
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Assignment
            </h1>
            <p className="text-gray-600">Update treatment assignment details</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Assignment Details
            </CardTitle>
            <CardDescription>Update medication assignment.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient */}
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient</Label>
                <Select value={formData.patientId} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <User className="w-4 h-4 mr-2" />
                        {p.name} (Age: {calculateAge(p.dateOfBirth)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Medication */}
              <div className="space-y-2">
                <Label>Medication</Label>
                <Select value={formData.medicationId} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {medications.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <Pill className="w-4 h-4 mr-2" />
                        {m.name} - {m.dosage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
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

              {/* Total Days */}
              <div className="space-y-2">
                <Label htmlFor="totalDays">Treatment Duration (Days) *</Label>
                <Input
                  id="totalDays"
                  type="number"
                  min={1}
                  value={formData.totalDays}
                  onChange={(e) =>
                    setFormData({ ...formData, totalDays: e.target.value })
                  }
                  required
                />
                {calculateEndDate() && (
                  <p className="text-sm text-gray-600">
                    End date: {calculateEndDate()}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-6 space-x-4">
                <Link href="/assignments">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Updating..." : "Update Assignment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
