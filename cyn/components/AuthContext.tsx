import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

type User = {
  accessToken: string;
  role: string;
  fullName: string;
  email: string;
  id: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: User) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("customerData");

      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        const decoded: any = jwtDecode(parsed.accessToken);

        const expired = Date.now() >= decoded.exp * 1000;
        if (expired && parsed.role === "businessOwner") {
          await AsyncStorage.removeItem("customerData");
          setUser(null);
        } else {
          setUser(parsed);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (data: User) => {
    await AsyncStorage.setItem("customerData", JSON.stringify(data));
    setUser(data);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("customerData");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
