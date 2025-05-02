"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";

interface EggProduction {
  date: string;
  peewee: { crates: number; pieces: number };
  small: { crates: number; pieces: number };
  medium: { crates: number; pieces: number };
  large: { crates: number; pieces: number };
  extraLarge: { crates: number; pieces: number };
}

export default function EggProductionPage() {
  const [eggProduction, setEggProduction] = useState<EggProduction>({
    date: format(new Date(), "yyyy-MM-dd"),
    peewee: { crates: 0, pieces: 0 },
    small: { crates: 0, pieces: 0 },
    medium: { crates: 0, pieces: 0 },
    large: { crates: 0, pieces: 0 },
    extraLarge: { crates: 0, pieces: 0 },
  });

  const [productionHistory, setProductionHistory] = useState<EggProduction[]>([]);

  const calculateTotalEggs = (category: { crates: number; pieces: number }) => {
    return category.crates * 30 + category.pieces;
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

  const handleSaveRecord = () => {
    setProductionHistory((prev) => [eggProduction, ...prev]);
    // Reset form after saving
    setEggProduction({
      date: format(new Date(), "yyyy-MM-dd"),
      peewee: { crates: 0, pieces: 0 },
      small: { crates: 0, pieces: 0 },
      medium: { crates: 0, pieces: 0 },
      large: { crates: 0, pieces: 0 },
      extraLarge: { crates: 0, pieces: 0 },
    });
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="egg-production" />

      <div className="flex-1 overflow-auto">
        <Header activeTab="egg-production" />
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold">Egg Production</h1>
                <p className="text-gray-500">Management System</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleExportData}>
                  <i className="fas fa-download mr-2"></i>
                  Export Data
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <i className="fas fa-plus mr-2"></i>
                      New Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Egg Production</DialogTitle>
                      <DialogDescription>
                        Enter the daily egg production details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {/* Form fields go here - reuse your existing form components */}
                      <Button variant="outline" onClick={() => window.location.reload()}>Reset</Button>
                      <Button onClick={handleSaveRecord}>Save Record</Button>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        Reset
                      </Button>
                      <Button onClick={handleSaveRecord}>Save Record</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="peewee">Peewee</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extralarge">Extra Large</SelectItem>
                </SelectContent>
              </Select>
              <DatePicker
                selectedDate={new Date()}
                onDateChange={(date) => console.log(date)}
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Peewee Card */}
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

            {/* Summary Card */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Total egg production</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Crates:</span>
                    <span className="font-bold">{calculateTotalCrates()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pieces:</span>
                    <span className="font-bold">{calculateTotalPieces()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => window.location.reload()}>Reset</Button>
                <Button>Save Record</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Production History Table */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Production History</h2>
            <div className="bg-white rounded-lg shadow">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-right">Peewee</th>
                    <th className="p-4 text-right">Small</th>
                    <th className="p-4 text-right">Medium</th>
                    <th className="p-4 text-right">Large</th>
                    <th className="p-4 text-right">Extra Large</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productionHistory.map((record, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">{format(new Date(record.date), "MMM dd, yyyy")}</td>
                      <td className="p-4 text-right">{calculateTotalEggs(record.peewee)}</td>
                      <td className="p-4 text-right">{calculateTotalEggs(record.small)}</td>
                      <td className="p-4 text-right">{calculateTotalEggs(record.medium)}</td>
                      <td className="p-4 text-right">{calculateTotalEggs(record.large)}</td>
                      <td className="p-4 text-right">{calculateTotalEggs(record.extraLarge)}</td>
                      <td className="p-4 text-right font-bold">
                        {calculateTotalEggs(record.peewee) +
                          calculateTotalEggs(record.small) +
                          calculateTotalEggs(record.medium) +
                          calculateTotalEggs(record.large) +
                          calculateTotalEggs(record.extraLarge)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}