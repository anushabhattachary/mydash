"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { UserProfileProvider } from "@/lib/userProfile";
import OnboardingModal from "@/components/OnboardingModal";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserProfileProvider>
        <StoreProvider>
          {children}
        </StoreProvider>
        <OnboardingModal />
      </UserProfileProvider>
    </SessionProvider>
  );
}
