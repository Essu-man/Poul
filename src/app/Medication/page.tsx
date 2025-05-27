"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface MedicationEntry {
  date: string;
  medication: string;
  dosage: string;
  administeredBy: string;
  notes: string;
}

export default function MedicationTrackingPage() {
  const [medEntry, setMedEntry] = useState<MedicationEntry>({
    date: format(new Date(), "yyyy-MM-dd"),
    medication: "",
    dosage: "",
    administeredBy: "",
    notes: "",
  });

  const [medHistory, setMedHistory] = useState<MedicationEntry[]>([
    {
      date: format(new Date(new Date().setDate(new Date().getDate() - 1)), "yyyy-MM-dd"),
      medication: "Antibiotic A",
      dosage: "10ml per 100 birds",
      administeredBy: "Dr. Smith",
      notes: "Routine check, no side effects.",
    },
    {
      date: format(new Date(new Date().setDate(new Date().getDate() - 2)), "yyyy-MM-dd"),
      medication: "Vitamin B Complex",
      dosage: "5ml per 50 birds",
      administeredBy: "John Doe",
      notes: "For improved immunity.",
    },
  ]);

  // Add new medication record
  const handleSave = () => {
    if (!medEntry.medication || !medEntry.dosage) return;
    setMedHistory([{ ...medEntry }, ...medHistory]);
    setMedEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      medication: "",
      dosage: "",
      administeredBy: "",
      notes: "",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="medication" />
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Medication Tracking</h1>
          <Button variant="default">Export Data</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Record Medication Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Record Medication</h2>
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={medEntry.date}
                    onChange={e => setMedEntry({ ...medEntry, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Medication Name</Label>
                  <Input
                    type="text"
                    value={medEntry.medication}
                    onChange={e => setMedEntry({ ...medEntry, medication: e.target.value })}
                    placeholder="e.g. Antibiotic A"
                  />
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Input
                    type="text"
                    value={medEntry.dosage}
                    onChange={e => setMedEntry({ ...medEntry, dosage: e.target.value })}
                    placeholder="e.g. 10ml per 100 birds"
                  />
                </div>
                <div>
                  <Label>Administered By</Label>
                  <Input
                    type="text"
                    value={medEntry.administeredBy}
                    onChange={e => setMedEntry({ ...medEntry, administeredBy: e.target.value })}
                    placeholder="e.g. Dr. Smith"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={medEntry.notes}
                    onChange={e => setMedEntry({ ...medEntry, notes: e.target.value })}
                    placeholder="Enter any additional information"
                  />
                </div>
                <Button className="w-full" onClick={handleSave}>
                  Save Record
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Medications Summary */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Current Medications</h2>
              <div className="space-y-4">
                {medHistory.length === 0 ? (
                  <div className="text-gray-500">No medications recorded.</div>
                ) : (
                  medHistory.slice(0, 3).map((entry, idx) => (
                    <div key={idx} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                      <div className="font-medium">{entry.medication}</div>
                      <div className="text-sm text-gray-600">Dosage: {entry.dosage}</div>
                      <div className="text-xs text-gray-400">Date: {entry.date}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medication History Table */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Medication History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Administered By</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medHistory.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.medication}</TableCell>
                    <TableCell>{entry.dosage}</TableCell>
                    <TableCell>{entry.administeredBy}</TableCell>
                    <TableCell>{entry.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}