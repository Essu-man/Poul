'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { getFirestore, doc, setDoc } from "firebase/firestore";

type UserWithRole = User & {
  role?: string;
};

type AuthContextType = {
  user: UserWithRole | null;
  role: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  role: null,
  loading: true 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        try {
          // Get the user's ID token
          const token = await user.getIdToken();
          
          // Fetch user role from our database
          const response = await fetch(`/api/users?id=${user.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setRole(userData.role);
            setUser({ ...user, role: userData.role });
          } else {
            console.error('Failed to fetch user role');
            setRole(null);
            setUser(user);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
          setUser(user);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hook for role-based access control
export const useRequireRole = (requiredRole: string) => {
  const { role, loading } = useAuth();
  
  if (!loading && (!role || role !== requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
  
  return true;
};

const userAuth = useAuth();

const db = getFirestore();

export async function setUserRole(uid: string, role: "administrator" | "employee"): Promise<void> {
  try {
    await setDoc(doc(db, "users", uid), {
      role,
      createdAt: new Date()
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function handleSignUp(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return userCredential.user;
  } catch (error) {
    // You can type error as unknown and narrow it if you want
    console.error(error);
    throw error;
  }
}

export async function handleSignUpAndRole(
  email: string,
  password: string,
  role: "administrator" | "employee"
): Promise<void> {
  try {
    const user = await handleSignUp(email, password);
    await setUserRole(user.uid, role);
    // Success! Redirect or show success message
  } catch (error) {
    // Handle error (e.g., show error message to user)
    throw error;
  }
}