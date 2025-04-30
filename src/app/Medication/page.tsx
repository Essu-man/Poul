"use client";

import Link from "next/link";

export default function MedicationTrackingPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Same as Dashboard */}
      <div className="w-64 bg-white shadow-md z-10 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Poultry Farm</h2>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/EggProduction"
                className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <span>Egg Production</span>
              </Link>
            </li>
            <li>
              <Link
                href="/FeedManagement"
                className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <span>Feed Management</span>
              </Link>
            </li>
            <li>
              <Link
                href="/MedicationTracking"
                className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg bg-gray-100"
              >
                <span>Medication Tracking</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Medication Tracking</h1>
          {/* Add your medication tracking content here */}
        </div>
      </div>
    </div>
  );
}