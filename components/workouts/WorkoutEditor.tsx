"use client";

import { useStore, WorkoutExercise } from "@/lib/store";
import { ArrowLeft, Play, Plus, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { useRef, useEffect } from "react";
import { WorkoutViewState } from "./WorkoutManager";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper component for Sortable Item rendering
function SortableExerciseItem({ 
  exercise, 
  updateExercise, 
  deleteExercise,
  handleImageUpload
}: { 
  exercise: WorkoutExercise;
  updateExercise: (id: string, updates: Partial<WorkoutExercise>) => void;
  deleteExercise: (id: string) => void;
  handleImageUpload: (id: string, file: File) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div ref={setNodeRef} style={style} className={`relative flex items-center mb-3 ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
      {/* Timeline connector line (hidden on the very bottom item via CSS if needed, but simple to just draw always and let spacing handle it) */}
      <div className="absolute left-6 top-10 bottom-[-1rem] w-0.5 bg-sand z-0" />
      
      <div className={`w-full relative z-10 flex border shadow-sm rounded-2xl overflow-hidden transition-all bg-white/80 backdrop-blur-sm ${
        exercise.type === 'break' ? 'border-lavender bg-[#f0ecf6]' : 'border-sand'
      }`}>
        
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="w-12 shrink-0 flex items-center justify-center bg-black/5 text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex items-center gap-3 w-full min-w-0">
          
          {exercise.type === 'exercise' ? (
             <>
               <div 
                  className="w-12 h-12 bg-sand rounded-xl shrink-0 border border-black/5 relative overflow-hidden group cursor-pointer flex items-center justify-center text-slate-400 hover:text-slate-600"
                  onClick={() => fileInputRef.current?.click()}
               >
                 {exercise.imageUrl ? (
                   <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-cover" />
                 ) : (
                   <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 )}
                 <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpload(exercise.id, e.target.files[0]);
                      }
                    }}
                 />
               </div>
               
               <div className="flex-1 min-w-0 flex flex-col gap-1">
                 <input 
                   type="text" 
                   value={exercise.name}
                   onChange={(e) => updateExercise(exercise.id, { name: e.target.value })}
                   className="font-serif text-lg text-slate-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-sage/50 rounded w-full p-0 py-0.5"
                   placeholder="Exercise Name"
                 />
                 <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-slate-600 font-medium">
                      <span>Reps</span>
                      <button onClick={() => updateExercise(exercise.id, { reps: Math.max(1, exercise.reps - 1) })} className="px-1 hover:text-terra">−</button>
                      <span className="w-4 text-center">{exercise.reps}</span>
                      <button onClick={() => updateExercise(exercise.id, { reps: exercise.reps + 1 })} className="px-1 hover:text-terra">+</button>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-slate-600 font-medium whitespace-nowrap overflow-hidden">
                      <span>{exercise.secondsPerRep ? 'Sec/Rep' : 'Add Timer'}</span>
                      {exercise.secondsPerRep !== null ? (
                        <>
                          <button onClick={() => updateExercise(exercise.id, { secondsPerRep: Math.max(0, (exercise.secondsPerRep || 0) - 1) })} className="px-1 hover:text-terra">−</button>
                          <span className="w-4 text-center">{exercise.secondsPerRep}</span>
                          <button onClick={() => updateExercise(exercise.id, { secondsPerRep: (exercise.secondsPerRep || 0) + 1 })} className="px-1 hover:text-terra">+</button>
                        </>
                      ) : (
                        <button onClick={() => updateExercise(exercise.id, { secondsPerRep: 5 })} className="text-sage px-1 hover:text-sage/80"><Plus className="w-3 h-3"/></button>
                      )}
                    </div>
                 </div>
               </div>
             </>
          ) : (
             <div className="flex-1 min-w-0 flex flex-col gap-1 py-1">
               <span className="font-serif text-lg text-[#7c6a96]">Rest Break</span>
               <div className="flex items-center gap-1.5 self-start bg-white/60 rounded-md px-2 py-1 text-slate-600 font-medium text-xs">
                  <span>Duration</span>
                  <button onClick={() => updateExercise(exercise.id, { secondsPerRep: Math.max(15, (exercise.secondsPerRep || 30) - 15) })} className="px-1 hover:text-[#7c6a96]">−</button>
                  <span className="w-8 text-center">{exercise.secondsPerRep}s</span>
                  <button onClick={() => updateExercise(exercise.id, { secondsPerRep: Math.min(300, (exercise.secondsPerRep || 30) + 15) })} className="px-1 hover:text-[#7c6a96]">+</button>
               </div>
             </div>
          )}

          <button 
             onClick={() => deleteExercise(exercise.id)}
             className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors shrink-0"
          >
             <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


export default function WorkoutEditor({ workoutId, onNavigate }: { workoutId: string, onNavigate: (view: WorkoutViewState, id?: string) => void }) {
  const { workouts, updateWorkout } = useStore();
  const workout = workouts.find((w) => w.id === workoutId);

  // DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent drag on simple clicks
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // If workout was deleted or not found, go back
  useEffect(() => {
    if (!workout) {
      onNavigate("LIBRARY");
    }
  }, [workout, onNavigate]);

  if (!workout) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = workout.exercises.findIndex((ex) => ex.id === active.id);
      const newIndex = workout.exercises.findIndex((ex) => ex.id === over.id);
      
      const newExercises = arrayMove(workout.exercises, oldIndex, newIndex);
      updateWorkout(workout.id, { exercises: newExercises });
    }
  };

  const addExercise = () => {
    const newEx: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      type: "exercise",
      name: "New Exercise",
      reps: workout.globalReps,
      secondsPerRep: null, // manual advance by default
      imageUrl: null,
    };
    updateWorkout(workout.id, { exercises: [...workout.exercises, newEx] });
  };

  const addBreak = () => {
    const newEx: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      type: "break",
      name: "Break",
      reps: 1,
      secondsPerRep: 30, // 30s break default
      imageUrl: null,
    };
    updateWorkout(workout.id, { exercises: [...workout.exercises, newEx] });
  };

  const updateExercise = (id: string, updates: Partial<WorkoutExercise>) => {
    updateWorkout(workout.id, {
      exercises: workout.exercises.map((ex) => ex.id === id ? { ...ex, ...updates } : ex)
    });
  };

  const deleteExercise = (id: string) => {
    updateWorkout(workout.id, {
      exercises: workout.exercises.filter((ex) => ex.id !== id)
    });
  };

  const handleImageUpload = (id: string, file: File) => {
    // 2MB limit warning
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is larger than 2MB. This might cause the app to slow down or fail to save. Please choose a smaller image.");
      // Still proceed, just warn. Base64 can bloat LocalStorage quickly.
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateExercise(id, { imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-linen -mx-4 -mt-6 px-4 pt-6 md:-mx-0 md:-mt-0 md:px-0 md:pt-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 bg-white/50 p-4 rounded-3xl border border-sand shadow-sm backdrop-blur-md sticky top-0 z-30">
        <button 
          onClick={() => onNavigate("LIBRARY")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-500 hover:text-slate-800 shadow-sm border border-sand transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <input 
            type="text"
            value={workout.name}
            onChange={(e) => updateWorkout(workout.id, { name: e.target.value })}
            className="w-full font-serif text-2xl text-slate-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-sage/50 rounded px-2 -ml-2 truncate"
          />
        </div>
        <button 
          onClick={() => onNavigate("PLAYER", workout.id)}
          disabled={workout.exercises.length === 0}
          className="hidden sm:flex items-center gap-2 bg-terra text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-terra/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
        >
          Start <Play className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Global Configuration */}
      <div className="flex gap-4 mb-8 bg-white/40 p-4 rounded-2xl border border-sand/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex-1 flex flex-col gap-1 items-center justify-center p-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Base Reps</span>
          <div className="flex items-center gap-3">
             <button onClick={() => updateWorkout(workout.id, { globalReps: Math.max(1, workout.globalReps - 1) })} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:text-terra border border-sand shadow-sm text-lg font-mono">−</button>
             <span className="font-serif text-2xl w-8 text-center text-slate-700">{workout.globalReps}</span>
             <button onClick={() => updateWorkout(workout.id, { globalReps: workout.globalReps + 1 })} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:text-terra border border-sand shadow-sm text-lg font-mono">+</button>
          </div>
        </div>
        <div className="w-px bg-sand/80 my-2" />
        <div className="flex-1 flex flex-col gap-1 items-center justify-center p-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sets (Rounds)</span>
          <div className="flex items-center gap-3">
             <button onClick={() => updateWorkout(workout.id, { setRepeats: Math.max(1, workout.setRepeats - 1) })} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:text-terra border border-sand shadow-sm text-lg font-mono">−</button>
             <span className="font-serif text-2xl w-8 text-center text-slate-700">{workout.setRepeats}</span>
             <button onClick={() => updateWorkout(workout.id, { setRepeats: Math.min(10, workout.setRepeats + 1) })} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:text-terra border border-sand shadow-sm text-lg font-mono">+</button>
          </div>
        </div>
      </div>

      {/* Editable Timeline */}
      <div className="flex-1 overflow-visible relative px-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={workout.exercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
            {workout.exercises.map((exercise) => (
              <SortableExerciseItem 
                key={exercise.id} 
                exercise={exercise} 
                updateExercise={updateExercise}
                deleteExercise={deleteExercise}
                handleImageUpload={handleImageUpload}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add Buttons */}
        <div className="pl-16 pt-2 pb-24 flex flex-col gap-3 relative z-10">
          <button 
             onClick={addExercise}
             className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-terra transition-colors self-start bg-white/50 px-4 py-2 rounded-xl shadow-sm border border-transparent hover:border-sand"
          >
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
          <button 
             onClick={addBreak}
             className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-[#7c6a96] transition-colors self-start bg-white/30 px-4 py-2 rounded-xl border border-transparent hover:border-sand"
          >
            <Plus className="w-4 h-4" /> Add Break
          </button>
        </div>
      </div>

      {/* Floating Mobile Start Button */}
      <button
        onClick={() => onNavigate("PLAYER", workout.id)}
        disabled={workout.exercises.length === 0}
        className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-terra text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-terra/90 flex items-center gap-2 shadow-[0_4px_20px_rgba(217,128,100,0.4)] disabled:opacity-50 transition-all mb-[80px]"
      >
        <Play className="w-5 h-5 fill-current" />
        Start Workout
      </button>

    </div>
  );
}
