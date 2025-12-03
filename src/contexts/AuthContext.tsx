// Utility to decode JWT and extract payload

export function decodeJWT(token: string | null) {
  if (!token) return null;
  try {
    // map common synonyms to the canonical roles

    const payload = token.split(".")[1];
    if (!payload) return null;
    // add padding if missing
    const pad = payload.length % 4;
    const padded = payload + (pad ? "=".repeat(4 - pad) : "");
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(base64);
    // Parse JSON safely
    return JSON.parse(decodedPayload);
  } catch (e) {
    console.error("[decodeJWT] failed", e);
    return null;
  }
}

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/api";
import { User as StoreUser, ApiUser } from "@/features/auth/types";
import { mapApiUserToStoreUser } from "@/features/auth/utils";
import type { Role, Permission, OrganizationInfo } from "@/types/rbac";
import { hasPermission as checkPermission } from "@/lib/permissions";

// Extended user with RBAC fields from JWT
// Omit role from User to avoid type conflict, then add it back with correct RBAC type
export interface AuthUser extends Omit<StoreUser, 'role'> {
  role: Role | null;
  organizations: OrganizationInfo[];
  organization_id: string | null;
  organization_name: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role | Role[]) => boolean;
  role: Role | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Extract user info from JWT token
function extractUserFromJWT(token: string | null): Partial<AuthUser> | null {
  if (!token) return null;

  const payload = decodeJWT(token);
  if (!payload) return null;

  return {
    role: (payload.role as Role) || null,
    organizations: payload.organizations || [],
    organization_id: payload.organization_id || null,
    organization_name: payload.organization_name || null,
  };
}

import { config } from "@/config";
import { storage } from "@/lib/utils";

// ... imports

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    setUser,
    logout: storeLogout,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Merge JWT data into user object
  const mergeJWTData = (user: StoreUser | null): AuthUser | null => {
    if (!user) return null;

    const access = storage.get<string>(config.storage.AUTH_TOKEN);
    const jwtData = extractUserFromJWT(access);

    return {
      ...user,
      role: jwtData?.role || null,
      organizations: jwtData?.organizations || [],
      organization_id: jwtData?.organization_id || null,
      organization_name: jwtData?.organization_name || null,
    } as AuthUser;
  };

  // Try to hydrate user from backend if token exists but store has no user
  useEffect(() => {
    const tryHydrate = async () => {
      const access = storage.get<string>(config.storage.AUTH_TOKEN);
      if (!access) {
        setIsLoading(false);
        return;
      }
      if (user) {
        setIsLoading(false);
        return;
      }
      try {
        const resp = await authApi.me();
        const fetchedUser = resp as ApiUser;
        const storeUser = mapApiUserToStoreUser(fetchedUser);
        const mergedUser = mergeJWTData(storeUser);
        if (mergedUser) {
          setUser({
            ...mergedUser,
            role: mergedUser.role || '',
          });
        }
      } catch (err) {
        storage.remove(config.storage.AUTH_TOKEN);
        storage.remove(config.storage.REFRESH_TOKEN);
        setUser(null as any);
      } finally {
        setIsLoading(false);
      }
    };
    tryHydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose a login that delegates to the store's login method
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Attempt real backend login first
      const resp = await authApi.login({ email, password });
      const { access, refresh } = resp;

      if (access) storage.set(config.storage.AUTH_TOKEN, access);
      if (refresh) storage.set(config.storage.REFRESH_TOKEN, refresh);

      // Always fetch /me after login to hydrate user
      let userToSet: AuthUser | null = null;
      try {
        const meResp = await authApi.me();
        if (meResp) {
          const storeUser = mapApiUserToStoreUser(meResp as ApiUser);
          userToSet = mergeJWTData(storeUser);
        }
      } catch (e) {
        // fallback: userToSet remains null
      }
      if (userToSet) {
        setUser({
          ...userToSet,
          role: userToSet.role || '',
        });
      }
      // Wait for zustand store to reflect the user (ensures reactivity for redirect)
      let waited = 0;
      const maxWait = 2000; // 2 seconds
      await new Promise<void>((resolve) => {
        const check = () => {
          const current = useAuthStore.getState().user;
          if (userToSet && current && current.email === userToSet.email) {
            resolve();
          } else if (waited >= maxWait) {
            resolve();
          } else {
            waited += 20;
            setTimeout(check, 20);
          }
        };
        check();
      });
      return true;
    } catch (err) {
      // Fallback to store login (which might be a mock or different implementation)
      // The new store login takes (user, token), not (email, password)
      // So we can't call storeLogin(email, password) anymore.
      // We'll just return false here as the store doesn't support direct login with credentials
      return false;
    }
  };

  const logout = () => {
    // Try to notify backend, then clear local state
    try {
      void authApi.logout();
    } catch (err) {
      // ignore
    }
    storage.remove(config.storage.AUTH_TOKEN);
    storage.remove(config.storage.REFRESH_TOKEN);
    storeLogout();
  };

  const hasPermission = (permission: Permission): boolean => {
    const authUser = user as AuthUser | null;
    if (!authUser?.role) return false;
    return checkPermission(authUser.role, permission);
  };

  const hasRole = (role: Role | Role[]): boolean => {
    const authUser = user as AuthUser | null;
    if (!authUser?.role) return false;
    if (Array.isArray(role)) {
      return role.includes(authUser.role);
    }
    return authUser.role === role;
  };

  const value = {
    user: user as AuthUser | null,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
    role: (user as AuthUser)?.role || null,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
