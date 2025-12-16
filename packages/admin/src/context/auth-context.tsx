"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const storedToken = localStorage.getItem("admin_token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      // Clear invalid token
      localStorage.removeItem("admin_token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const refetchUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
