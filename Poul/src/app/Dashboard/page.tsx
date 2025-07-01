"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, query, where, orderBy, limit, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, PlusCircle } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import Link from "next/link";

// Define interfaces for our data structures
interface EggProductionRecord {
  id: string;
  date: string;
  peewee_crates?: number;
  peewee_pieces?: number;
  small_crates?: number;
  small_pieces?: number;
  medium_crates?: number;
  medium_pieces?: number;
  large_crates?: number;
  large_pieces?: number;
  extra_large_crates?: number;
  extra_large_pieces?: number;
  jumbo_crates?: number;
  jumbo_pieces?: number;
}

interface Task {
  id: string;
  name: string;
  priority: string;
  time: string;
  completed: boolean;
}

// Helper to sum total pieces from a record
const getTotalPieces = (record: DocumentData) => {
    return (
    (record.peewee_crates || 0) * 30 + (record.peewee_pieces || 0) +
    (record.small_crates || 0) * 30 + (record.small_pieces || 0) +
    (record.medium_crates || 0) * 30 + (record.medium_pieces || 0) +
    (record.large_crates || 0) * 30 + (record.large_pieces || 0) +
    (record.extra_large_crates || 0) * 30 + (record.extra_large_pieces || 0) +
    (record.jumbo_crates || 0) * 30 + (record.jumbo_pieces || 0)
    );
};

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [eggStats, setEggStats] = useState({ today: 0, week: 0, month: 0 });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentEggs, setRecentEggs] = useState<EggProductionRecord[]>([]);
  const [employees, setEmployees] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchEggStats = async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const sevenDaysAgo = format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
      const thirtyDaysAgo = format(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
      const q = query(collection(db, "egg-production"), where("user_id", "==", user.uid));
      const snap = await getDocs(q);
      
      let todayCount = 0, weekCount = 0, monthCount = 0;
      snap.forEach(doc => {
        const d = doc.data();
        const total = getTotalPieces(d);
        if (d.date >= thirtyDaysAgo) monthCount += total;
        if (d.date >= sevenDaysAgo) weekCount += total;
        if (d.date === today) todayCount += total;
      });
      setEggStats({ today: todayCount, week: weekCount, month: monthCount });
    };

    const fetchRecentEggs = async () => {
      const q = query(collection(db, "egg-production"), where("user_id", "==", user.uid), orderBy("date", "desc"), limit(5));
      const snap = await getDocs(q);
      const eggDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EggProductionRecord));
      setRecentEggs(eggDocs);
    };

    const fetchTasks = async () => {
      const q = query(collection(db, "tasks"), orderBy("created_at", "desc"), limit(5));
      const snap = await getDocs(q);
      const taskDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskDocs);
    };
    
    const fetchEmployees = async () => {
      const q = query(collection(db, "users"), where("role", "==", "employee"));
      const snap = await getDocs(q);
      setEmployees(snap.size);
    };
    
    fetchEggStats();
    fetchRecentEggs();
    fetchTasks();
    fetchEmployees();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="dashboard" />
      <div className="flex-1 flex flex-col">
        <Header activeTab="dashboard" />
        <main className="flex-grow max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
          {/* New, larger header section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-gray-600">
               Here's your farm's performance overview.
              </p>
            </div>
            <div>
              <Link href="/EggProduction" passHref>
                <button className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-800 transition-colors">
                  <PlusCircle size={18} />
                  Log New Entry
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Eggs Today" value={eggStats.today} unit="pcs" change="+5.2%" trend="up" />
            <StatCard title="Eggs This Week" value={eggStats.week} unit="pcs" change="-1.1%" trend="down" />
            <StatCard title="Pending Tasks" value={tasks.filter(t => !t.completed).length} unit="tasks" subtitle="High priority" />
            <StatCard title="Total Employees" value={employees} unit="people" subtitle="on payroll" />
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Egg Production</h2>
              <ul className="divide-y divide-gray-200">
                {recentEggs.length === 0 && <li className="py-3 text-gray-500">No recent entries.</li>}
                {recentEggs.map((egg) => (
                  <li key={egg.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">Entry for {egg.date}</p>
                      <p className="text-sm text-gray-500">
                        Total Pieces: {getTotalPieces(egg)}
                      </p>
                    </div>
                    <button className="text-sm font-semibold text-black hover:underline">View</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Tasks</h2>
              <ul className="divide-y divide-gray-200">
                {tasks.length === 0 && <li className="py-3 text-gray-500">No tasks found.</li>}
                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  change?: string;
  trend?: "up" | "down";
  subtitle?: string;
}

function StatCard({ title, value, unit, change, trend, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-1.5 flex items-baseline">
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        <p className="ml-1 text-sm font-medium text-gray-500">{unit}</p>
      </div>
      {change && trend && (
        <div className={`mt-2 flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="ml-1">{change} vs last period</span>
        </div>
      )}
      {subtitle && (
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

interface TaskItemProps {
  task: Task;
}

function TaskItem({ task }: TaskItemProps) {
  return (
    <li className="py-3 flex justify-between items-center">
      <div>
        <p className="font-medium text-gray-800">{task.name}</p>
        <p className="text-sm text-gray-500">Priority: {task.priority} | Time: {task.time}</p>
      </div>
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
        task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {task.completed ? "Completed" : "Pending"}
      </span>
    </li>
  );
}