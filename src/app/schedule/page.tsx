'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ISchedule, IExercise, ISet } from '@/models/Schedule';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MUSCLE_GROUPS: { [key: string]: string } = {
    'Monday': 'Chest & Triceps',
    'Tuesday': 'Back & Biceps',
    'Wednesday': 'Shoulders',
    'Thursday': 'Legs & Abs',
    'Friday': 'Biceps, Triceps & Forearms',
    'Saturday': 'Chest & Shoulders',
    'Sunday': 'Rest Day',
};

const WORKOUT_IMAGES: { [key: string]: string } = {
    'Monday': '/images/workouts/monday.avif',
    'Tuesday': '/images/workouts/tuesday.avif',
    'Wednesday': '/images/workouts/wednesday.avif',
    'Thursday': '/images/workouts/thursday.avif',
    'Friday': '/images/workouts/friday.avif',
    'Saturday': '/images/workouts/saturday.avif',
    'Sunday': '/images/workouts/sunday.avif',
};

function ScheduleContent() {
    const [schedules, setSchedules] = useState<ISchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(DAYS[0]);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Initial mount: Load from URL or LocalStorage
    useEffect(() => {
        const dayParam = searchParams.get('day');
        const saved = localStorage.getItem('selectedDay');
        
        let initialDay = '';
        if (dayParam && DAYS.includes(dayParam)) {
            initialDay = dayParam;
        } else if (saved && DAYS.includes(saved)) {
            initialDay = saved;
        } else {
            initialDay = DAYS[new Date().getDay()];
        }
        
        setSelectedDay(initialDay);
        setMounted(true);
    }, [searchParams]); // Run on mount and when searchParams change

    // 2. Sync from URL to State (handles browser back/forward)
    useEffect(() => {
        const dayParam = searchParams.get('day');
        if (dayParam && DAYS.includes(dayParam) && dayParam !== selectedDay) {
            setSelectedDay(dayParam);
        }
    }, [searchParams, selectedDay]); // Only run when URL or selectedDay changes

    // 3. Sync from State to URL & LocalStorage
    useEffect(() => {
        if (mounted && selectedDay) {
            localStorage.setItem('selectedDay', selectedDay);
            
            const params = new URLSearchParams(window.location.search);
            if (params.get('day') !== selectedDay) {
                params.set('day', selectedDay);
                router.replace(`/schedule?${params.toString()}`, { scroll: false });
            }
        }
    }, [selectedDay, mounted, router]); // Removed searchParams from dependencies


    const [exercises, setExercises] = useState<IExercise[]>([]);

    // Form state
    const [name, setName] = useState('');
    const [secondaryName, setSecondaryName] = useState('');
    const [isAlternative, setIsAlternative] = useState(false);
    const [activeFormTab, setActiveFormTab] = useState<'primary' | 'secondary'>('primary');
    
    const [formSets, setFormSets] = useState<ISet[]>([{ reps: 10, weight: 0 }]);
    const [weightType, setWeightType] = useState<'total' | 'per_side'>('total');
    
    const [secondaryFormSets, setSecondaryFormSets] = useState<ISet[]>([{ reps: 10, weight: 0 }]);
    const [secondaryWeightType, setSecondaryWeightType] = useState<'total' | 'per_side'>('total');
    
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        if (selectedDay) {
            fetchSchedules(selectedDay);
        }
    }, [selectedDay]);

    const fetchSchedules = async (dayToFetch: string) => {
        if (!dayToFetch) return;
        
        setLoading(true);
        try {
            // Use a fresh timestamp to bypass any potential caching
            const url = `/api/schedule?day=${dayToFetch}&t=${Date.now()}`;
            const res = await fetch(url);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (data.success) {
                const scheduleData = data.data || [];
                setSchedules(scheduleData);
                
                // Case-insensitive search to be extra safe
                const schedule = scheduleData.find((s: ISchedule) => 
                    s.day.toLowerCase() === dayToFetch.toLowerCase()
                );
                
                if (schedule) {
                    setExercises(schedule.exercises || []);
                } else {
                    setExercises([]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch schedules', error);
            // Don't clear exercises on error to avoid flickering, 
            // but maybe show a toast or error state if needed
        } finally {
            setLoading(false);
        }
    };

    const handleAddSet = () => {
        if (activeFormTab === 'primary') {
            setFormSets([...formSets, { reps: 10, weight: 0 }]);
        } else {
            setSecondaryFormSets([...secondaryFormSets, { reps: 10, weight: 0 }]);
        }
    };

    const handleRemoveSet = (index: number) => {
        if (activeFormTab === 'primary') {
            const newSets = formSets.filter((_, i) => i !== index);
            setFormSets(newSets);
        } else {
            const newSets = secondaryFormSets.filter((_, i) => i !== index);
            setSecondaryFormSets(newSets);
        }
    };

    const handleSetChange = (index: number, field: keyof ISet, value: number) => {
        if (activeFormTab === 'primary') {
            const newSets = [...formSets];
            newSets[index] = { ...newSets[index], [field]: value };
            setFormSets(newSets);
        } else {
            const newSets = [...secondaryFormSets];
            newSets[index] = { ...newSets[index], [field]: value };
            setSecondaryFormSets(newSets);
        }
    };

    const sanitizeExercises = (exercisesToSanitize: unknown[]): IExercise[] => {
        return exercisesToSanitize.map(ex => {
            // Type guard for legacy format
            if (typeof ex === 'object' && ex !== null && 'sets' in ex && typeof (ex as { sets: unknown }).sets === 'number') {
                const legacyEx = ex as { name: string; sets: number; reps?: number; weight?: number };
                const legacySets = legacyEx.sets;
                const legacyReps = legacyEx.reps || 10;
                const legacyWeight = legacyEx.weight || 0;

                // Convert to new format
                const newSets: ISet[] = Array(legacySets).fill({
                    reps: legacyReps,
                    weight: legacyWeight
                });

                return {
                    name: legacyEx.name,
                    sets: newSets
                };
            }
            // Already in new format, return as is
            return ex as IExercise;
        });
    };

    const handleSaveExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return; // Prevent saving while loading data
        const newExercise: IExercise = { 
            name, 
            secondaryName: isAlternative ? secondaryName : undefined,
            selectedExercise: editingIndex !== null ? exercises[editingIndex].selectedExercise : 'primary',
            sets: formSets, 
            weightType,
            secondarySets: isAlternative ? secondaryFormSets : undefined,
            secondaryWeightType: isAlternative ? secondaryWeightType : undefined
        };

        let updatedExercises = [...exercises];
        if (editingIndex !== null) {
            updatedExercises[editingIndex] = newExercise;
        } else {
            updatedExercises = [...exercises, newExercise];
        }

        const sanitizedExercises = sanitizeExercises(updatedExercises);

        try {
            const res = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ day: selectedDay, exercises: sanitizedExercises }),
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.success) {
                // Update local state
                const updatedSchedules = [...schedules];
                const index = updatedSchedules.findIndex(s => s.day === selectedDay);
                if (index !== -1) {
                    updatedSchedules[index] = data.data;
                } else {
                    updatedSchedules.push(data.data);
                }
                setSchedules(updatedSchedules);

                // Update exercises directly since we removed the useEffect
                const schedule = updatedSchedules.find(s => s.day === selectedDay);
                if (schedule) {
                    setExercises(schedule.exercises);
                }

                // Reset form
                setName('');
                setSecondaryName('');
                setIsAlternative(false);
                setActiveFormTab('primary');
                setFormSets([{ reps: 10, weight: 0 }]);
                setWeightType('total');
                setSecondaryFormSets([{ reps: 10, weight: 0 }]);
                setSecondaryWeightType('total');
                setEditingIndex(null);
            }
        } catch (error) {
            console.error('Failed to update schedule', error);
        }
    };

    const handleToggleExerciseSelection = async (exerciseIndex: number) => {
        const updatedExercises = [...exercises];
        const exercise = { ...updatedExercises[exerciseIndex] };
        
        if (exercise.secondaryName) {
            exercise.selectedExercise = exercise.selectedExercise === 'secondary' ? 'primary' : 'secondary';
            updatedExercises[exerciseIndex] = exercise;
            
            try {
                const res = await fetch('/api/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ day: selectedDay, exercises: updatedExercises }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setExercises(updatedExercises);
                    }
                }
            } catch (error) {
                console.error('Failed to toggle exercise selection', error);
            }
        }
    };

    const handleEditExercise = (index: number) => {
        const exercise = exercises[index];
        setName(exercise.name);
        setSecondaryName(exercise.secondaryName || '');
        setIsAlternative(!!exercise.secondaryName);
        setWeightType(exercise.weightType || 'total');
        
        // Handle legacy format or standard format for sets
        if (Array.isArray(exercise.sets)) {
            setFormSets([...exercise.sets]);
        } else {
            setFormSets([{ reps: 10, weight: 0 }]);
        }

        // Handle secondary sets
        if (exercise.secondarySets && Array.isArray(exercise.secondarySets)) {
            setSecondaryFormSets([...exercise.secondarySets]);
            setSecondaryWeightType(exercise.secondaryWeightType || 'total');
        } else {
            setSecondaryFormSets([{ reps: 10, weight: 0 }]);
            setSecondaryWeightType('total');
        }

        setEditingIndex(index);
        setActiveFormTab('primary');
    };

    const handleCancelEdit = () => {
        setName('');
        setSecondaryName('');
        setIsAlternative(false);
        setActiveFormTab('primary');
        setFormSets([{ reps: 10, weight: 0 }]);
        setWeightType('total');
        setSecondaryFormSets([{ reps: 10, weight: 0 }]);
        setSecondaryWeightType('total');
        setEditingIndex(null);
    };

    const handleDeleteExercise = async (indexToDelete: number) => {
        const updatedExercises = exercises.filter((_, index) => index !== indexToDelete);
        const sanitizedExercises = sanitizeExercises(updatedExercises);

        try {
            const res = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ day: selectedDay, exercises: sanitizedExercises }),
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.success) {
                // Update local state
                const updatedSchedules = [...schedules];
                const index = updatedSchedules.findIndex(s => s.day === selectedDay);
                if (index !== -1) {
                    updatedSchedules[index] = data.data;
                }
                setSchedules(updatedSchedules);

                // Update exercises directly
                const schedule = updatedSchedules.find(s => s.day === selectedDay);
                if (schedule) {
                    setExercises(schedule.exercises);
                }
            }
        } catch (error) {
            console.error('Failed to delete exercise', error);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Mobile Day Selection */}
            <div className="sm:hidden mb-6">
                <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="input-premium w-full bg-card"
                    aria-label="Select Day"
                >
                    {DAYS.map((day) => (
                        <option key={day} value={day}>
                            {day}
                        </option>
                    ))}
                </select>
            </div>

            {/* Desktop Day Selection */}
            <div className="hidden sm:flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <div className="flex space-x-2 p-1 bg-muted/50 rounded-xl">
                    {DAYS.map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedDay === day
                                ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Exercise List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hero Banner */}
                    <div className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden group shadow-2xl ring-1 ring-white/10">
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${WORKOUT_IMAGES[selectedDay]})` }}
                        />
                        {/* Enhanced Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-80" />
                        
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight drop-shadow-lg">
                                        {selectedDay}
                                        <span className={`block text-2xl md:text-3xl font-medium mt-1 ${selectedDay === 'Sunday' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                            {MUSCLE_GROUPS[selectedDay]}
                                        </span>
                                    </h1>
                                    <div className="flex items-center space-x-3 text-white/80">
                                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/10">
                                            {exercises.length} Exercises
                                        </span>
                                        {selectedDay === 'Sunday' && (
                                            <span className="bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/20 text-emerald-300">
                                                Recovery & Zen
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`card p-6 bg-card/50 backdrop-blur-sm ${selectedDay === 'Sunday' && exercises.length === 0 ? '' : 'min-h-[400px]'}`}>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : exercises.length === 0 ? (
                            selectedDay === 'Sunday' ? null : (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <p className="text-muted-foreground">No exercises added for this day.</p>
                                    <p className="text-sm text-muted-foreground/60 mt-1">Use the form to add your workout routine.</p>
                                </div>
                            )
                        ) : (
                            <ul className="space-y-3">
                                {exercises.map((exercise, index) => (
                                    <li key={index} className="group flex flex-col p-4 rounded-lg bg-background border border-border/50 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                {exercise.secondaryName ? (
                                                    <div className="flex items-center bg-muted/30 rounded-lg p-1">
                                                        <button
                                                            onClick={() => handleToggleExerciseSelection(index)}
                                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${exercise.selectedExercise === 'primary' || !exercise.selectedExercise
                                                                ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                                }`}
                                                        >
                                                            {exercise.name}
                                                        </button>
                                                        <span className="px-2 text-[10px] text-muted-foreground font-bold italic">OR</span>
                                                        <button
                                                            onClick={() => handleToggleExerciseSelection(index)}
                                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${exercise.selectedExercise === 'secondary'
                                                                ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                                }`}
                                                        >
                                                            {exercise.secondaryName}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <h3 className="font-medium text-foreground">{exercise.name}</h3>
                                                )}
                                            </div>
                                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEditExercise(index)}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                                                    title="Edit exercise"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExercise(index)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                                                    title="Remove exercise"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                            <div className="pl-12 space-y-2">
                                                {(() => {
                                                    const isSecondary = exercise.selectedExercise === 'secondary';
                                                    const currentSets = isSecondary && exercise.secondarySets ? exercise.secondarySets : exercise.sets;
                                                    const currentWeightType = isSecondary && exercise.secondaryWeightType ? exercise.secondaryWeightType : exercise.weightType;
                                                    
                                                    return Array.isArray(currentSets) ? (
                                                        currentSets.map((set, setIndex) => (
                                                                <div key={setIndex} className="flex items-center text-sm text-muted-foreground">
                                                                    <span className="w-16 font-medium text-xs uppercase tracking-wider text-muted-foreground/70">Set {setIndex + 1}</span>
                                                                    <div className="flex items-center space-x-3">
                                                                        <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{set.reps} reps</span>
                                                                        {(set.weight || 0) > 0 && (
                                                                            <>
                                                                                <span>@</span>
                                                                                <span className={`font-medium ${setIndex === currentSets.length - 1 ? 'text-red-500' : 'text-foreground'}`}>
                                                                                    {set.weight}kg
                                                                                    <span className={`text-[10px] ml-1.5 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold ${currentWeightType === 'per_side'
                                                                                        ? 'bg-blue-500/10 text-blue-500'
                                                                                        : 'bg-muted text-muted-foreground'
                                                                                        }`}>
                                                                                        {currentWeightType === 'per_side' ? 'Each' : 'Total'}
                                                                                    </span>
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-destructive">
                                                            Legacy data format. Please delete and recreate this exercise.
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Add Exercise Form */}
                <div className="lg:col-span-1">
                    {selectedDay === 'Sunday' ? (
                        <div className="card p-8 bg-card/50 backdrop-blur-sm sticky top-24 text-center border-emerald-500/20">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Rest Day</h3>
                            <p className="text-muted-foreground">
                                Today is rest day, rest well and eat proper protein.
                            </p>
                            <div className="mt-6 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 italic">
                                    &quot;Muscles are torn in the gym, fed in the kitchen, and built in bed.&quot;
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="card p-6 bg-card/50 backdrop-blur-sm sticky top-24">
                            <h3 className="text-lg font-bold text-foreground mb-4">
                                {editingIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
                            </h3>
                            <form onSubmit={handleSaveExercise} className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-medium text-muted-foreground">Exercise Name</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsAlternative(!isAlternative)}
                                            className={`text-xs font-medium transition-colors ${isAlternative ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                                        >
                                            {isAlternative ? '- Remove Alternative' : '+ Add Alternative'}
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            placeholder="e.g. Bench Press"
                                            className="input-premium"
                                        />
                                        {isAlternative && (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={secondaryName}
                                                    onChange={(e) => setSecondaryName(e.target.value)}
                                                    required={isAlternative}
                                                    placeholder="Alternative exercise"
                                                    className="input-premium bg-muted/30"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pointer-events-none">OR</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isAlternative && (
                                    <div className="flex bg-muted/30 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setActiveFormTab('primary')}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeFormTab === 'primary' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Primary: {name || 'Main'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveFormTab('secondary')}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeFormTab === 'secondary' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Alternative: {secondaryName || 'Alt'}
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                        Weight Type <span className="text-xs font-normal opacity-70">({activeFormTab === 'primary' ? 'Primary' : 'Alternative'})</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => activeFormTab === 'primary' ? setWeightType('total') : setSecondaryWeightType('total')}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${(activeFormTab === 'primary' ? weightType : secondaryWeightType) === 'total'
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                                }`}
                                        >
                                            Total Weight
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => activeFormTab === 'primary' ? setWeightType('per_side') : setSecondaryWeightType('per_side')}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${(activeFormTab === 'primary' ? weightType : secondaryWeightType) === 'per_side'
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                                }`}
                                        >
                                            Per Hand/Side
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-muted-foreground">
                                            Sets <span className="text-xs font-normal opacity-70">({activeFormTab === 'primary' ? 'Primary' : 'Alternative'})</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddSet}
                                            className="text-xs text-primary hover:text-primary/80 font-medium"
                                        >
                                            + Add Set
                                        </button>
                                    </div>

                                    {(activeFormTab === 'primary' ? formSets : secondaryFormSets).map((set, index) => (
                                        <div key={index} className="flex items-end space-x-2">
                                            <div className="flex-1">
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">Reps</label>
                                                <input
                                                    type="number"
                                                    value={set.reps}
                                                    onChange={(e) => handleSetChange(index, 'reps', Number(e.target.value))}
                                                    required
                                                    min="1"
                                                    className="input-premium text-center px-1"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">Kg</label>
                                                <input
                                                    type="number"
                                                    value={set.weight}
                                                    onChange={(e) => handleSetChange(index, 'weight', Number(e.target.value))}
                                                    min="0"
                                                    step="0.5"
                                                    className="input-premium text-center px-1"
                                                />
                                            </div>
                                            <div className="flex flex-col justify-end pb-1 space-y-1">
                                                {(activeFormTab === 'primary' ? formSets : secondaryFormSets).length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSet(index)}
                                                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                                        title="Remove set"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex space-x-3 mt-4">
                                    {editingIndex !== null && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="btn-secondary w-full"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                Processing...
                                            </div>
                                        ) : (
                                            editingIndex !== null ? 'Update Exercise' : 'Add to Schedule'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SchedulePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <ScheduleContent />
        </Suspense>
    );
}
