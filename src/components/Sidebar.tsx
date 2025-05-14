import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SidebarProps {
  activeTab: "dashboard" | "egg-production" | "feed-management" | "medication";
}

export function Sidebar({ activeTab }: SidebarProps) {
  const router = useRouter();
  const navigationItems = [
    { 
      href: "/Dashboard", 
      label: "Dashboard", 
      id: "dashboard",
      icon: "fas fa-chart-line"
    },
    { 
      href: "/EggProduction", 
      label: "Egg Logging", 
      id: "egg-production",
      icon: "fas fa-egg"
    },
    { 
      href: "/FeedManagement", 
      label: "Feed Management", 
      id: "feed-management",
      icon: "fas fa-wheat-awn"
    },
    { 
      href: "/Medication", 
      label: "Medication Tracking", 
      id: "medication",
      icon: "fas fa-pills"
    }
  ];

  const handleLogout = async () => {
    try {
      let { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg z-10 flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-feather-alt text-xl"></i>
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-800 dark:text-white">PoultryFarm</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                  ${activeTab === item.id
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}
              >
                <i className={`${item.icon} w-5 h-5 mr-3 transition-transform group-hover:scale-110
                  ${activeTab === item.id ? "text-emerald-500" : "text-gray-400 dark:text-gray-500"}`}></i>
                <span>{item.label}</span>
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <Avatar className="ring-2 ring-white dark:ring-gray-700 shadow-sm">
            <AvatarImage src="#" />
            <AvatarFallback className="bg-emerald-100 text-emerald-600">JD</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800 dark:text-white">John Doe</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Farm Manager</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          Logout
        </Button>
      </div>
    </div>
  );
}
