import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMeAuth } from "@/authConf/getMe"; // <-- ton helper
import type { Me } from "@/authConf/getMe";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthCtxType = {
  user: Me | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<AuthCtxType>({
  user: null,
  status: "loading",
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const load = async () => {
    const { authenticated, user } = await getMeAuth();
    if (authenticated) {
      setUser(user);
      setStatus("authenticated");
    } else {
      setUser(null);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const value = useMemo(
    () => ({ user, status, refresh: load }),
    [user, status]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
