import { createContext, useCallback, useMemo, useState } from "react";
import adminService from "../services/adminService";

const TOKEN_KEY = "cexios_admin_token";
const NAME_KEY = "cexios_admin_username";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState(() => localStorage.getItem(NAME_KEY));

  const login = useCallback(async (user, password) => {
    const data = await adminService.login(user, password);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(NAME_KEY, user);
    setToken(data.access_token);
    setUsername(user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
    setToken(null);
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      username,
      login,
      logout,
    }),
    [token, username, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
