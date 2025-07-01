'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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