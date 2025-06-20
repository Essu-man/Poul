import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { inter } from './fonts';
import { AuthProvider } from '@/context/AuthContext';
import {Header} from "@/components/Header";

export const metadata: Metadata = {
  title: "Poultry Farm Management",
  description: "A comprehensive poultry farm management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          <Header activeTab="dashboard" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
