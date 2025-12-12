"use client";

import * as React from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationMenu() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    const {
        isSubscribed,
        subscribeToPush,
        unsubscribeFromPush,
        sendTestNotification,
    } = usePushNotifications();

    // Close menu when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubscribe = async () => {
        setIsLoading(true);
        const success = await subscribeToPush('18:30'); // Fixed time: 6:30 PM IST
        setIsLoading(false);

        if (!success) {
            alert("Please allow notifications in your browser settings");
        }
    };

    const handleUnsubscribe = async () => {
        setIsLoading(true);
        await unsubscribeFromPush();
        setIsLoading(false);
    };

    const handleTest = async () => {
        setIsLoading(true);
        await sendTestNotification();
        setIsLoading(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors relative"
                aria-label="Notifications"
            >
                <span className="sr-only">Notifications</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {isSubscribed && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-background" />
                )}
            </button>

            {isOpen && (
                <div className="fixed left-4 right-4 top-[4.5rem] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 bg-card border border-border rounded-xl shadow-lg p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">Push Notifications</h3>
                        {isSubscribed && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                                Active
                            </span>
                        )}
                    </div>

                    {!isSubscribed ? (
                        <div className="space-y-3">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                                    Get daily gym reminders even when the app is closed!
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    📅 Daily notifications at <strong>6:30 PM IST</strong>
                                </p>
                            </div>

                            <button
                                onClick={handleSubscribe}
                                disabled={isLoading}
                                className="w-full bg-primary text-primary-foreground text-sm py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? '⏳ Subscribing...' : '🔔 Enable Notifications'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    ✅ You&apos;re subscribed!
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Daily reminder at <strong>6:30 PM IST</strong>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleTest}
                                    disabled={isLoading}
                                    className="bg-secondary text-secondary-foreground text-xs py-1.5 rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
                                >
                                    Test
                                </button>
                                <button
                                    onClick={handleUnsubscribe}
                                    disabled={isLoading}
                                    className="bg-red-500/10 text-red-600 dark:text-red-400 text-xs py-1.5 rounded-md hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                >
                                    Unsubscribe
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
