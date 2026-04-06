import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Anusha's Dashboard",
  description: "A calm, beautiful daily life OS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${inter.variable} font-sans bg-linen text-slate-800 antialiased min-h-screen relative overflow-x-hidden`}
      >
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden pointer-events-none">
          <svg
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30 80 Q 50 20, 80 30 T 100 0"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
            <circle cx="50" cy="50" r="5" fill="currentColor" />
            <path
              d="M 50 50 Q 60 40, 70 50 Q 60 60, 50 50"
              fill="currentColor"
              opacity="0.5"
            />
          </svg>
          <svg
            className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
             <path
              d="M10 90 Q 40 40, 90 20 T 100 0"
              stroke="currentColor"
              strokeWidth="0.8"
              fill="none"
            />
             <path
              d="M 40 60 Q 50 30, 60 60 Q 50 90, 40 60"
              fill="currentColor"
              opacity="0.4"
            />
          </svg>
        </div>
        <Providers>
          <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
