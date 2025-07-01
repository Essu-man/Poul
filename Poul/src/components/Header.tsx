"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, LogOut, Settings, User } from "lucide-react";

export function Header() {
  const { user, role } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper for initials
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="w-full bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      {/* Welcome message */}
      <div className="text-lg sm:text-xl font-bold text-gray-900">
        Welcome, {user?.displayName || "User"}
      </div>
      {/* Right side: notifications and profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6 text-gray-500" />
        </button>
        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-lg focus:outline-none"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="Profile"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-gray-500" />
            )}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-2">
              <div className="px-4 py-2 text-xs text-gray-400">Role</div>
              <div className="px-4 py-2 text-gray-700 font-semibold cursor-default select-none opacity-70">
                {role || "Role"}
              </div>
              <hr className="my-2" />
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition text-sm"
                // onClick={...} // Add your profile settings handler here
              >
                <Settings className="h-4 w-4" />
                Profile Settings
              </button>
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition text-sm"
                // onClick={...} // Add your logout handler here
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}