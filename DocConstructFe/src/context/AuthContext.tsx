import React, { createContext, useContext, useEffect, useState } from 'react';
import {apiLogin, apiValidateToken} from "../api";
import Cookies from "js-cookie";
import {errorHandler, ErrorResponseData} from "../components/ErrorHandler";
import {useRouter} from "next/router";

interface AuthContextType {
  user: string | null;
  token: string | null;
  roles: string[]; // New: Array of roles
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  showSidebar: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  roles: [], // Default empty array
  loading: true,
  login: async () => {
  },
  logout: async () => {
  },
  showSidebar: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]); // State for roles
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      const {accessToken, userEmail, userRoles} = response.data;

      setUser(userEmail);
      setToken(accessToken);
      setRoles(userRoles);

      // Store in cookies
      Cookies.set("userEmail", userEmail, {expires: 7});
      Cookies.set("accessToken", accessToken, {expires: 7});
      Cookies.set("userRoles", JSON.stringify(userRoles), {expires: 7});

      // Redirect to surveys page
      router.push('/surveys');
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to log in');
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setRoles([]);

    Cookies.remove("userEmail");
    Cookies.remove("accessToken");
    Cookies.remove("userRoles");

    // Redirect to login page
    router.push('/login');
  };

  // Check if user is logged in
  useEffect(() => {
    const initializeAuth = async () => {
      // Get saved user, token, and roles from cookies
      const savedUser = Cookies.get("userEmail");
      const savedToken = Cookies.get("accessToken");
      const savedRoles = Cookies.get("userRoles");

      // If no saved user or token, logout
      if (!savedUser || !savedToken) {
        await logout();
        setLoading(false);
        return;
      }

      // Set user, token, and roles
      setUser(savedUser);
      setToken(savedToken);
      setRoles(savedRoles ? JSON.parse(savedRoles) : []);

      // Validate token and logout if invalid
      try {
        await apiValidateToken(); // Validate token
      } catch (error) {
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Update sidebar visibility based on location and auth token changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (router.pathname === '/login') {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    handleRouteChange();

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.pathname, token]);

  return (
    <AuthContext.Provider value={{user, token, roles, loading, login, logout, showSidebar}}>
      {children}
    </AuthContext.Provider>
  );
};
