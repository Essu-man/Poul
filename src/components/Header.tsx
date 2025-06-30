
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface HeaderProps {
  activeTab: "dashboard" | "egg-production" | "feed-management" | "medication";
  className?: string;
  style?: React.CSSProperties;
}

export function Header({ activeTab, className = "", style }: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Debug logging - remove after fixing
  console.log('Header rendering:', { activeTab, user: user?.email, authUser: auth.currentUser?.email });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatTabName = (tab: string) => {
    return tab.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <header 
      className={`bg-blue-600 text-white p-4 flex justify-between items-center shadow-md flex-shrink-0 ${className}`}
      style={style}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          {(user || auth.currentUser) && `Welcome, ${
            user?.displayName || 
            auth.currentUser?.displayName || 
            user?.email?.split('@')[0] || 
            auth.currentUser?.email?.split('@')[0] || 
            'User'
          }!`}
        </h1>
        <span className="text-sm opacity-75">
          {formatTabName(activeTab)}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm opacity-75 hidden md:block">
          {format(new Date(), "MMM dd, yyyy")}
        </span>
        {(user || auth.currentUser) && (
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}