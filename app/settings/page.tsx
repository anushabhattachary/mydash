"use client";

import { useStore } from "@/lib/store";
import { signIn, signOut, useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { Settings, User, AlertTriangle, Calendar, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { settings, setSettings, clearAllData } = useStore();
  const { data: session } = useSession();

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all your local dashboard data? This cannot be undone.")) {
      clearAllData();
      alert("Data cleared.");
    }
  };

  return (
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <main className="flex-1 flex flex-col min-h-screen pb-24 md:pb-0 z-10 w-full overflow-hidden">
            <header className="py-8 px-4 md:px-12 bg-white/40 backdrop-blur-md rounded-b-3xl shadow-sm border-b border-sand/50 mb-8 sticky top-0 z-50">
              <h1 className="text-4xl font-serif text-slate-800 flex items-center gap-3">
                 <Settings className="text-sage w-8 h-8" />
                 Settings
              </h1>
            </header>

            <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 w-full">
              <div className="max-w-3xl mx-auto flex flex-col gap-8">
                
                {/* Profile Section */}
                <section className="bg-white/60 backdrop-blur-sm border border-sand shadow-sm rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-sage/20 rounded-2xl text-sage"><User /></div>
                    <h2 className="text-xl font-serif text-slate-800">Profile Defaults</h2>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                       <label className="text-sm font-medium text-slate-500 uppercase tracking-widest">Display Name</label>
                       <input 
                         type="text" 
                         value={settings.name}
                         onChange={(e) => setSettings({ name: e.target.value })}
                         className="px-4 py-2 rounded-xl border border-sand bg-white/50 focus:outline-none focus:ring-2 focus:ring-sage/50"
                       />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-linen rounded-xl border border-sand/50">
                       <div>
                         <div className="font-medium text-slate-700">Recur Habits By Default</div>
                         <div className="text-sm text-slate-500">Automatically set new habits to repeat daily.</div>
                       </div>
                       <button 
                         onClick={() => setSettings({ recurByDefault: !settings.recurByDefault })}
                         className={`w-12 h-6 rounded-full transition-colors relative ${settings.recurByDefault ? 'bg-sage' : 'bg-slate-300'}`}
                       >
                         <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.recurByDefault ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>
                  </div>
                </section>

                {/* Integrations Section */}
                <section className="bg-white/60 backdrop-blur-sm border border-sand shadow-sm rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-clay/20 rounded-2xl text-clay"><Calendar /></div>
                    <h2 className="text-xl font-serif text-slate-800">Integrations</h2>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-linen rounded-xl border border-sand/50">
                     <div>
                       <div className="font-medium text-slate-700">Google Calendar</div>
                       <div className="text-sm text-slate-500">Sync your calendar events into the daily timeline.</div>
                     </div>
                     {session ? (
                       <div className="flex items-center gap-4">
                         <span className="text-sm text-slate-500">{session.user?.email}</span>
                         <button onClick={() => signOut()} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors">Disconnect</button>
                       </div>
                     ) : (
                       <button onClick={() => signIn("google")} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors">Connect</button>
                     )}
                  </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-red-50/50 border border-red-100 rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-100 text-red-500 rounded-2xl"><AlertTriangle /></div>
                    <h2 className="text-xl font-serif text-red-600">Danger Zone</h2>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-red-100">
                     <div>
                       <div className="font-medium text-red-600">Clear All Dashboard Data</div>
                       <div className="text-sm text-red-400">Permanently deletes UI layouts, habits, and goals from this browser.</div>
                     </div>
                     <button onClick={handleClearData} className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 rounded-xl font-medium transition-colors flex gap-2 items-center">
                        <Trash2 className="w-4 h-4" /> Clear Local Data
                     </button>
                  </div>
                </section>

              </div>
            </div>
          </main>
        </div>
  );
}
