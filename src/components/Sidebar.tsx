import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  activeTab: "dashboard" | "egg-production" | "feed-management" | "medication";
}

export function Sidebar({ activeTab }: SidebarProps) {
  const navigationItems = [
    { href: "/Dashboard", label: "Dashboard", id: "dashboard" },
    { href: "/EggProduction", label: "Egg Logging", id: "egg-production" },
    { href: "/FeedManagement", label: "Feed Management", id: "feed-management" },
    { href: "/Medication", label: "Medication Tracking", id: "medication" }
  ];

  return (
    <div className="w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] shadow-md z-10 flex flex-col">
      <div className="p-4 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
            <i className="fas fa-feather-alt"></i>
          </div>
          <div>
            <h2 className="font-bold text-lg">PoultryFarm</h2>
            <p className="text-xs opacity-70">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors
                  ${activeTab === item.id
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                    : "hover:bg-[var(--sidebar-accent)] hover:bg-opacity-50"}`}
              >
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-[var(--sidebar-border)]">
        <div className="flex items-center mt-4">
          <Avatar className="cursor-pointer">
            <AvatarImage src="#" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs opacity-70">Farm Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
