"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useState } from "react";

interface HeaderProps {
  activeTab: string;
}

export function Header({ activeTab }: HeaderProps) {
  const getHeaderTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Dashboard";
      case "egg-production":
        return "Egg Production";
      case "feed-management":
        return "Feed Management";
      case "medications":
        return "Medications";
      default:
        return "Dashboard";
    }
  };

  const handleCSVExport = () => {
    const activeTabData = document.getElementById(activeTab)?.textContent || "";
    const blob = new Blob([activeTabData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-data.csv`;
    a.click();
  };

  const handlePDFExport = () => {
    const activeTabData = document.getElementById(activeTab)?.textContent || "";
    const blob = new Blob([activeTabData], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-data.pdf`;
    a.click();
  };

  const handleExcelExport = async () => {
    try {
      // Show loading state
      const button = document.querySelector("[data-excel-export]");
      if (button) {
        button.setAttribute("disabled", "true");
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Exporting...';
      }

      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get data from active tab
      const activeTabData = document.getElementById(activeTab)?.textContent || "";
      const blob = new Blob([activeTabData], { type: "application/vnd.ms-excel" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `${activeTab}-data-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      a.download = filename;
      a.click();

      // Show success toast
      showToast("success", `Data successfully exported to ${filename}`);

      // Reset button state
      if (button) {
        button.removeAttribute("disabled");
        button.innerHTML = '<i class="fas fa-file-excel mr-2"></i>Excel';
      }
    } catch (error) {
      showToast("error", "Failed to export data. Please try again.");

      // Reset button state
      const button = document.querySelector("[data-excel-export]");
      if (button) {
        button.removeAttribute("disabled");
        button.innerHTML = '<i class="fas fa-file-excel mr-2"></i>Excel';
      }
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-4 right-4 ${
      type === "success" ? "bg-emerald-500" : "bg-red-500"
    } text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`;
    toast.innerHTML = `
      <i class="fas fa-${type === "success" ? "check" : "exclamation"}-circle mr-2"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <h1 className="text-2xl font-semibold">{getHeaderTitle(activeTab)}</h1>

      <div className="flex items-center space-x-4">
        {/* Data Entry Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-black/90">
              <i className="fas fa-plus mr-2"></i>
              + New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-4">
            <DialogHeader className="space-y-2 mb-6">
              <DialogTitle className="text-xl">Create New Entry</DialogTitle>
              <DialogDescription className="text-gray-500">
                Choose the type of entry you want to create.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="border rounded-lg p-2 hover:bg-gray-50 transition-colors">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 rounded-lg group"
                  onClick={() => window.location.href = "/EggProduction"}
                >
                  <div className="flex items-center w-full">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3 group-hover:bg-emerald-200">
                      <i className="fas fa-egg"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Egg Production</div>
                      <div className="text-sm text-gray-500">Record daily eggs collection data by size category</div>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="border rounded-lg p-2 hover:bg-gray-50 transition-colors">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 rounded-lg group"
                  onClick={() => window.location.href = "/FeedManagement"}
                >
                  <div className="flex items-center w-full">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3 group-hover:bg-amber-200">
                      <i className="fas fa-wheat"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Feed Management</div>
                      <div className="text-sm text-gray-500">Track feed distribution and inventory levels</div>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="border rounded-lg p-2 hover:bg-gray-50 transition-colors">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 rounded-lg group"
                  onClick={() => window.location.href = "/Medication"}
                >
                  <div className="flex items-center w-full">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 group-hover:bg-purple-200">
                      <i className="fas fa-pills"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Medication</div>
                      <div className="text-sm text-gray-500">Add new treatment schedules and monitor active medications</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Data Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-white">
              <i className="fas fa-download mr-2"></i>
              Export Data
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" onClick={handleCSVExport}>
                <i className="fas fa-file-csv mr-2"></i>
                CSV
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleExcelExport} data-excel-export>
                <i className="fas fa-file-excel mr-2"></i>
                Excel
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handlePDFExport}>
                <i className="fas fa-file-pdf mr-2"></i>
                PDF
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}