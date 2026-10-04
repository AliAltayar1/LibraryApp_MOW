"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "@/services/authService";
import { profileService } from "@/services/profileService";
import { getAccessToken, clearAuthData, isTokenExpired } from "@/lib/apiClient";
import { STORAGE_KEYS } from "@/lib/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize state with backend
  const fetchUserData = useCallback(async () => {
    try {
      const [currentUser, userProfile] = await Promise.all([
        authService.getCurrentUser().catch(() => null),
        profileService.getProfile().catch(() => null),
      ]);

      if (currentUser) {
        setUser(currentUser);
        setProfile(userProfile);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(currentUser));
        }
        return true;
      }
    } catch {
      // Session invalid or network down
    }
    return false;
  }, []);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const hasToken = getAccessToken();

      if (hasToken) {
        const success = await fetchUserData();
        if (!success && isMounted) {
          // Token might be expired, try refreshing via HttpOnly cookie
          try {
            await authService.refresh();
            await fetchUserData();
          } catch {
            clearAuthData();
            setUser(null);
            setProfile(null);
          }
        }
      } else {
        // No access token in storage, but we might have a valid refresh_token cookie
        try {
          const refreshRes = await authService.refresh();
          if (refreshRes?.access) {
            await fetchUserData();
          }
        } catch {
          // No active session
          setUser(null);
          setProfile(null);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    // Proactive background silent refresh check (every 60 seconds)
    const refreshInterval = setInterval(async () => {
      if (!isMounted) return;
      const token = getAccessToken();
      if (!token) return;

      // If token will expire in less than 2 minutes, refresh it quietly
      if (isTokenExpired(token, 120)) {
        try {
          await authService.refresh();
        } catch {
          // If silent background refresh fails, request interceptor will handle it on next API call
        }
      }
    }, 60000);

    // Listen for global logout events triggered by apiClient
    const handleLogoutEvent = () => {
      setUser(null);
      setProfile(null);
    };

    window.addEventListener("auth-logout", handleLogoutEvent);
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      window.removeEventListener("auth-logout", handleLogoutEvent);
    };
  }, [fetchUserData]);

  const login = async ({ identifier, username, password }) => {
    setIsLoading(true);
    try {
      const loginData = await authService.login({
        identifier: identifier || username,
        password,
      });

      if (loginData?.user) {
        setUser(loginData.user);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(loginData.user));
        }
      }

      // Fetch complete profile and user details
      try {
        const [meData, profileData] = await Promise.all([
          authService.getCurrentUser(),
          profileService.getProfile(),
        ]);
        if (meData) setUser(meData);
        if (profileData) setProfile(profileData);
      } catch (profileErr) {
        console.warn("Could not fetch profile right after login:", profileErr);
      }

      return loginData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    const updatedProfile = await profileService.updateProfile(formData);
    setProfile(updatedProfile);

    // Refresh user object if names/email changed
    try {
      const me = await authService.getCurrentUser();
      setUser(me);
    } catch {
      // Ignore
    }

    return updatedProfile;
  };

  const changePassword = async (passwords) => {
    return await profileService.changePassword(passwords);
  };

  const refreshUser = async () => {
    return await fetchUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
