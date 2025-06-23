"use client";

import { Sidebar } from "@/components/Sidebar";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import Link from "next/link";
import { useState, useEffect } from "react";


import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { db, auth } from "@/lib/firebase"; 
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

interface EggProduction {
  id?: string; 
  date: string;
  peewee: { crates: number; pieces: number };
  small: { crates: number; pieces: number };
  medium: { crates: number; pieces: number };
  large: { crates: number; pieces: number };
  extraLarge: { crates: number; pieces: number };
  jumbo: { crates: number; pieces: number };
}

export default function EggProductionPage() {
  const [eggProduction, setEggProduction] = useState<EggProduction>({
    date: format(new Date(), "yyyy-MM-dd"),
    peewee: { crates: 0, pieces: 0 },
    small: { crates: 0, pieces: 0 },
    medium: { crates: 0, pieces: 0 },
    large: { crates: 0, pieces: 0 },
    extraLarge: { crates: 0, pieces: 0 },
    jumbo: { crates: 0, pieces: 0 },
  });

  const [productionHistory, setProductionHistory] = useState<EggProduction[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EggProduction | null>(null);

  // Handler functions (move inside the component)
  const handleDeleteClick = (record: EggProduction) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (record: EggProduction) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRecord) {
      await handleDeleteRecord(selectedRecord.date);
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      await fetchProductionHistory();
    }
  };

  const handleEditConfirm = async () => {
    if (selectedRecord) {
      await handleUpdateRecord();
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      await fetchProductionHistory();
    }
  };

  const fetchProductionHistory = async () => {
    const user = auth.currentUser;
    if (!user) return; // Wait until user is loaded

    try {
      const querySnapshot = await getDocs(collection(db, "users", user.uid, "eggProduction"));
      setProductionHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Failed to fetch production records');
    }
  };

  const calculateTotalEggs = (category: { crates: number; pieces: number } | undefined) => {
    if (!category) return 0;
    return (category.crates || 0) * 30 + (category.pieces || 0);
  };

  const handleEggInputChange = (
    category: keyof Omit<EggProduction, "date">,
    field: "crates" | "pieces",
    value: string,
  ) => {
    const numValue = parseInt(value) || 0;
    setEggProduction((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numValue,
      },
    }));
  };

  const calculateTotalCrates = () => {
    return Object.values(eggProduction).reduce((acc, category) => {
      if (typeof category === "object" && category !== null) {
        return acc + category.crates;
      }
      return acc;
    }, 0);
  };

  const calculateTotalPieces = () => {
    return Object.values(eggProduction).reduce((acc, category) => {
      if (typeof category === "object" && category !== null) {
        return acc + category.pieces;
      }
      return acc;
    }, 0);
  };

  const handleSaveRecord = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Check if record already exists for this date
      const existingRecord = productionHistory.find(record => record.date === eggProduction.date);
      
      if (existingRecord) {
        toast.error('A record already exists for this date. Please choose a different date or edit the existing record.', {
          duration: 5000,
          icon: "⚠️",
          style: {
            background: '#FEF3C7', // Amber-50
            color: '#92400E', // Amber-800
            border: '1px solid #D97706', // Amber-600
          },
        });
        return;
      }

      await addDoc(collection(db, "users", user.uid, "eggProduction"), eggProduction);

      // Show success toast
      toast.success('Production record saved successfully', {
        icon: "✅",
        style: {
          background: '#10B981',
          color: 'white',
        },
      });

      // Reset form after saving
      setEggProduction({
        date: format(new Date(), "yyyy-MM-dd"),
        peewee: { crates: 0, pieces: 0 },
        small: { crates: 0, pieces: 0 },
        medium: { crates: 0, pieces: 0 },
        large: { crates: 0, pieces: 0 },
        extraLarge: { crates: 0, pieces: 0 },
        jumbo: { crates: 0, pieces: 0 }
      });

      // Fetch updated records
      fetchProductionHistory();
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save record', {
        icon: "❌",
      });
    }
  };


  useEffect(() => {
    const fetchProductionHistory = async () => {
      const user = auth.currentUser;
      if (!user) return; // Wait until user is loaded

      try {
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "eggProduction"));
        setProductionHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error('Failed to fetch production records');
      }
    };

    // Only fetch if user is present
    if (auth.currentUser) {
      fetchProductionHistory();
    }
  }, [auth.currentUser]);

  const handleUpdateRecord = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const recordId = selectedRecord?.id;
    if (!recordId) return;

    try {
      await updateDoc(doc(db, "users", user.uid, "eggProduction", recordId), eggProduction);

      toast.success('Record updated successfully');
      setIsEditing(false);
      setIsDialogOpen(false); 
      
      // Reset form
      setEggProduction({
        date: format(new Date(), "yyyy-MM-dd"),
        peewee: { crates: 0, pieces: 0 },
        small: { crates: 0, pieces: 0 },
        medium: { crates: 0, pieces: 0 },
        large: { crates: 0, pieces: 0 },
        extraLarge: { crates: 0, pieces: 0 },
        jumbo: { crates: 0, pieces: 0 }
      });

      // Refresh the production history
      fetchProductionHistory();
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record', {
        icon: "❌",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEggProduction({
      date: format(new Date(), "yyyy-MM-dd"),
      peewee: { crates: 0, pieces: 0 },
      small: { crates: 0, pieces: 0 },
      medium: { crates: 0, pieces: 0 },
      large: { crates: 0, pieces: 0 },
      extraLarge: { crates: 0, pieces: 0 },
      jumbo: { crates: 0, pieces: 0 }
    });
  };

  const handleEditRecord = (record: EggProduction) => {
    setEggProduction(record);
    setIsEditing(true);
  };

  const handleDeleteRecord = async (date: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const recordId = selectedRecord?.id;
    if (!recordId) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "eggProduction", recordId));

      toast.success('Record deleted successfully', {
        icon: "✅",
        style: {
          background: '#10B981',
          color: 'white',
        },
      });

      // Refresh the production history
      fetchProductionHistory();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record', {
        icon: "❌",
      });
    }
  };

  const handleExportData = () => {
    const csvContent = [
      ["Date", "Category", "Crates", "Pieces", "Total Eggs"],
      ...productionHistory.flatMap((record) => [
        ["Peewee", record.peewee.crates, record.peewee.pieces, calculateTotalEggs(record.peewee)],
        ["Small", record.small.crates, record.small.pieces, calculateTotalEggs(record.small)],
        ["Medium", record.medium.crates, record.medium.pieces, calculateTotalEggs(record.medium)],
        ["Large", record.large.crates, record.large.pieces, calculateTotalEggs(record.large)],
        ["Extra Large", record.extraLarge.crates, record.extraLarge.pieces, calculateTotalEggs(record.extraLarge)],
        ["Jumbo", record.jumbo.crates, record.jumbo.pieces, calculateTotalEggs(record.jumbo)],
      ].map(([category, crates, pieces, total]) =>
        [record.date, category, crates, pieces, total].join(",")
      )).join("\n")
    ];

    const blob = new Blob([csvContent.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `egg-production-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-gray-20">
      <Sidebar activeTab="egg-production" />
      <div className="flex-1 overflow-auto">
        <Header activeTab="egg-production" />
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Egg Production Records</h2>
            <p className="text-gray-500 mb-4">Enter today's egg collection data</p>
            
            {/* Collection Date */}
            <div className="mb-6">
              <Label>Collection Date</Label>
              <div className="w-[200px]">
                <CustomDatePicker
                  selectedDate={new Date(eggProduction.date)}
                  onDateChange={(date) => {
                    setEggProduction(prev => ({
                      ...prev,
                      date: format(date, "yyyy-MM-dd")
                    }));
                  }}
                />
              </div>
            </div>

            {/* Egg Size Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Peewee, Small, Medium, Large, Extra Large, and Jumbo cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Peewee</CardTitle>
                  <CardDescription>Very small eggs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="peewee-crates">Number of Crates</Label>
                      <Input
                        id="peewee-crates"
                        type="number"
                        min="0"
                        value={eggProduction.peewee.crates}
                        onChange={(e) => handleEggInputChange("peewee", "crates", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="peewee-pieces">Number of Pieces</Label>
                      <Input
                        id="peewee-pieces"
                        type="number"
                        min="0"
                        max="29"
                        value={eggProduction.peewee.pieces}
                        onChange={(e) => handleEggInputChange("peewee", "pieces", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500 w-full text-right">
                    Total: <span className="font-bold">{calculateTotalEggs(eggProduction.peewee)}</span> eggs
                  </p>
                </CardFooter>
              </Card>

              {/* Small Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Small</CardTitle>
                  <CardDescription>Small sized eggs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="small-crates">Number of Crates</Label>
                      <Input
                        id="small-crates"
                        type="number"
                        min="0"
                        value={eggProduction.small.crates}
                        onChange={(e) => handleEggInputChange("small", "crates", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="small-pieces">Number of Pieces</Label>
                      <Input
                        id="small-pieces"
                        type="number"
                        min="0"
                        max="29"
                        value={eggProduction.small.pieces}
                        onChange={(e) => handleEggInputChange("small", "pieces", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500 w-full text-right">
                    Total: <span className="font-bold">{calculateTotalEggs(eggProduction.small)}</span> eggs
                  </p>
                </CardFooter>
              </Card>

              {/* Medium Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Medium</CardTitle>
                  <CardDescription>Medium sized eggs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="medium-crates">Number of Crates</Label>
                      <Input
                        id="medium-crates"
                        type="number"
                        min="0"
                        value={eggProduction.medium.crates}
                        onChange={(e) => handleEggInputChange("medium", "crates", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="medium-pieces">Number of Pieces</Label>
                      <Input
                        id="medium-pieces"
                        type="number"
                        min="0"
                        max="29"
                        value={eggProduction.medium.pieces}
                        onChange={(e) => handleEggInputChange("medium", "pieces", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500 w-full text-right">
                    Total: <span className="font-bold">{calculateTotalEggs(eggProduction.medium)}</span> eggs
                  </p>
                </CardFooter>
              </Card>

              {/* Large Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Large</CardTitle>
                  <CardDescription>Large sized eggs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="large-crates">Number of Crates</Label>
                      <Input
                        id="large-crates"
                        type="number"
                        min="0"
                        value={eggProduction.large.crates}
                        onChange={(e) => handleEggInputChange("large", "crates", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="large-pieces">Number of Pieces</Label>
                      <Input
                        id="large-pieces"
                        type="number"
                        min="0"
                        max="29"
                        value={eggProduction.large.pieces}
                        onChange={(e) => handleEggInputChange("large", "pieces", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500 w-full text-right">
                    Total: <span className="font-bold">{calculateTotalEggs(eggProduction.large)}</span> eggs
                  </p>
                </CardFooter>
              </Card>

              {/* Extra Large Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Extra Large</CardTitle>
                  <CardDescription>Very large eggs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="extraLarge-crates">Number of Crates</Label>
                      <Input
                        id="extraLarge-crates"
                        type="number"
                        min="0"
                        value={eggProduction.extraLarge.crates}
                        onChange={(e) => handleEggInputChange("extraLarge", "crates", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="extraLarge-pieces">Number of Pieces</Label>
                      <Input
                        id="extraLarge-pieces"
                        type="number"
                        min="0"
                        max="29"
                        value={eggProduction.extraLarge.pieces}
                        onChange={(e) => handleEggInputChange("extraLarge", "pieces", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500 w-full text-right">
                    Total: <span className="font-bold">{calculateTotalEggs(eggProduction.extraLarge)}</span> eggs
                  </p>
                </CardFooter>
              </Card>
              {/* Jumbo Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Jumbo</CardTitle>
                  <CardDescription>Jumbo sized eggs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="jumbo-crates">Number of Crates</Label>
                      <Input
                        id="jumbo-crates"
                        type="number"
                        min="0"
                        value={eggProduction.jumbo.crates}
                        onChange={(e) => handleEggInputChange("jumbo", "crates", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="extraLarge-pieces">Number of Pieces</Label>
                      <Input
                        id="jumbo-pieces"
                        type="number"
                        min="0"
                        max="29"
                        value={eggProduction.jumbo.pieces}
                        onChange={(e) => handleEggInputChange("jumbo", "pieces", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500 w-full text-right">
                    Total: <span className="font-bold">{calculateTotalEggs(eggProduction.jumbo)}</span> eggs
                  </p>
                </CardFooter>
              </Card>

              {/* Summary Card */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Total egg production</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Crates:</span>
                      <span className="font-bold text-lg">{calculateTotalCrates()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Pieces:</span>
                      <span className="font-bold text-lg">{calculateTotalPieces()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Grand Total:</span>
                      <span className="font-bold text-lg text-emerald-600">
                        {Object.values(eggProduction)
                          .reduce((acc, category) => {
                            if (typeof category === "object" && category !== null) {
                              return acc + calculateTotalEggs(category);
                            }
                            return acc;
                          }, 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateRecord}>Update Record</Button>
                    </>
                  ) : (
                    <Button onClick={handleSaveRecord}>Save Record</Button>
                  )}
                </CardFooter>
              </Card>

              {/* Production History */}
              <div className="col-span-full mt-8">
                <h2 className="text-xl font-bold mb-4">Production History</h2>
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Peewee</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Small</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Medium</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Large</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Extra Large</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Jumbo</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {productionHistory.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-3 text-center text-sm text-gray-500">
                            No records yet. Add your first egg production record!
                          </td>
                        </tr>
                      ) : (
                        productionHistory.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{format(new Date(record.date), "MMM dd, yyyy")}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-600">{calculateTotalEggs(record.peewee)}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-600">{calculateTotalEggs(record.small)}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-600">{calculateTotalEggs(record.medium)}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-600">{calculateTotalEggs(record.large)}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-600">{calculateTotalEggs(record.extraLarge)}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-600">{calculateTotalEggs(record.jumbo)}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap text-sm font-medium text-gray-900">
                              {calculateTotalEggs(record.peewee) +
                                calculateTotalEggs(record.small) +
                                calculateTotalEggs(record.medium) +
                                calculateTotalEggs(record.large) +
                                calculateTotalEggs(record.extraLarge) +
                                calculateTotalEggs(record.jumbo)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex justify-center space-x-2">
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleEditRecord(record)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Edit Egg Production Record</DialogTitle>
                                      <DialogDescription>
                                        Edit production data for {format(new Date(record.date), "MMMM dd, yyyy")}
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                      {/* Peewee */}
                                      <div className="space-y-2">
                                        <h3 className="font-semibold">Peewee</h3>
                                        <div className="space-y-1">
                                          <Label>Crates</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={eggProduction.peewee.crates}
                                            onChange={(e) => handleEggInputChange("peewee", "crates", e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label>Pieces</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="29"
                                            value={eggProduction.peewee.pieces}
                                            onChange={(e) => handleEggInputChange("peewee", "pieces", e.target.value)}
                                          />
                                        </div>
                                      </div>

                                      {/* Small */}
                                      <div className="space-y-2">
                                        <h3 className="font-semibold">Small</h3>
                                        <div className="space-y-1">
                                          <Label>Crates</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={eggProduction.small.crates}
                                            onChange={(e) => handleEggInputChange("small", "crates", e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label>Pieces</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="29"
                                            value={eggProduction.small.pieces}
                                            onChange={(e) => handleEggInputChange("small", "pieces", e.target.value)}
                                          />
                                        </div>
                                      </div>

                                      {/* Medium */}
                                      <div className="space-y-2">
                                        <h3 className="font-semibold">Medium</h3>
                                        <div className="space-y-1">
                                          <Label>Crates</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={eggProduction.medium.crates}
                                            onChange={(e) => handleEggInputChange("medium", "crates", e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label>Pieces</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="29"
                                            value={eggProduction.medium.pieces}
                                            onChange={(e) => handleEggInputChange("medium", "pieces", e.target.value)}
                                          />
                                        </div>
                                      </div>

                                      {/* Large */}
                                      <div className="space-y-2">
                                        <h3 className="font-semibold">Large</h3>
                                        <div className="space-y-1">
                                          <Label>Crates</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={eggProduction.large.crates}
                                            onChange={(e) => handleEggInputChange("large", "crates", e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label>Pieces</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="29"
                                            value={eggProduction.large.pieces}
                                            onChange={(e) => handleEggInputChange("large", "pieces", e.target.value)}
                                          />
                                        </div>
                                      </div>

                                      {/* Extra Large */}
                                      <div className="space-y-2">
                                        <h3 className="font-semibold">Extra Large</h3>
                                        <div className="space-y-1">
                                          <Label>Crates</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={eggProduction.extraLarge.crates}
                                            onChange={(e) => handleEggInputChange("extraLarge", "crates", e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label>Pieces</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="29"
                                            value={eggProduction.extraLarge.pieces}
                                            onChange={(e) => handleEggInputChange("extraLarge", "pieces", e.target.value)}
                                          />
                                        </div>
                                      </div>

                                      {/* Jumbo */}
                                      <div className="space-y-2">
                                        <h3 className="font-semibold">Jumbo</h3>
                                        <div className="space-y-1">
                                          <Label>Crates</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={eggProduction.jumbo.crates}
                                            onChange={(e) => handleEggInputChange("jumbo", "crates", e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label>Pieces</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="29"
                                            value={eggProduction.jumbo.pieces}
                                            onChange={(e) => handleEggInputChange("jumbo", "pieces", e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <DialogFooter>
                                      <Button variant="outline" onClick={handleCancelEdit}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleUpdateRecord} className="bg-amber-600 hover:bg-amber-700">
                                        Update Record
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteRecord(record.date)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <ConfirmationDialog
      isOpen={isDeleteDialogOpen}
      onClose={() => setIsDeleteDialogOpen(false)}
      onConfirm={handleDeleteConfirm}
      title="Delete Record"
      description="Are you sure you want to delete this record? This action cannot be undone."
    />
    
    <ConfirmationDialog
      isOpen={isEditDialogOpen}
      onClose={() => setIsEditDialogOpen(false)}
      onConfirm={handleEditConfirm}
      title="Update Record"
      description="Are you sure you want to update this record?"
    />
  </div>
);
}