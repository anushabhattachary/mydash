"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface UserProfile {
  userId: string;
  name: string;
  icon: string;
  createdAt: string;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  isLoaded: boolean;
  updateProfile: (name: string, icon: string) => void;
  clearProfile: () => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    // Check for userId
    const savedUserId = localStorage.getItem("lilac_userId");
    if (savedUserId) {
      const savedProfileStr = localStorage.getItem("lilac_user_profile");
      if (savedProfileStr) {
        try {
          const savedProfile = JSON.parse(savedProfileStr);
          setProfile(savedProfile);
        } catch (e) {
          console.error("Failed to parse user profile", e);
        }
      }
    }
    setIsLoaded(true);
  }, []);

  const updateProfile = (name: string, icon: string) => {
    let currentId = profile?.userId || localStorage.getItem("lilac_userId");
    if (!currentId) {
      currentId = crypto.randomUUID();
      localStorage.setItem("lilac_userId", currentId);
    }

    const newProfile: UserProfile = {
      userId: currentId,
      name,
      icon,
      createdAt: profile?.createdAt || new Date().toISOString(),
    };

    setProfile(newProfile);
    localStorage.setItem("lilac_user_profile", JSON.stringify(newProfile));
  };

  const clearProfile = () => {
    // Usually clears everything but for simple reset
    localStorage.removeItem("lilac_userId");
    localStorage.removeItem("lilac_user_profile");
    setProfile(null);
  };

  return (
    <UserProfileContext.Provider value={{ profile, isLoaded, updateProfile, clearProfile, isEditingProfile, setIsEditingProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
