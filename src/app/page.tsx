"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Simple poultry bird SVG icon
function BirdIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="32" rx="14" ry="10" fill="#222" />
      <ellipse cx="24" cy="20" rx="10" ry="8" fill="#fff" />
      <ellipse cx="20" cy="19" rx="2" ry="2" fill="#222" />
      <ellipse cx="28" cy="19" rx="2" ry="2" fill="#222" />
      <ellipse cx="24" cy="25" rx="4" ry="2" fill="#222" />
      <polygon points="24,12 26,16 22,16" fill="#fbbf24" />
    </svg>
  );
}

export default function AuthPage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-2">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col items-center border border-neutral-200"
      >
        <div className="flex flex-col items-center mb-6">
          <BirdIcon />
          <span className="text-2xl font-bold text-black mt-2">PoultryPro</span>
        </div>
        {showSignUp ? (
          <SignUpForm
            onSuccess={() => setShowSignUp(false)}
            showVerificationModal={showVerificationModal}
            setShowVerificationModal={setShowVerificationModal}
            onVerificationEmailSent={(email) => setVerificationEmail(email)}
          />
        ) : (
          <LoginForm onSignUp={() => setShowSignUp(true)} />
        )}
        <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Your Email</DialogTitle>
              <DialogDescription>
                A verification email has been sent to <b>{verificationEmail}</b>.<br />
                Please check your inbox and verify your email before logging in.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => {
                  setShowVerificationModal(false);
                  setShowSignUp(false); // Switch to login form
                }}
              >
                Go to Login
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}

function LoginForm({ onSignUp }: { onSignUp: () => void }) {
  const [formData, setFormData] = useState({ email: "", password: "", role: "employee" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.role) {
      toast.error("Please enter your email, password, and select a role.");
      return;
    }

    setIsLoginLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast.error("Please verify your email before logging in.");
        setIsLoginLoading(false);
        return;
      }

      // Fetch user data from our database
      const response = await fetch(`/api/users?email=${user.email}`);
      
      if (!response.ok) {
        if (formData.role === 'administrator') {
            toast.error("Account not found. Please check your credentials or sign up.");
        } else {
            toast.error("An error occurred. Please try again.");
        }
        setIsLoginLoading(false);
        return;
      }

      const dbUser = await response.json();

      if (dbUser.role !== formData.role) {
        if (formData.role === 'administrator') {
            toast.error("Account not found. You do not have permission for this role.");
        } else {
            toast.error("Access denied. You do not have permission for this role.");
        }
        setIsLoginLoading(false);
        return;
      }

      toast.success("Login successful! Welcome back!");
      router.push("/Dashboard");
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            toast.error("Invalid credentials. Please check your email and password.");
        } else {
            toast.error(error.message);
        }
      setIsLoginLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-black tracking-tight text-center">
        Welcome Back
      </h2>
      <p className="mb-8 text-gray-500 text-center text-base sm:text-lg">
        Login to manage your poultry farm
      </p>
      <form onSubmit={handleLogin} className="space-y-6 w-full">
        <div className="space-y-2">
          <Label htmlFor="role" className="text-base sm:text-lg">Role</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
            <SelectTrigger className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-xl px-5 border-2 border-neutral-200 focus:border-black">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent className="w-full bg-white shadow-lg border-2 border-neutral-200 z-50">
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="administrator">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base sm:text-lg">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            autoComplete="email"
            className="h-12 sm:h-14 text-base sm:text-lg rounded-xl px-5 border-2 border-neutral-200 focus:border-black"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-base sm:text-lg">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              className="h-12 sm:h-14 text-base sm:text-lg rounded-xl px-5 border-2 border-neutral-200 focus:border-black pr-16"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-black font-semibold"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <Button
          className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-xl bg-black text-white font-bold shadow-lg mt-2 hover:bg-neutral-900"
          type="submit"
          disabled={isLoginLoading}
        >
          {isLoginLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <p className="text-base text-gray-500 mt-6 text-center">
        Don't have an account?{" "}
        <button
          onClick={onSignUp}
          className="text-black hover:underline font-semibold"
          type="button"
        >
          Sign up
        </button>
      </p>
    </>
  );
}

function isStrongPassword(password: string) {
  return /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /\d/.test(password) &&
         password.length >= 6;
}

function SignUpForm({ onSuccess, showVerificationModal, setShowVerificationModal, onVerificationEmailSent }: { onSuccess: () => void, showVerificationModal: boolean, setShowVerificationModal: (open: boolean) => void, onVerificationEmailSent: (email: string) => void }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    role: "employee"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [id]: value };
      if (
        (id === "password" || id === "confirmPassword") &&
        updated.password &&
        updated.confirmPassword
      ) {
        setPasswordError(updated.password !== updated.confirmPassword);
      } else {
        setPasswordError(false);
      }
      return updated;
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!isStrongPassword(formData.password)) {
      setPasswordError(true);
      toast.error(
        "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
      );
      return;
    }

    setIsSignUpLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });
      await sendEmailVerification(user);

      // Create user in our database
      await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.uid,
          email: user.email,
          role: formData.role,
          name: formData.name,
        }),
      });

      onVerificationEmailSent(formData.email);
      setShowVerificationModal(true);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSignUpLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-black tracking-tight text-center">
        Create Your Account
      </h2>
      <p className="mb-8 text-gray-500 text-center text-base sm:text-lg">
        Sign up to start managing your farm
      </p>
      <form onSubmit={handleSignUp} className="space-y-6 w-full">
        <div className="space-y-2">
          <Label htmlFor="role" className="text-base sm:text-lg">Role</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
            <SelectTrigger className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-xl px-5 border-2 border-neutral-200 focus:border-black">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent className="w-full bg-white shadow-lg border-2 border-neutral-200 z-50">
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="administrator">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base sm:text-lg">Full Name</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleInputChange}
            autoComplete="name"
            className="h-12 sm:h-14 text-base sm:text-lg rounded-xl px-5 border-2 border-neutral-200 focus:border-black"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base sm:text-lg">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            autoComplete="email"
            className="h-12 sm:h-14 text-base sm:text-lg rounded-xl px-5 border-2 border-neutral-200 focus:border-black"
          />
        </div>
        <motion.div
          animate={passwordError ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="password" className="text-base sm:text-lg">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="new-password"
              className="h-12 sm:h-14 text-base sm:text-lg rounded-xl px-5 border-2 border-neutral-200 focus:border-black pr-16"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-black font-semibold"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </motion.div>
        <motion.div
          animate={passwordError ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="confirmPassword" className="text-base sm:text-lg">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
              className="h-12 sm:h-14 text-base sm:text-lg rounded-xl px-5 border-2 border-neutral-200 focus:border-black pr-16"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-black font-semibold"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {passwordError && (
            <span className="text-red-600 text-base font-medium">
              Passwords don't match
            </span>
          )}
        </motion.div>
        <Button
          className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-xl bg-black text-white font-bold shadow-lg mt-2 hover:bg-neutral-900"
          type="submit"
          disabled={isSignUpLoading}
        >
          {isSignUpLoading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
      <p className="text-base text-gray-500 mt-6 text-center">
        Already have an account?{" "}
        <button
          onClick={onSuccess}
          className="text-black hover:underline font-semibold"
          type="button"
        >
          Login
        </button>
      </p>
    </>
  );
}