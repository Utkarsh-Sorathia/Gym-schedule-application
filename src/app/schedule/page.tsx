'use client';

import { useState, useEffect } from 'react';
import { ISchedule, IExercise, ISet } from '@/models/Schedule';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<ISchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(DAYS[0]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('selectedDay');
        if (saved && DAYS.includes(saved)) {
            setSelectedDay(saved);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('selectedDay', selectedDay);
        }
    }, [selectedDay, mounted]);


    const [exercises, setExercises] = useState<IExercise[]>([]);

    // Form state
    const [name, setName] = useState('');
    const [formSets, setFormSets] = useState<ISet[]>([{ reps: 10, weight: 0 }]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        if (selectedDay) {
            fetchSchedules(selectedDay);
        }
    }, [selectedDay]);

    const fetchSchedules = async (day?: string) => {
        setLoading(true);
        try {
            const url = day ? `/api/schedule?day=${day}` : '/api/schedule';
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.success) {
                setSchedules(data.data);
                const schedule = data.data.find((s: ISchedule) => s.day === day);
                setExercises(schedule ? schedule.exercises : []);
            }
        } catch (error) {
            console.error('Failed to fetch schedules', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSet = () => {
        setFormSets([...formSets, { reps: 10, weight: 0 }]);
    };

    const handleRemoveSet = (index: number) => {
        const newSets = formSets.filter((_, i) => i !== index);
        setFormSets(newSets);
    };

    const handleSetChange = (index: number, field: keyof ISet, value: number) => {
        const newSets = [...formSets];
        newSets[index] = { ...newSets[index], [field]: value };
        setFormSets(newSets);
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
        const newExercise: IExercise = { name, sets: formSets };

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
                setFormSets([{ reps: 10, weight: 0 }]);
                setEditingIndex(null);
            }
        } catch (error) {
            console.error('Failed to update schedule', error);
        }
    };

    const handleEditExercise = (index: number) => {
        const exercise = exercises[index];
        setName(exercise.name);

        // Handle legacy format or standard format for sets
        if (Array.isArray(exercise.sets)) {
            setFormSets([...exercise.sets]);
        } else {
            // Fallback for legacy data if needed, though sanitizeExercises handles this on save
            // This is just for display in form
            setFormSets([{ reps: 10, weight: 0 }]);
        }

        setEditingIndex(index);
    };

    const handleCancelEdit = () => {
        setName('');
        setFormSets([{ reps: 10, weight: 0 }]);
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
                    <div className="card p-6 bg-card/50 backdrop-blur-sm min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">{selectedDay}&apos;s Workout</h2>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                {exercises.length} Exercises
                            </span>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : exercises.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="text-muted-foreground">No exercises added for this day.</p>
                                <p className="text-sm text-muted-foreground/60 mt-1">Use the form to add your workout routine.</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {exercises.map((exercise, index) => (
                                    <li key={index} className="group flex flex-col p-4 rounded-lg bg-background border border-border/50 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <h3 className="font-medium text-foreground">{exercise.name}</h3>
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
                                            {Array.isArray(exercise.sets) ? (
                                                exercise.sets.map((set, setIndex) => (
                                                    <div key={setIndex} className="flex items-center text-sm text-muted-foreground">
                                                        <span className="w-16 font-medium text-xs uppercase tracking-wider text-muted-foreground/70">Set {setIndex + 1}</span>
                                                        <div className="flex items-center space-x-3">
                                                            <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{set.reps} reps</span>
                                                            {(set.weight || 0) > 0 && (
                                                                <>
                                                                    <span>@</span>
                                                                    <span className="font-medium text-foreground">{set.weight}kg</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-destructive">
                                                    Legacy data format. Please delete and recreate this exercise.
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Add Exercise Form */}
                <div className="lg:col-span-1">
                    <div className="card p-6 bg-card/50 backdrop-blur-sm sticky top-24">
                        <h3 className="text-lg font-bold text-foreground mb-4">
                            {editingIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
                        </h3>
                        <form onSubmit={handleSaveExercise} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Exercise Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="e.g. Bench Press"
                                    className="input-premium"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-muted-foreground">Sets</label>
                                    <button
                                        type="button"
                                        onClick={handleAddSet}
                                        className="text-xs text-primary hover:text-primary/80 font-medium"
                                    >
                                        + Add Set
                                    </button>
                                </div>

                                {formSets.map((set, index) => (
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
                                                className="input-premium text-center px-1"
                                            />
                                        </div>
                                        {formSets.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSet(index)}
                                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                                title="Remove set"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
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
                                    className="btn-primary w-full"
                                >
                                    {editingIndex !== null ? 'Update Exercise' : 'Add to Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
