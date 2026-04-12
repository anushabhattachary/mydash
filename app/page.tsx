"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LiveHeader from "@/components/LiveHeader";
import Timeline from "@/components/Timeline";
import TasksForToday from "@/components/TasksForToday";
import Goals from "@/components/Goals";
import ToDo from "@/components/ToDo";
import CycleTracker from "@/components/CycleTracker";
import CalendarEvents from "@/components/CalendarEvents";
import PullToRefresh from "@/components/PullToRefresh";

function HomeContent() {
  const searchParams = useSearchParams();
  const mobileTab = searchParams.get("tab") || "today";

  const handleRefresh = async () => {
    // Trigger a window reload to refresh all data 
    window.dispatchEvent(new Event("tasks-updated"));
    // Small delay for visual feedback
    await new Promise((r) => setTimeout(r, 800));
  };

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen pb-mobile-nav md:pb-0 relative z-10 w-full overflow-hidden">
        <LiveHeader />

        <PullToRefresh onRefresh={handleRefresh}>
          <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 w-full custom-scrollbar">

            {/* ─── DESKTOP: Full layout (unchanged) ─── */}
            <div className="hidden md:block">
              <CycleTracker />

              <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[1.2fr_1.5fr] gap-8 max-w-7xl mx-auto h-full items-start">
                {/* Left Column: Timeline and Tasks */}
                <div className="flex flex-col gap-6">
                  <div className="h-[800px] lg:h-[calc(100vh-200px)] sticky top-4 mb-4">
                    <Timeline />
                  </div>
                  <TasksForToday />
                </div>

                {/* Right Column: Calendar + Goals + ToDo */}
                <div className="flex flex-col gap-12 pt-0 md:pt-4">
                  <CalendarEvents />
                  <div className="border-t border-sand/50 pt-12">
                    <Goals />
                  </div>
                  <div className="border-t border-sand/50 pt-12">
                    <ToDo />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── MOBILE: Tab-based sections ─── */}
            <div className="md:hidden">
              {mobileTab === "today" && (
                <>
                  <div className="mb-6">
                    <CycleTracker />
                  </div>
                  <div className="h-[calc(100vh-280px)] mb-6">
                    <Timeline />
                  </div>
                  <TasksForToday />
                  <div className="mt-8">
                    <CalendarEvents />
                  </div>
                </>
              )}

              {mobileTab === "cycle" && (
                <CycleTracker />
              )}

              {mobileTab === "todo" && (
                <>
                  <TasksForToday />
                  <div className="mt-8 border-t border-sand/50 pt-8">
                    <ToDo />
                  </div>
                </>
              )}

              {mobileTab === "goals" && (
                <Goals />
              )}
            </div>

          </div>
        </PullToRefresh>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-clay/30 border-t-clay rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
