'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRandomQuote } from '@/lib/quotes';

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

export default function Home() {
    const [clientData, setClientData] = useState({
        mounted: false,
        quote: '',
        greeting: 'Welcome',
        today: ''
    });

    useEffect(() => {
        const currentDay = DAYS[new Date().getDay()];
        const hour = new Date().getHours();
        let greeting = 'Good Evening';
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 17) greeting = 'Good Afternoon';

        const timer = setTimeout(() => {
            setClientData({
                mounted: true,
                quote: getRandomQuote(),
                greeting,
                today: currentDay
            });
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    if (!clientData.mounted) return null;

    const { quote, greeting, today } = clientData;

    return (
        <div className="relative min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto lg:overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-4xl z-10 space-y-8 md:space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-2 md:space-y-4">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                        {greeting}, <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Champion</span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto italic font-light px-4">
                        &quot;{quote}&quot;
                    </p>
                </div>

                {/* Today's Mission Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-stretch px-2">
                    <Link 
                        href={`/schedule?day=${today}`} 
                        className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card hover:border-primary/50 transition-all duration-500 shadow-xl"
                    >
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                            style={{ backgroundImage: `url(${WORKOUT_IMAGES[today]})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        
                        <div className="relative p-6 md:p-8 h-full flex flex-col justify-end min-h-[240px] md:min-h-[300px]">
                            <div className="space-y-1 md:space-y-2">
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">Today&apos;s Mission</span>
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{today}</h2>
                                <p className="text-lg md:text-xl text-muted-foreground font-medium">
                                    {MUSCLE_GROUPS[today]}
                                </p>
                            </div>
                            <div className="mt-4 md:mt-6 flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform">
                                START WORKOUT 
                                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    <div className="grid grid-cols-1 gap-4">
                        <Link 
                            href="/notes"
                            className="group p-6 md:p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 md:mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-foreground">Quick Notes</h3>
                                <p className="text-muted-foreground text-xs md:text-sm mt-1">Track your thoughts and progress.</p>
                            </div>
                        </Link>

                        <div className="p-6 md:p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-16 h-16 md:w-24 md:h-24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg md:text-xl font-bold text-foreground">Consistency is Key</h3>
                                <p className="text-muted-foreground text-xs md:text-sm mt-1">You&apos;ve got this. One rep at a time.</p>
                            </div>
                            <div className="mt-4 h-1.5 md:h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[65%] rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Quote / Minimalist Touch */}
                <div className="text-center pt-4 md:pt-8 border-t border-border/20">
                    <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em]">
                        Push Your Limits • Stay Consistent • Achieve Greatness
                    </p>
                </div>
            </div>
        </div>
    );
}
