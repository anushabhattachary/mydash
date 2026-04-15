"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useUserProfile } from "@/lib/userProfile";
import { signIn, signOut, useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import LilacLoader from "@/components/LilacLoader";
import { Settings, User, AlertTriangle, Calendar, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { settings, setSettings, clearAllData } = useStore();
  const { profile, clearProfile } = useUserProfile();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Lilac is loading…");

  const handleDisconnectGoogle = async () => {
    setLoading(true);
    setLoadingMessage("Disconnecting Google Calendar…");
    try {
      await signOut({ redirect: false });
    } catch (e) {
      console.error("Error signing out", e);
    } finally {
      // Small delay for UX so it doesn't flash too fast
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all your local data? This will sign you out of Google, delete all tasks, habits, goals, and reset your profile. This cannot be undone.")) {
      return;
    }

    setLoading(true);
    setLoadingMessage("Clearing all data…");

    try {
      // 1. Sign out of Google if authenticated
      if (session) {
        await signOut({ redirect: false });
      }

      // 2. Clear all store data (habits, goals, todos, settings + localStorage keys)
      clearAllData();

      // 3. Clear user profile (triggers onboarding on next load)
      clearProfile();

      // Small delay for UX
      await new Promise((r) => setTimeout(r, 600));
    } catch (e) {
      console.error("Error clearing data", e);
    } finally {
      setLoading(false);
      // Redirect to home — onboarding will trigger since profile is cleared
      window.location.href = "/";
    }
  };

  // Sync display name: use profile name if settings name is empty
  const displayName = settings.name || profile?.name || "";

  return (
    <>
      <LilacLoader show={loading} message={loadingMessage} />
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
              <section className="bg-white/60 backdrop-blur-sm border border-sand shadow-sm rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-sage/20 rounded-2xl text-sage"><User /></div>
                  <h2 className="text-xl font-serif text-slate-800">Profile Defaults</h2>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-medium text-slate-500 uppercase tracking-widest">Display Name</label>
                     <input 
                       type="text" 
                       value={displayName}
                       onChange={(e) => setSettings({ name: e.target.value })}
                       placeholder="Your name"
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
                       className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${settings.recurByDefault ? 'bg-sage' : 'bg-slate-300'}`}
                     >
                       <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.recurByDefault ? 'left-7' : 'left-1'}`} />
                     </button>
                  </div>
                </div>
              </section>

              {/* Integrations Section */}
              <section className="bg-white/60 backdrop-blur-sm border border-sand shadow-sm rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-clay/20 rounded-2xl text-clay"><Calendar /></div>
                  <h2 className="text-xl font-serif text-slate-800">Integrations & App</h2>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-linen rounded-xl border border-sand/50">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-700">Google Calendar</div>
                      <div className="text-sm text-slate-500">Sync your calendar events into the daily timeline.</div>
                    </div>
                    {session ? (
                      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full sm:w-auto overflow-hidden">
                        <span className="text-sm text-slate-500 truncate max-w-full sm:max-w-[150px] md:max-w-[200px]">{session.user?.email}</span>
                        <button 
                          onClick={handleDisconnectGoogle} 
                          className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors flex-shrink-0 whitespace-nowrap w-full sm:w-auto text-center"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => signIn("google")} 
                        className="px-4 py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors flex-shrink-0 w-full md:w-auto text-center"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                  
                  <div className="md:hidden flex flex-col items-start gap-4 p-4 bg-linen rounded-xl border border-sand/50">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-700">Install Lilac App</div>
                      <div className="text-sm text-slate-500 mt-1">Add Lilac to your homescreen for a faster full-screen experience and offline support.</div>
                    </div>
                    <button 
                      onClick={() => window.dispatchEvent(new Event("show-install-prompt"))} 
                      className="px-4 py-2 bg-terra text-white rounded-xl font-medium hover:bg-orange-700 transition-colors flex-shrink-0 w-full text-center"
                    >
                      Add to Homescreen
                    </button>
                  </div>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="bg-red-50/50 border border-red-100 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-100 text-red-500 rounded-2xl"><AlertTriangle /></div>
                  <h2 className="text-xl font-serif text-red-600">Danger Zone</h2>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white/50 rounded-xl border border-red-100">
                   <div className="min-w-0 flex-1">
                     <div className="font-medium text-red-600">Clear All Dashboard Data</div>
                     <div className="text-sm text-red-400">Permanently deletes all data, disconnects Google, and resets your profile.</div>
                   </div>
                   <button 
                     onClick={handleClearData} 
                     className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 rounded-xl font-medium transition-colors flex gap-2 items-center flex-shrink-0 whitespace-nowrap w-full md:w-auto justify-center"
                   >
                      <Trash2 className="w-4 h-4" /> Clear Local Data
                   </button>
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
