"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { firebaseEnabled, watchAuth, type User } from "@/lib/firebase/auth";

type AuthState = {
  user: User | null;
  ready: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, ready: !firebaseEnabled });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!firebaseEnabled);

  useEffect(() => {
    return watchAuth((next) => {
      setUser(next);
      setReady(true);
    });
  }, []);

  return <AuthContext.Provider value={{ user, ready }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
