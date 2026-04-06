import Sidebar from "@/components/Sidebar";
import LiveHeader from "@/components/LiveHeader";
import Timeline from "@/components/Timeline";
import Goals from "@/components/Goals";
import ToDo from "@/components/ToDo";

export default function Home() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen pb-24 md:pb-0 relative z-10 w-full overflow-hidden">
        <LiveHeader />
        
        <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 w-full custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[1.2fr_1.5fr] gap-8 max-w-7xl mx-auto h-full items-start">
            
            {/* Left Column: Timeline */}
            <div className="h-[800px] lg:h-[calc(100vh-200px)] sticky top-4">
              <Timeline />
            </div>

            {/* Right Column: Goals + ToDo */}
            <div className="flex flex-col gap-12 pt-0 md:pt-4">
              <Goals />
              <div className="border-t border-sand/50 pt-12">
                <ToDo />
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
