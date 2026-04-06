"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <StoreProvider>
        {children}
      </StoreProvider>
    </SessionProvider>
  );
}
