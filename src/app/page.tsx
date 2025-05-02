"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    setIsLoginLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Show success toast
    toast.success("Login successful! Welcome back!", {
      duration: 2000,
    });

    // Wait for toast animation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Redirect to dashboard with animation
    router.push("/Dashboard");
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <AnimatePresence mode="wait">
        {!showSignUp ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Login to manage your poultry farm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  className="w-full"
                  onClick={handleLogin}
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? (
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : null}
                  {isLoginLoading ? "Logging in..." : "Login"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setShowSignUp(true)}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Sign up to start managing your farm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="Create a password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirm your password" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full">Sign Up</Button>
                <p className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <button
                    onClick={() => setShowSignUp(false)}
                    className="text-primary hover:underline"
                  >
                    Login
                  </button>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}