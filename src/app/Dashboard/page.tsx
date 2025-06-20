"use client";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format, addDays } from "date-fns";
import * as echarts from "echarts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  id?: number;
  name: string;
  time: string;
  priority: "High" | "Medium" | "Low";
  icon: string;
  color: string;
  created_at?: string;
}

interface DashboardStats {
  eggProduction: {
    total: number;
    change: string;
    trend: "up" | "down";
  };
  feedConsumption: {
    total: number;
    change: string;
    trend: "up" | "down";
  };
  activeMedications: {
    total: number;
    nextCompletion: string;
  };
  totalBirds: {
    total: number;
    status: string;
  };
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [productionData, setProductionData] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    eggProduction: {
      total: 0,
      change: "+0%",
      trend: "up"
    },
    feedConsumption: {
      total: 0,
      change: "+0%",
      trend: "up"
    },
    activeMedications: {
      total: 1,
      nextCompletion: "5 days"
    },
    totalBirds: {
      total: 2450,
      status: "Healthy population"
    }
  });
  const [tasks, setTasks] = useState<TaskItemProps[]>([]);
  const [newTask, setNewTask] = useState<TaskItemProps>({
    name: '',
    time: '',
    priority: 'Medium',
    icon: 'calendar',
    color: 'blue',
  });

  const fetchEggProduction = async () => {
    try {
      const response = await fetch('/api/egg-production');
      if (!response.ok) throw new Error('Failed to fetch egg production data');
      const data = await response.json();
      console.log('Fetched production data:', data); // Debug log
      setProductionData(data);
      
      // Calculate total eggs for today
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = data.find((record: any) => record.date === today);
      console.log('Today\'s record:', todayRecord); // Debug log
      
      const todayTotal = todayRecord ? calculateTotalEggs(todayRecord) : 0;
      console.log('Calculated total eggs:', todayTotal); // Debug log
      
      // Calculate change percentage from yesterday
      const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
      const yesterdayRecord = data.find((record: any) => record.date === yesterday);
      const yesterdayTotal = yesterdayRecord ? calculateTotalEggs(yesterdayRecord) : 0;
      
      const changePercentage = yesterdayTotal ? ((todayTotal - yesterdayTotal) / yesterdayTotal * 100).toFixed(1) : '0';
      
      setStats(prev => ({
        ...prev,
        eggProduction: {
          total: todayTotal,
          change: `${changePercentage}%`,
          trend: Number(changePercentage) >= 0 ? 'up' : 'down'
        }
      }));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching egg production:', error);
      setIsLoading(false);
    }
  };

  const calculateTotalEggs = (record: any) => {
    if (!record) return 0;
    
    // Define egg size categories based on the actual data structure
    const categories = [
      'peewee',
      'small',
      'medium',
      'large',
      'extraLarge',
      'jumbo'
    ];
    
    // Calculate total eggs for each category using the nested structure
    return categories.reduce((total, category) => {
      const categoryData = record[category];
      if (!categoryData) return total;
      
      const crates = categoryData.crates || 0;
      const pieces = categoryData.pieces || 0;
      return total + (crates * 30) + pieces;
    }, 0);
  };

  useEffect(() => {
    fetchEggProduction();
  }, []);

  // Modify the chart initialization to use real data
  useEffect(() => {
    if (!productionData.length) return;

    const chartDom = document.getElementById("productionChart");
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      
      // Get last 7 days of data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        return format(date, "yyyy-MM-dd");
      });

      const eggData = last7Days.map(date => {
        const record = productionData.find(r => r.date === date);
        return record ? calculateTotalEggs(record) : 0;
      });

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
          data: last7Days.map(date => format(new Date(date), "MMM dd")),
        },
        yAxis: {
          type: "value",
          name: "Count",
          axisLabel: {
            formatter: "{value}"
          }
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
  }, [productionData]);

  // Add new task
  const handleAddTask = async () => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    if (res.ok) {
      const created = await res.json();
      setTasks((prev) => [created, ...prev]);
      setNewTask({ name: "", time: "", priority: "Medium", icon: "calendar", color: "blue" });
    }
  };

  useEffect(() => {
    fetch("/api/tasks")
      .then(res => res.json())
      .then(setTasks)
      .catch(err => console.error("Failed to fetch tasks:", err));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar activeTab="dashboard" />
       <Header activeTab="dashboard" className="flex-shrink-0" />
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
                  <AddTaskDialog onTaskCreated={(task) => setTasks(prev => [...prev, task])} />
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
                {tasks.map((task: TaskItemProps, index: number) => (
                  <div key={`task-${index}`}>
                    <TaskItem {...task} />
                    {index < tasks.length - 1 && <Separator />}
                  </div>
                ))}
                <AddTaskDialog onTaskCreated={(task) => setTasks(prev => [...prev, task])} />
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

// Update the AddTaskDialog component
function AddTaskDialog({ onTaskCreated }: { onTaskCreated: (task: TaskItemProps) => void }) {
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState<TaskItemProps>({
    name: '',
    time: '',
    priority: 'Medium',
    icon: 'calendar',
    color: 'blue',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw new Error('Failed to create task');

      const savedTask = await response.json();
      onTaskCreated(savedTask);
      setOpen(false);
      setNewTask({
        name: '',
        time: '',
        priority: 'Medium',
        icon: 'calendar',
        color: 'blue',
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="task-name" className="text-sm font-medium">Task Name</label>
            <Input
              id="task-name"
              value={newTask.name}
              onChange={(e) => setNewTask((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter task name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="time" className="text-sm font-medium">Time</label>
              <Input
                id="time"
                type="time"
                value={newTask.time}
                onChange={(e) => setNewTask((prev) => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="priority" className="text-sm font-medium">Priority Level</label>
              <Select
                value={newTask.priority}
                onValueChange={(value: "High" | "Medium" | "Low") =>
                  setNewTask((prev) => ({ ...prev, priority: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="icon" className="text-sm font-medium">Icon</label>
              <Select
                value={newTask.icon}
                onValueChange={(value: string) =>
                  setNewTask((prev) => ({ ...prev, icon: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calendar">Calendar</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="bell">Bell</SelectItem>
                  <SelectItem value="star">Star</SelectItem>
                  {/* Add more icons as needed */}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="color" className="text-sm font-medium">Color</label>
              <Select
                value={newTask.color}
                onValueChange={(value: string) =>
                  setNewTask((prev) => ({ ...prev, color: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="amber">Amber</SelectItem>
                  {/* Add more colors as needed */}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">Create Task</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}