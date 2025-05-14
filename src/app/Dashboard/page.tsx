"use client";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import * as echarts from "echarts";
import { useEffect, useState } from "react";



interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  change?: string;
  trend?: "up" | "down";
  subtitle?: string;
}

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

interface InventoryItemProps {
  name: string;
  level: number;
}

interface TaskItemProps {
  name: string;
  time: string;
  priority: "High" | "Medium" | "Low";
  icon: string;
  color: string;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  const stats = {
    eggProduction: {
      total: 0,
      change: "+12%",
      trend: "up" as "up" | "down"  
    },
    feedConsumption: {
      total: 0,
      change: "-5%",
      trend: "down" as "up" | "down"
    },
    activeMedications: {
      total: 1,
      nextCompletion: "5 days"
    },
    totalBirds: {
      total: 2450,
      status: "Healthy population"
    }
  };

  const inventory = [
    { name: "Layer Feed", level: 75 },
    { name: "Starter Feed", level: 45 },
    { name: "Vitamins", level: 90 },
    { name: "Egg Cartons", level: 30 }
  ];

  const tasks = [
    { name: "Coop Cleaning", time: "Tomorrow, 9:00 AM", priority: "High" as "High", icon: "calendar-check", color: "blue" },
    { name: "Vaccination", time: "Apr 12, 8:00 AM", priority: "Medium" as "Medium", icon: "syringe", color: "purple" },
    { name: "Feed Delivery", time: "Apr 15, 10:30 AM", priority: "Medium" as "Medium", icon: "truck", color: "amber" },
    { name: "Monthly Inspection", time: "Apr 30, 1:00 PM", priority: "Low" as "Low", icon: "clipboard-check", color: "green" }
  ] as const;

  const activities = [
    { title: "Egg Collection Completed", description: "425 eggs collected from Coop A", time: "Today, 8:30 AM", icon: "egg", color: "blue" },
    { title: "Feed Distributed", description: "250kg of layer feed distributed", time: "Today, 7:15 AM", icon: "wheat", color: "amber" },
    { title: "Medication Administered", description: "Vitamin supplement added to water", time: "Today, 6:45 AM", icon: "pills", color: "purple" },
    { title: "Health Check Completed", description: "All birds in good condition", time: "Yesterday, 5:30 PM", icon: "check-circle", color: "green" }
  ];

  // Initialize chart
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
        () => Math.floor(Math.random() * 500) + 300
      );

      const feedData = Array.from(
        { length: 7 },
        () => Math.floor(Math.random() * 300) + 100
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
      return () => myChart.dispose();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar activeTab="dashboard" />
      
        <main className="flex-1 p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Egg Production"
              value={stats.eggProduction.total}
              unit="eggs today"
              change={stats.eggProduction.change}
              trend={stats.eggProduction.trend}
            />
            <StatCard
              title="Feed Consumption"
              value={stats.feedConsumption.total}
              unit="kg today"
              change={stats.feedConsumption.change}
              trend={stats.feedConsumption.trend}
            />
            <StatCard
              title="Active Medications"
              value={stats.activeMedications.total}
              unit="treatments"
              subtitle={`Next completion in ${stats.activeMedications.nextCompletion}`}
            />
            <StatCard
              title="Total Birds"
              value={stats.totalBirds.total}
              unit="birds"
              subtitle={stats.totalBirds.status}
            />
          </div>
      
          {/* Charts and Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Production Trends</CardTitle>
                <CardDescription>Daily egg production and feed consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div id="productionChart" className="w-full h-80" />
              </CardContent>
            </Card>
      
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Scheduled farm activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <div key={`task-${index}`}>
                      <TaskItem {...task} />
                      {index < tasks.length - 1 && <Separator />}
                    </div>
                  ))}
                  <AddTaskDialog />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="dashboard" />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Egg Production"
            value={stats.eggProduction.total}
            unit="eggs today"
            change={stats.eggProduction.change}
            trend={stats.eggProduction.trend}
          />
          <StatCard
            title="Feed Consumption"
            value={stats.feedConsumption.total}
            unit="kg today"
            change={stats.feedConsumption.change}
            trend={stats.feedConsumption.trend}
          />
          <StatCard
            title="Active Medications"
            value={stats.activeMedications.total}
            unit="treatments"
            subtitle={`Next completion in ${stats.activeMedications.nextCompletion}`}
          />
          <StatCard
            title="Total Birds"
            value={stats.totalBirds.total}
            unit="birds"
            subtitle={stats.totalBirds.status}
          />
        </div>

        {/* Charts and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Production Trends</CardTitle>
              <CardDescription>Daily egg production and feed consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="productionChart" className="w-full h-80" />
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Scheduled farm activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={`task-${index}`}>
                    <TaskItem {...task} />
                    {index < tasks.length - 1 && <Separator />}
                  </div>
                ))}
                <AddTaskDialog />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Move these component definitions outside the main Dashboard component
function StatCard({ title, value, unit, change, trend, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{value}</span>
          <span className="ml-2 text-sm text-gray-500">{unit}</span>
        </div>
        <div className="mt-2">
          <Progress value={75} className="h-1" />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {change && (
          <span className={`text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            <i className={`fas fa-arrow-${trend} mr-1`}></i>
            {change} from yesterday
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-gray-600">
            <i className="fas fa-info-circle mr-1"></i>
            {subtitle}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

// Component for activity items
function ActivityItem({ title, description, time, icon, color }: ActivityItemProps) {
  return (
    <div className="flex items-start">
      <div className={`w-9 h-9 rounded-full bg-${color}-100 flex items-center justify-center text-${color}-600 mr-3 mt-1`}>
        <i className={`fas fa-${icon}`}></i>
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

// Component for inventory items
function InventoryItem({ name, level }: InventoryItemProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm text-gray-500">{level}%</span>
      </div>
      <Progress value={level} className="h-2" />
    </div>
  );
}

// Component for task items
// Add these imports at the top
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function TaskItem({ name, time, priority, icon, color }: TaskItemProps) {
  const getPriorityColor = (priority: "High" | "Medium" | "Low") => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-600";
      case "Medium":
        return "bg-amber-100 text-amber-600";
      case "Low":
        return "bg-green-100 text-green-600";
    }
  };

  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center text-${color}-600 mr-3`}>
          <i className={`fas fa-${icon}`}></i>
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
      <Badge className={`${getPriorityColor(priority)}`}>{priority}</Badge>
    </div>
  );
}

// Add the AddTaskDialog component
function AddTaskDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-black text-white hover:bg-black/90">
          <i className="fas fa-plus mr-2"></i>
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Create a new task for farm management system.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="task-name" className="text-sm font-medium">Task Name</label>
            <Input id="task-name" placeholder="Enter task name" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea id="description" placeholder="Enter task description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium">Date</label>
              <Input id="date" type="date" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="time" className="text-sm font-medium">Time</label>
              <Input id="time" type="time" />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="priority" className="text-sm font-medium">Priority Level</label>
            <Select>
              <SelectTrigger>
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
            <label htmlFor="assignee" className="text-sm font-medium">Assignee</label>
            <Input id="assignee" placeholder="Select assignee" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <Input id="notes" placeholder="Add additional notes" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
          <Button type="submit">Save Task</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
