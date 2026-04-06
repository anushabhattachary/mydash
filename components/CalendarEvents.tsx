"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, LogIn, LogOut, MapPin, ExternalLink, RefreshCw, CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
  colorId: string;
  link: string;
  isAllDay: boolean;
}

// Google Calendar color IDs mapped to pleasant colors matching the dashboard theme
const eventColors: Record<string, { bg: string; text: string; border: string }> = {
  "0": { bg: "bg-clay/20", text: "text-clay", border: "border-clay/30" },
  "1": { bg: "bg-[#7986cb]/20", text: "text-[#5c6bc0]", border: "border-[#7986cb]/30" },
  "2": { bg: "bg-sage/20", text: "text-sage", border: "border-sage/30" },
  "3": { bg: "bg-[#8e24aa]/15", text: "text-[#8e24aa]", border: "border-[#8e24aa]/20" },
  "4": { bg: "bg-terra/20", text: "text-terra", border: "border-terra/30" },
  "5": { bg: "bg-[#f4bf50]/20", text: "text-[#f09300]", border: "border-[#f4bf50]/30" },
  "6": { bg: "bg-[#e67c73]/15", text: "text-[#e67c73]", border: "border-[#e67c73]/30" },
  "7": { bg: "bg-[#039be5]/15", text: "text-[#039be5]", border: "border-[#039be5]/30" },
  "8": { bg: "bg-[#616161]/15", text: "text-[#616161]", border: "border-[#616161]/30" },
  "9": { bg: "bg-[#3f51b5]/15", text: "text-[#3f51b5]", border: "border-[#3f51b5]/30" },
  "10": { bg: "bg-sage/25", text: "text-[#0b8043]", border: "border-sage/40" },
  "11": { bg: "bg-terra/25", text: "text-terra", border: "border-terra/40" },
};

function getEventColor(colorId: string) {
  return eventColors[colorId] || eventColors["0"];
}

function formatEventTime(dateTimeStr: string) {
  try {
    return format(parseISO(dateTimeStr), "h:mm a");
  } catch {
    return "";
  }
}

export default function CalendarEvents() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch events");
      }
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchEvents();
    }
  }, [status]);

  // Not signed in
  if (status === "unauthenticated") {
    return (
      <section className="bg-white/40 backdrop-blur-md rounded-3xl border border-sand shadow-sm overflow-hidden">
        <div className="p-6 border-b border-sand/50 bg-white/60">
          <h2 className="text-2xl font-serif text-slate-800 flex items-center gap-3">
            <Calendar className="text-clay w-6 h-6" />
            Google Calendar
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-clay/10 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 text-clay" />
          </div>
          <p className="text-slate-500 mb-6 font-medium">
            Connect your Google Calendar to see today&apos;s events
          </p>
          <button
            onClick={() => signIn("google")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-clay text-white rounded-2xl font-medium hover:bg-terra transition-colors shadow-sm hover:shadow-md"
          >
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </button>
        </div>
      </section>
    );
  }

  // Loading session
  if (status === "loading") {
    return (
      <section className="bg-white/40 backdrop-blur-md rounded-3xl border border-sand shadow-sm overflow-hidden">
        <div className="p-6 border-b border-sand/50 bg-white/60">
          <h2 className="text-2xl font-serif text-slate-800 flex items-center gap-3">
            <Calendar className="text-clay w-6 h-6" />
            Google Calendar
          </h2>
        </div>
        <div className="p-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-clay/30 border-t-clay rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white/40 backdrop-blur-md rounded-3xl border border-sand shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-sand/50 bg-white/60 flex items-center justify-between">
        <h2 className="text-2xl font-serif text-slate-800 flex items-center gap-3">
          <Calendar className="text-clay w-6 h-6" />
          Today&apos;s Schedule
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-all disabled:opacity-50"
            title="Refresh events"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => signOut()}
            className="p-2 rounded-xl hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User info */}
      {session?.user && (
        <div className="px-6 py-3 bg-sage/10 border-b border-sand/30 flex items-center gap-3">
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              className="w-7 h-7 rounded-full ring-2 ring-white shadow-sm"
            />
          )}
          <span className="text-sm text-slate-500">
            {session.user.name || session.user.email}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {error && (
          <div className="p-4 bg-terra/10 border border-terra/20 rounded-2xl text-terra text-sm mb-3">
            {error}
            <button
              onClick={fetchEvents}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading && events.length === 0 && (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-clay/30 border-t-clay rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading events...</p>
          </div>
        )}

        {!loading && events.length === 0 && !error && (
          <div className="py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sage/15 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-sage" />
            </div>
            <p className="text-slate-400 text-sm font-medium">
              No events scheduled for today
            </p>
            <p className="text-slate-300 text-xs mt-1">
              Enjoy your free day ✨
            </p>
          </div>
        )}

        <AnimatePresence>
          {/* All-day events */}
          {events.filter((e) => e.isAllDay).length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                All Day
              </p>
              {events
                .filter((e) => e.isAllDay)
                .map((event, i) => {
                  const colors = getEventColor(event.colorId);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.05 }}
                      className={`${colors.bg} ${colors.border} border rounded-xl p-3 mb-2`}
                    >
                      <div className={`font-medium text-sm ${colors.text}`}>
                        {event.title}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
            </div>
          )}

          {/* Timed events */}
          {events
            .filter((e) => !e.isAllDay)
            .map((event, i) => {
              const colors = getEventColor(event.colorId);
              const startTime = formatEventTime(event.start);
              const endTime = formatEventTime(event.end);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.05 }}
                  className={`${colors.bg} ${colors.border} border rounded-xl p-3 mb-2 group hover:shadow-sm transition-all`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${colors.text} truncate`}>
                        {event.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {startTime} — {endTime}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-white/50 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        title="Open in Google Calendar"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
    </section>
  );
}
