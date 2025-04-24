"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger,} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import * as echarts from "echarts";
import React, { useEffect, useState } from "react";
interface EggProduction {
  date: string;
  peewee: { crates: number; pieces: number };
  small: { crates: number; pieces: number };
  medium: { crates: number; pieces: number };
  large: { crates: number; pieces: number };
  extraLarge: { crates: number; pieces: number };
}
interface FeedEntry {
  date: string;
  feedType: string;
  quantity: number;
  time: string;
  notes: string;
}
interface Medication {
  id: string;
  name: string;
  dosage: string;
  startDate: string;
  endDate: string;
  schedule: string;
  notes: string;
  status: "active" | "completed";
}
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Egg Production State
  const [eggProduction, setEggProduction] = useState<EggProduction>({
    date: format(new Date(), "yyyy-MM-dd"),
    peewee: { crates: 0, pieces: 0 },
    small: { crates: 0, pieces: 0 },
    medium: { crates: 0, pieces: 0 },
    large: { crates: 0, pieces: 0 },
    extraLarge: { crates: 0, pieces: 0 },
  });
  const [eggHistory, setEggHistory] = useState<EggProduction[]>([
    {
      date: format(
        new Date(new Date().setDate(new Date().getDate() - 1)),
        "yyyy-MM-dd",
      ),
      peewee: { crates: 3, pieces: 5 },
      small: { crates: 10, pieces: 8 },
      medium: { crates: 25, pieces: 10 },
      large: { crates: 18, pieces: 4 },
      extraLarge: { crates: 8, pieces: 2 },
    },
    {
      date: format(
        new Date(new Date().setDate(new Date().getDate() - 2)),
        "yyyy-MM-dd",
      ),
      peewee: { crates: 2, pieces: 9 },
      small: { crates: 12, pieces: 6 },
      medium: { crates: 22, pieces: 8 },
      large: { crates: 20, pieces: 3 },
      extraLarge: { crates: 7, pieces: 11 },
    },
  ]);
  // Feed Management State
  const [feedEntry, setFeedEntry] = useState<FeedEntry>({
    date: format(new Date(), "yyyy-MM-dd"),
    feedType: "layer",
    quantity: 0,
    time: format(new Date(), "HH:mm"),
    notes: "",
  });
  const [feedHistory, setFeedHistory] = useState<FeedEntry[]>([
    {
      date: format(
        new Date(new Date().setDate(new Date().getDate() - 1)),
        "yyyy-MM-dd",
      ),
      feedType: "layer",
      quantity: 250,
      time: "08:30",
      notes: "Regular morning feeding",
    },
    {
      date: format(
        new Date(new Date().setDate(new Date().getDate() - 1)),
        "yyyy-MM-dd",
      ),
      feedType: "starter",
      quantity: 100,
      time: "16:00",
      notes: "For new chicks",
    },
  ]);
  // Medication Management State
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Vitamin Supplement",
      dosage: "10ml per 100 birds",
      startDate: format(
        new Date(new Date().setDate(new Date().getDate() - 5)),
        "yyyy-MM-dd",
      ),
      endDate: format(
        new Date(new Date().setDate(new Date().getDate() + 5)),
        "yyyy-MM-dd",
      ),
      schedule: "Daily",
      notes: "Mix with water",
      status: "active",
    },
    {
      id: "2",
      name: "Antibiotic Treatment",
      dosage: "5ml per 50 birds",
      startDate: format(
        new Date(new Date().setDate(new Date().getDate() - 10)),
        "yyyy-MM-dd",
      ),
      endDate: format(
        new Date(new Date().setDate(new Date().getDate() - 3)),
        "yyyy-MM-dd",
      ),
      schedule: "Twice daily",
      notes: "For respiratory issues",
      status: "completed",
    },
  ]);
  const [newMedication, setNewMedication] = useState<
    Omit<Medication, "id" | "status">
  >({
    name: "",
    dosage: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(
      new Date(new Date().setDate(new Date().getDate() + 7)),
      "yyyy-MM-dd",
    ),
    schedule: "Daily",
    notes: "",
  });
  // Dashboard data
  const totalEggsToday = Object.values(eggProduction).reduce(
    (acc, category) => {
      if (typeof category === "object" && category !== null) {
        return acc + (category.crates * 30 + category.pieces);
      }
      return acc;
    },
    0,
  );
  const totalFeedToday = feedHistory
    .filter((entry) => entry.date === format(new Date(), "yyyy-MM-dd"))
    .reduce((acc, entry) => acc + entry.quantity, 0);
  const activeMedicationCount = medications.filter(
    (med) => med.status === "active",
  ).length;
  // Chart initialization
  useEffect(() => {
    const chartDom = document.getElementById("productionChart");
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        return format(date, "MMM dd");
      });
      const eggData = Array.from(
        { length: 7 },
        () => Math.floor(Math.random() * 500) + 300,
      );
      const feedData = Array.from(
        { length: 7 },
        () => Math.floor(Math.random() * 300) + 100,
      );
      const option = {
        animation: false,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {
          data: ["Egg Production", "Feed Consumption"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: dates,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "Egg Production",
            type: "bar",
            data: eggData,
            color: "#10b981",
          },
          {
            name: "Feed Consumption",
            type: "line",
            data: feedData,
            color: "#f59e0b",
          },
        ],
      };
      myChart.setOption(option);
      return () => {
        myChart.dispose();
      };
    }
  }, []);
  // Handlers
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
  const handleSaveEggProduction = () => {
    const newEntry = {
      ...eggProduction,
      date: format(selectedDate, "yyyy-MM-dd"),
    };
    setEggHistory((prev) => [newEntry, ...prev]);
    // Reset form
    setEggProduction({
      date: format(selectedDate, "yyyy-MM-dd"),
      peewee: { crates: 0, pieces: 0 },
      small: { crates: 0, pieces: 0 },
      medium: { crates: 0, pieces: 0 },
      large: { crates: 0, pieces: 0 },
      extraLarge: { crates: 0, pieces: 0 },
    });
  };
  const handleResetEggForm = () => {
    setEggProduction({
      date: format(selectedDate, "yyyy-MM-dd"),
      peewee: { crates: 0, pieces: 0 },
      small: { crates: 0, pieces: 0 },
      medium: { crates: 0, pieces: 0 },
      large: { crates: 0, pieces: 0 },
      extraLarge: { crates: 0, pieces: 0 },
    });
  };
  const handleFeedInputChange = (
    field: keyof FeedEntry,
    value: string | number,
  ) => {
    setFeedEntry((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSaveFeedEntry = () => {
    const newEntry = { ...feedEntry, date: format(selectedDate, "yyyy-MM-dd") };
    setFeedHistory((prev) => [newEntry, ...prev]);
    // Reset form
    setFeedEntry({
      date: format(selectedDate, "yyyy-MM-dd"),
      feedType: "layer",
      quantity: 0,
      time: format(new Date(), "HH:mm"),
      notes: "",
    });
  };
  const handleMedicationInputChange = (
    field: keyof Omit<Medication, "id" | "status">,
    value: string,
  ) => {
    setNewMedication((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleAddMedication = () => {
    const newMed: Medication = {
      ...newMedication,
      id: Date.now().toString(),
      status: "active",
    };
    setMedications((prev) => [newMed, ...prev]);
    // Reset form
    setNewMedication({
      name: "",
      dosage: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(
        new Date(new Date().setDate(new Date().getDate() + 7)),
        "yyyy-MM-dd",
      ),
      schedule: "Daily",
      notes: "",
    });
  };
  const calculateTotalEggs = (category: { crates: number; pieces: number }) => {
    return category.crates * 30 + category.pieces;
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
  const calculateGrandTotal = () => {
    return Object.values(eggProduction).reduce((acc, category) => {
      if (typeof category === "object" && category !== null) {
        return acc + calculateTotalEggs(category);
      }
      return acc;
    }, 0);
  };
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md z-10 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
              <i className="fas fa-feather-alt"></i>
            </div>
            <div>
              <h2 className="font-bold text-lg">Poultry Farm</h2>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className={`w-full justify-start !rounded-button ${activeTab === "dashboard" ? "" : "text-gray-600"}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <i className="fas fa-chart-line mr-2"></i>
                Dashboard
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "egg-production" ? "default" : "ghost"}
                className={`w-full justify-start !rounded-button ${activeTab === "egg-production" ? "" : "text-gray-600"}`}
                onClick={() => setActiveTab("egg-production")}
              >
                <i className="fas fa-egg mr-2"></i>
                Egg Production
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "feed-management" ? "default" : "ghost"}
                className={`w-full justify-start !rounded-button ${activeTab === "feed-management" ? "" : "text-gray-600"}`}
                onClick={() => setActiveTab("feed-management")}
              >
                <i className="fas fa-wheat mr-2"></i>
                Feed Management
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "medication" ? "default" : "ghost"}
                className={`w-full justify-start !rounded-button ${activeTab === "medication" ? "" : "text-gray-600"}`}
                onClick={() => setActiveTab("medication")}
              >
                <i className="fas fa-pills mr-2"></i>
                Medication
              </Button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t mt-auto">
          <a
            href="#"
            data-readdy="true"
          >
            <Button
              variant="ghost"
              className="w-full justify-start !rounded-button text-gray-600"
            >
              <i className="fas fa-cog mr-2"></i>
              Settings
            </Button>
          </a>
          <div className="flex items-center mt-4 pt-4 border-t">
            <Avatar className="cursor-pointer">
              <AvatarImage src="#" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Farm Manager</p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "egg-production" && "Egg Production"}
              {activeTab === "feed-management" && "Feed Management"}
              {activeTab === "medication" && "Medication Management"}
            </h1>
            <p className="text-sm text-gray-500">
              {format(currentDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="!rounded-button whitespace-nowrap"
                >
                  <i className="fas fa-download mr-2"></i>
                  Export Data
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start !rounded-button whitespace-nowrap"
                    onClick={() => {
                      const activeTabData =
                        document.getElementById(activeTab)?.textContent || "";
                      const blob = new Blob([activeTabData], {
                        type: "text/csv",
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${activeTab}-data.csv`;
                      a.click();
                    }}
                  >
                    <i className="fas fa-file-csv mr-2"></i>
                    CSV
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start !rounded-button whitespace-nowrap"
                    onClick={async () => {
                      try {
                        // Show loading state
                        const button = document.querySelector( "[data-excel-export]",);
                        if (button) {
                          button.setAttribute("disabled", "true");
                          button.innerHTML =
                            '<i class="fas fa-spinner fa-spin mr-2"></i>Exporting...';
                        }

                        // Simulate export process
                        await new Promise((resolve) =>
                          setTimeout(resolve, 1500),
                        );

                        // Get data from active tab
                        const activeTabData =
                          document.getElementById(activeTab)?.textContent || "";
                        const blob = new Blob([activeTabData], {
                          type: "application/vnd.ms-excel",
                        });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        const filename = `${activeTab}-data-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
                        a.download = filename;
                        a.click();

                        // Show success toast
                        const toast = document.createElement("div");
                        toast.className =
                          "fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center";
                        toast.innerHTML = `
<i class="fas fa-check-circle mr-2"></i>
<span>Data successfully exported to ${filename}</span>
`;
                        document.body.appendChild(toast);

                        // Remove toast after 3 seconds
                        setTimeout(() => {
                          toast.remove();
                        }, 3000);

                        // Reset button state
                        if (button) {
                          button.removeAttribute("disabled");
                          button.innerHTML =
                            '<i class="fas fa-file-excel mr-2"></i>Excel';
                        }
                       // try{

                        } catch (_) {
                        const toast = document.createElement("div");
                        toast.className =
                          "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center";
                        toast.innerHTML = `
<i class="fas fa-exclamation-circle mr-2"></i>
<span>Failed to export data. Please try again.</span>
`;
                        document.body.appendChild(toast);

                        // Remove error toast after 3 secon
                        setTimeout(() => {
                          toast.remove();
                        }, 3000);

                        // Reset button state
                        const button = document.querySelector(  "[data-excel-export]", );
                        if (button) {
                          button.removeAttribute("disabled");
                          button.innerHTML =
                            '<i class="fas fa-file-excel mr-2"></i>Excel';
                        }
                      }
                    }}
                    data-excel-export
                  >
                    <i className="fas fa-file-excel mr-2"></i>
                    Excel
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start !rounded-button whitespace-nowrap"
                    onClick={() => {
                      const activeTabData =
                        document.getElementById(activeTab)?.textContent || "";
                      const blob = new Blob([activeTabData], {
                        type: "application/pdf",
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${activeTab}-data.pdf`;
                      a.click();
                    }}
                  >
                    <i className="fas fa-file-pdf mr-2"></i>
                    PDF
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start !rounded-button whitespace-nowrap"
                    onClick={() => {
                      window.print();
                    }}
                  >
                    <i className="fas fa-print mr-2"></i>
                    Print
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="!rounded-button whitespace-nowrap">
                  <i className="fas fa-plus mr-2"></i>
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Entry</DialogTitle>
                  <DialogDescription>
                    Choose the type of entry you want to create.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start !rounded-button whitespace-nowrap p-4 h-auto"
                    onClick={() => {
                      setActiveTab("egg-production");
                      const dialog = document.querySelector('[role="dialog"]');
                      if (dialog) {
                        const closeButton = dialog.querySelector('[data-state="open"]') as HTMLElement;
                        if (closeButton) closeButton.click();
                      }
                    }}
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                        <i className="fas fa-egg text-lg"></i>
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium mb-1">Egg Production</h3>
                        <p className="text-sm text-gray-500">
                          Record daily egg collection data by size category
                        </p>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start !rounded-button whitespace-nowrap p-4 h-auto"
                    onClick={() => {
                      setActiveTab("feed-management");
                      const dialog = document.querySelector('[role="dialog"]');
                      if (dialog) {
                        const closeButton = dialog.querySelector('[data-state="open"]') as HTMLElement;
                        if (closeButton) closeButton.click();
                      }
                    }}
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                        <i className="fas fa-wheat text-lg"></i>
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium mb-1">Feed Management</h3>
                        <p className="text-sm text-gray-500">
                          Track feed distribution and inventory levels
                        </p>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start !rounded-button whitespace-nowrap p-4 h-auto"
                    onClick={() => {
                      setActiveTab("medication");
                      const dialog = document.querySelector('[role="dialog"]');
                      if (dialog) {
                        const closeButton = dialog.querySelector('[data-state="open"]') as HTMLElement;
                        if (closeButton) closeButton.click();
                      }
                    }}
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                        <i className="fas fa-pills text-lg"></i>
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium mb-1">Medication</h3>
                        <p className="text-sm text-gray-500">
                          Add new treatment schedules and monitor active
                          medications
                        </p>
                      </div>
                    </div>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Egg Production
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{totalEggsToday}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      eggs today
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={75} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <span className="text-xs text-emerald-600">
                    <i className="fas fa-arrow-up mr-1"></i>
                    12% from yesterday
                  </span>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Feed Consumption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{totalFeedToday}</span>
                    <span className="ml-2 text-sm text-gray-500">kg today</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={60} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <span className="text-xs text-red-600">
                    <i className="fas fa-arrow-down mr-1"></i>
                    5% from yesterday
                  </span>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Active Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">
                      {activeMedicationCount}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      treatments
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={30} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <span className="text-xs text-gray-600">
                    <i className="fas fa-calendar-alt mr-1"></i>
                    Next completion in 5 days
                  </span>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Birds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">2,450</span>
                    <span className="ml-2 text-sm text-gray-500">birds</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={90} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <span className="text-xs text-emerald-600">
                    <i className="fas fa-check-circle mr-1"></i>
                    Healthy population
                  </span>
                </CardFooter>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Production Trends</CardTitle>
                  <CardDescription>
                    Daily egg production and feed consumption
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div id="productionChart" className="w-full h-80"></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest farm operations</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-80 px-6">
                    <div className="space-y-4 py-4">
                      <div className="flex items-start">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 mt-1">
                          <i className="fas fa-egg"></i>
                        </div>
                        <div>
                          <p className="font-medium">
                            Egg Collection Completed
                          </p>
                          <p className="text-sm text-gray-500">
                            425 eggs collected from Coop A
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Today, 8:30 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3 mt-1">
                          <i className="fas fa-wheat"></i>
                        </div>
                        <div>
                          <p className="font-medium">Feed Distributed</p>
                          <p className="text-sm text-gray-500">
                            250kg of layer feed distributed
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Today, 7:15 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 mt-1">
                          <i className="fas fa-pills"></i>
                        </div>
                        <div>
                          <p className="font-medium">Medication Administered</p>
                          <p className="text-sm text-gray-500">
                            Vitamin supplement added to water
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Today, 6:45 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 mt-1">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div>
                          <p className="font-medium">Health Check Completed</p>
                          <p className="text-sm text-gray-500">
                            All birds in good condition
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Yesterday, 5:30 PM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3 mt-1">
                          <i className="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                          <p className="font-medium">Temperature Alert</p>
                          <p className="text-sm text-gray-500">
                            Coop B temperature above threshold
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Yesterday, 2:15 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Status</CardTitle>
                  <CardDescription>Current stock levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Layer Feed</span>
                        <span className="text-sm text-gray-500">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          Starter Feed
                        </span>
                        <span className="text-sm text-gray-500">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Vitamins</span>
                        <span className="text-sm text-gray-500">90%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Egg Cartons</span>
                        <span className="text-sm text-gray-500">30%</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="!rounded-button whitespace-nowrap"
                  >
                    <i className="fas fa-clipboard-list mr-2"></i>
                    View Full Inventory
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Scheduled farm activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          <i className="fas fa-calendar-check"></i>
                        </div>
                        <div>
                          <p className="font-medium">Coop Cleaning</p>
                          <p className="text-xs text-gray-500">
                            Tomorrow, 9:00 AM
                          </p>
                        </div>
                      </div>
                      <Badge>High</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                          <i className="fas fa-syringe"></i>
                        </div>
                        <div>
                          <p className="font-medium">Vaccination</p>
                          <p className="text-xs text-gray-500">
                            Apr 12, 8:00 AM
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Medium</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                          <i className="fas fa-truck"></i>
                        </div>
                        <div>
                          <p className="font-medium">Feed Delivery</p>
                          <p className="text-xs text-gray-500">
                            Apr 15, 10:30 AM
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Medium</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          <i className="fas fa-clipboard-check"></i>
                        </div>
                        <div>
                          <p className="font-medium">Monthly Inspection</p>
                          <p className="text-xs text-gray-500">
                            Apr 30, 1:00 PM
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Low</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="!rounded-button whitespace-nowrap">
                        <i className="fas fa-plus mr-2"></i>
                        Add New Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                        <DialogDescription>
                          Create a new task for the farm management system.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="task-name">Task Name</Label>
                          <Input id="task-name" placeholder="Enter task name" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="task-description">Description</Label>
                          <Textarea
                            id="task-description"
                            placeholder="Enter task description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="task-date">Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal !rounded-button whitespace-nowrap"
                                >
                                  <i className="fas fa-calendar-alt mr-2"></i>
                                  {format(new Date(), "MMM d, yyyy")}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar mode="single" initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="task-time">Time</Label>
                            <Input id="task-time" type="time" />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="task-priority">Priority Level</Label>
                          <Select>
                            <SelectTrigger id="task-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="task-assignee">Assignee</Label>
                          <Select>
                            <SelectTrigger id="task-assignee">
                              <SelectValue placeholder="Select assignee" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="john">John Doe</SelectItem>
                              <SelectItem value="jane">Jane Smith</SelectItem>
                              <SelectItem value="bob">Bob Johnson</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="task-notes">Notes</Label>
                          <Textarea
                            id="task-notes"
                            placeholder="Enter additional notes"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          className="!rounded-button whitespace-nowrap"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="!rounded-button whitespace-nowrap"
                        >
                          Save Task
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
        {/* Egg Production */}
        {activeTab === "egg-production" && (
          <div className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Record Egg Production</CardTitle>
                <CardDescription>
                  Daily egg production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label>Collection Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal !rounded-button whitespace-nowrap"
                      >
                        <i className="fas fa-calendar-alt mr-2"></i>
                        {format(selectedDate, "MMMM d, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Peewee */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Peewee</CardTitle>
                      <CardDescription>Very small eggs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="peewee-crates">
                            Number of Crates
                          </Label>
                          <Input
                            id="peewee-crates"
                            type="number"
                            min="0"
                            value={eggProduction.peewee.crates}
                            onChange={(e) =>
                              handleEggInputChange(
                                "peewee",
                                "crates",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="peewee-pieces">
                            Number of Pieces
                          </Label>
                          <Input
                            id="peewee-pieces"
                            type="number"
                            min="0"
                            max="29"
                            value={eggProduction.peewee.pieces}
                            onChange={(e) =>
                              handleEggInputChange(
                                "peewee",
                                "pieces",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full text-right">
                        <p className="text-sm text-gray-500">
                          Total:{" "}
                          <span className="font-bold">
                            {calculateTotalEggs(eggProduction.peewee)}
                          </span>{" "}
                          eggs
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                  {/* Small */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Small</CardTitle>
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
                            onChange={(e) =>
                              handleEggInputChange(
                                "small",
                                "crates",
                                e.target.value,
                              )
                            }
                            className="mt-1"
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
                            onChange={(e) =>
                              handleEggInputChange(
                                "small",
                                "pieces",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full text-right">
                        <p className="text-sm text-gray-500">
                          Total:{" "}
                          <span className="font-bold">
                            {calculateTotalEggs(eggProduction.small)}
                          </span>{" "}
                          eggs
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                  {/* Medium */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Medium</CardTitle>
                      <CardDescription>Medium sized eggs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="medium-crates">
                            Number of Crates
                          </Label>
                          <Input
                            id="medium-crates"
                            type="number"
                            min="0"
                            value={eggProduction.medium.crates}
                            onChange={(e) =>
                              handleEggInputChange(
                                "medium",
                                "crates",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="medium-pieces">
                            Number of Pieces
                          </Label>
                          <Input
                            id="medium-pieces"
                            type="number"
                            min="0"
                            max="29"
                            value={eggProduction.medium.pieces}
                            onChange={(e) =>
                              handleEggInputChange(
                                "medium",
                                "pieces",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full text-right">
                        <p className="text-sm text-gray-500">
                          Total:{" "}
                          <span className="font-bold">
                            {calculateTotalEggs(eggProduction.medium)}
                          </span>{" "}
                          eggs
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                  {/* Large */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Large</CardTitle>
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
                            onChange={(e) =>
                              handleEggInputChange(
                                "large",
                                "crates",
                                e.target.value,
                              )
                            }
                            className="mt-1"
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
                            onChange={(e) =>
                              handleEggInputChange(
                                "large",
                                "pieces",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full text-right">
                        <p className="text-sm text-gray-500">
                          Total:{" "}
                          <span className="font-bold">
                            {calculateTotalEggs(eggProduction.large)}
                          </span>{" "}
                          eggs
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                  {/* Extra Large */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Extra Large</CardTitle>
                      <CardDescription>Very large eggs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="extraLarge-crates">
                            Number of Crates
                          </Label>
                          <Input
                            id="extraLarge-crates"
                            type="number"
                            min="0"
                            value={eggProduction.extraLarge.crates}
                            onChange={(e) =>
                              handleEggInputChange(
                                "extraLarge",
                                "crates",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="extraLarge-pieces">
                            Number of Pieces
                          </Label>
                          <Input
                            id="extraLarge-pieces"
                            type="number"
                            min="0"
                            max="29"
                            value={eggProduction.extraLarge.pieces}
                            onChange={(e) =>
                              handleEggInputChange(
                                "extraLarge",
                                "pieces",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full text-right">
                        <p className="text-sm text-gray-500">
                          Total:{" "}
                          <span className="font-bold">
                            {calculateTotalEggs(eggProduction.extraLarge)}
                          </span>{" "}
                          eggs
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                  {/* Summary Card */}
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Summary</CardTitle>
                      <CardDescription>Total egg production</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Crates:</span>
                          <span className="font-bold">
                            {calculateTotalCrates()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Pieces:</span>
                          <span className="font-bold">
                            {calculateTotalPieces()}
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-700">Grand Total:</span>
                          <span className="font-bold text-emerald-600">
                            {calculateGrandTotal()} eggs
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={handleResetEggForm}
                        className="!rounded-button whitespace-nowrap"
                      >
                        <i className="fas fa-redo mr-2"></i>
                        Reset
                      </Button>
                      <Button
                        onClick={handleSaveEggProduction}
                        className="!rounded-button whitespace-nowrap"
                      >
                        <i className="fas fa-save mr-2"></i>
                        Save Record
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Production History</CardTitle>
                <CardDescription>
                  Previous egg collection records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Peewee</TableHead>
                      <TableHead>Small</TableHead>
                      <TableHead>Medium</TableHead>
                      <TableHead>Large</TableHead>
                      <TableHead>Extra Large</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eggHistory.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {record.date}
                        </TableCell>
                        <TableCell>
                          {calculateTotalEggs(record.peewee)}
                        </TableCell>
                        <TableCell>
                          {calculateTotalEggs(record.small)}
                        </TableCell>
                        <TableCell>
                          {calculateTotalEggs(record.medium)}
                        </TableCell>
                        <TableCell>
                          {calculateTotalEggs(record.large)}
                        </TableCell>
                        <TableCell>
                          {calculateTotalEggs(record.extraLarge)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {Object.keys(record)
                            .filter((key) => key !== "date")
                            .reduce(
                              (acc, key) =>
                                acc +
                                calculateTotalEggs(
                                  record[
                                    key as keyof Omit<EggProduction, "date">
                                  ],
                                ),
                              0,
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Showing {eggHistory.length} of {eggHistory.length} entries
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled
                    className="!rounded-button whitespace-nowrap"
                  >
                    <i className="fas fa-chevron-left mr-2"></i>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    className="!rounded-button whitespace-nowrap"
                  >
                    Next
                    <i className="fas fa-chevron-right ml-2"></i>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
        {/* Feed Management */}
        {activeTab === "feed-management" && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Record Feed Usage</CardTitle>
                  <CardDescription>
                    Enter feed distribution data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="feed-date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal !rounded-button whitespace-nowrap"
                          >
                            <i className="fas fa-calendar-alt mr-2"></i>
                            {format(selectedDate, "MMMM d, yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="feed-type">Feed Type</Label>
                      <Select
                        value={feedEntry.feedType}
                        onValueChange={(value) =>
                          handleFeedInputChange("feedType", value)
                        }
                      >
                        <SelectTrigger id="feed-type" className="w-full">
                          <SelectValue placeholder="Select feed type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="layer">Layer Feed</SelectItem>
                          <SelectItem value="starter">Starter Feed</SelectItem>
                          <SelectItem value="grower">Grower Feed</SelectItem>
                          <SelectItem value="finisher">
                            Finisher Feed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="feed-quantity">Quantity (kg)</Label>
                      <Input
                        id="feed-quantity"
                        type="number"
                        min="0"
                        value={feedEntry.quantity}
                        onChange={(e) =>
                          handleFeedInputChange(
                            "quantity",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feed-time">Time</Label>
                      <Input
                        id="feed-time"
                        type="time"
                        value={feedEntry.time}
                        onChange={(e) =>
                          handleFeedInputChange("time", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feed-notes">Notes</Label>
                      <Textarea
                        id="feed-notes"
                        placeholder="Enter any additional information"
                        value={feedEntry.notes}
                        onChange={(e) =>
                          handleFeedInputChange("notes", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleSaveFeedEntry}
                    className="!rounded-button whitespace-nowrap"
                  >
                    <i className="fas fa-save mr-2"></i>
                    Save Record
                  </Button>
                </CardFooter>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Feed Inventory</CardTitle>
                  <CardDescription>Current feed stock levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-medium">Layer Feed</h3>
                          <p className="text-sm text-gray-500">
                            High protein feed for laying hens
                          </p>
                        </div>
                        <Badge className="bg-emerald-500">In Stock</Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Current: 750kg</span>
                        <span>Capacity: 1000kg</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-medium">Starter Feed</h3>
                          <p className="text-sm text-gray-500">
                            For chicks 0-8 weeks
                          </p>
                        </div>
                        <Badge className="bg-amber-500">Low Stock</Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Current: 120kg</span>
                        <span>Capacity: 500kg</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-medium">Grower Feed</h3>
                          <p className="text-sm text-gray-500">
                            For pullets 8-18 weeks
                          </p>
                        </div>
                        <Badge className="bg-emerald-500">In Stock</Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Current: 350kg</span>
                        <span>Capacity: 500kg</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-medium">Finisher Feed</h3>
                          <p className="text-sm text-gray-500">
                            For meat birds
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-red-500 border-red-200"
                        >
                          Out of Stock
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Current: 0kg</span>
                        <span>Capacity: 500kg</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="outline"
                      className="!rounded-button whitespace-nowrap"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Order Feed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Feed Distribution History</CardTitle>
                <CardDescription>Recent feed usage records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Feed Type</TableHead>
                      <TableHead>Quantity (kg)</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedHistory.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {record.date}
                        </TableCell>
                        <TableCell>{record.time}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {record.feedType}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.quantity} kg</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.notes}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 !rounded-button"
                          >
                            <i className="fas fa-edit text-gray-500"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 !rounded-button"
                          >
                            <i className="fas fa-trash text-gray-500"></i>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Showing {feedHistory.length} of {feedHistory.length} entries
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled
                    className="!rounded-button whitespace-nowrap"
                  >
                    <i className="fas fa-chevron-left mr-2"></i>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    className="!rounded-button whitespace-nowrap"
                  >
                    Next
                    <i className="fas fa-chevron-right ml-2"></i>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
        {/* Medication Management */}
        {activeTab === "medication" && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Add New Medication</CardTitle>
                  <CardDescription>
                    Record new treatment details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="med-name">Medication Name</Label>
                      <Input
                        id="med-name"
                        value={newMedication.name}
                        onChange={(e) =>
                          handleMedicationInputChange("name", e.target.value)
                        }
                        placeholder="Enter medication name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="med-dosage">Dosage</Label>
                      <Input
                        id="med-dosage"
                        value={newMedication.dosage}
                        onChange={(e) =>
                          handleMedicationInputChange("dosage", e.target.value)
                        }
                        placeholder="e.g. 10ml per 100 birds"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="med-start">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal !rounded-button whitespace-nowrap"
                            >
                              <i className="fas fa-calendar-alt mr-2"></i>
                              {format(
                                new Date(newMedication.startDate),
                                "MMM d, yyyy",
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={new Date(newMedication.startDate)}
                              onSelect={(date) =>
                                date &&
                                handleMedicationInputChange(
                                  "startDate",
                                  format(date, "yyyy-MM-dd"),
                                )
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="med-end">End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal !rounded-button whitespace-nowrap"
                            >
                              <i className="fas fa-calendar-alt mr-2"></i>
                              {format(
                                new Date(newMedication.endDate),
                                "MMM d, yyyy",
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={new Date(newMedication.endDate)}
                              onSelect={(date) =>
                                date &&
                                handleMedicationInputChange(
                                  "endDate",
                                  format(date, "yyyy-MM-dd"),
                                )
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="med-schedule">Schedule</Label>
                      <Select
                        value={newMedication.schedule}
                        onValueChange={(value) =>
                          handleMedicationInputChange("schedule", value)
                        }
                      >
                        <SelectTrigger id="med-schedule" className="w-full">
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Twice daily">
                            Twice daily
                          </SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="As needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="med-notes">Notes</Label>
                      <Textarea
                        id="med-notes"
                        value={newMedication.notes}
                        onChange={(e) =>
                          handleMedicationInputChange("notes", e.target.value)
                        }
                        placeholder="Enter administration instructions or other notes"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleAddMedication}
                    className="!rounded-button whitespace-nowrap"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Medication
                  </Button>
                </CardFooter>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Active Treatments</CardTitle>
                  <CardDescription>
                    Currently ongoing medication schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {medications.filter((med) => med.status === "active")
                    .length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
                        <i className="fas fa-pills text-xl"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No Active Treatments
                      </h3>
                      <p className="text-gray-500">
                        All birds are currently medication-free
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medications
                        .filter((med) => med.status === "active")
                        .map((medication, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg">
                                  {medication.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Dosage: {medication.dosage}
                                </p>
                              </div>
                              <Badge>Active</Badge>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Start Date</p>
                                <p className="font-medium">
                                  {format(
                                    new Date(medication.startDate),
                                    "MMM d, yyyy",
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">End Date</p>
                                <p className="font-medium">
                                  {format(
                                    new Date(medication.endDate),
                                    "MMM d, yyyy",
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Schedule</p>
                                <p className="font-medium">
                                  {medication.schedule}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Duration</p>
                                <p className="font-medium">
                                  {Math.ceil(
                                    (new Date(medication.endDate).getTime() -
                                      new Date(
                                        medication.startDate,
                                      ).getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  )}{" "}
                                  days
                                </p>
                              </div>
                            </div>
                            {medication.notes && (
                              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                                <p className="text-gray-500 mb-1">Notes:</p>
                                <p>{medication.notes}</p>
                              </div>
                            )}
                            <div className="mt-4 flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="!rounded-button whitespace-nowrap"
                              >
                                <i className="fas fa-edit mr-2"></i>
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="!rounded-button whitespace-nowrap"
                              >
                                <i className="fas fa-check-circle mr-2"></i>
                                Mark Complete
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Medication History</CardTitle>
                <CardDescription>
                  Past treatments and medications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((medication, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {medication.name}
                        </TableCell>
                        <TableCell>{medication.dosage}</TableCell>
                        <TableCell>
                          {format(
                            new Date(medication.startDate),
                            "MMM d, yyyy",
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(medication.endDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{medication.schedule}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              medication.status === "active"
                                ? "default"
                                : "outline"
                            }
                            className={
                              medication.status === "active"
                                ? ""
                                : "text-gray-500"
                            }
                          >
                            {medication.status === "active"
                              ? "Active"
                              : "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 !rounded-button"
                          >
                            <i className="fas fa-edit text-gray-500"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 !rounded-button"
                          >
                            <i className="fas fa-trash text-gray-500"></i>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Showing {medications.length} of {medications.length} entries
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled
                    className="!rounded-button whitespace-nowrap"
                  >
                    <i className="fas fa-chevron-left mr-2"></i>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    className="!rounded-button whitespace-nowrap"
                  >
                    Next
                    <i className="fas fa-chevron-right ml-2"></i>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;