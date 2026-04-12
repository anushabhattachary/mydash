"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { UserProfileProvider } from "@/lib/userProfile";
import OnboardingModal from "@/components/OnboardingModal";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/OfflineBanner";
import SplashScreen from "@/components/SplashScreen";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserProfileProvider>
        <StoreProvider>
          <SplashScreen>
            {children}
          </SplashScreen>
        </StoreProvider>
        <OnboardingModal />
        <InstallPrompt />
        <OfflineBanner />
      </UserProfileProvider>
    </SessionProvider>
  );
}
