"use client";

import { useState } from "react";
import WorkoutLibrary from "./WorkoutLibrary";
import WorkoutEditor from "./WorkoutEditor";
import WorkoutPlayer from "./WorkoutPlayer";

export type WorkoutViewState = "LIBRARY" | "EDITOR" | "PLAYER";

export default function WorkoutManager() {
  const [view, setView] = useState<WorkoutViewState>("LIBRARY");
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  const navigateTo = (newView: WorkoutViewState, workoutId?: string) => {
    setView(newView);
    if (workoutId !== undefined) {
      setActiveWorkoutId(workoutId);
    }
  };

  return (
    <section className="flex flex-col gap-6 relative w-full h-full min-h-[400px]">
      {view === "LIBRARY" && (
        <WorkoutLibrary onNavigate={navigateTo} />
      )}
      {view === "EDITOR" && activeWorkoutId && (
        <WorkoutEditor workoutId={activeWorkoutId} onNavigate={navigateTo} />
      )}
      {view === "PLAYER" && activeWorkoutId && (
        <WorkoutPlayer workoutId={activeWorkoutId} onNavigate={navigateTo} />
      )}
    </section>
  );
}
