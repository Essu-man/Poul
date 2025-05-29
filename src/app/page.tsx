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
          />
        ) : (
          <LoginForm onSignUp={() => setShowSignUp(true)} />
        )}
        <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Your Email</DialogTitle>
              <DialogDescription>
                A verification email has been sent to <b>{}</b>.<br />
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
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setIsLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast.success("Login successful! Welcome back!");
      router.push("/Dashboard");
    } catch (error: any) {
      toast.error(error.message);
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="space-y-6 w-full"
      >
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

function SignUpForm({ onSuccess, showVerificationModal, setShowVerificationModal }: { onSuccess: () => void, showVerificationModal: boolean, setShowVerificationModal: (open: boolean) => void }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
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

  const handleSignUp = async () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.name
    ) {
      toast.error("All fields are required!");
      return;
    }
    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!isStrongPassword(formData.password)) {
      toast.error(
        "Password must be at least 6 characters and include uppercase, lowercase, and a number."
      );
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      setPasswordError(true);
      return;
    }

    setIsSignUpLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await updateProfile(userCredential.user, { displayName: formData.name });
      await sendEmailVerification(userCredential.user);
      setShowVerificationModal(true); // Show modal instead of toast
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSignUp();
        }}
        className="space-y-6 w-full"
      >
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