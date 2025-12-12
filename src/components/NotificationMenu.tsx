"use client";

import * as React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { showTestNotification } from "@/lib/notifications";

import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationMenu() {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const {
        settings,
        permission,
        isSupported,
        enableNotifications,
        disableNotifications,
        updateNotificationTime,
    } = useNotifications();

    const { subscribeToPush, sendTestNotification, isSubscribed } = usePushNotifications();

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

    const handleEnable = async () => {
        const success = await enableNotifications();
        if (success) {
            await subscribeToPush();
        } else {
            alert("Please allow notifications in your browser settings");
        }
    };

    if (!isSupported) return null;

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
                {settings.enabled && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
                )}
            </button>

            {isOpen && (
                <div className="fixed left-4 right-4 top-[4.5rem] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 bg-card border border-border rounded-xl shadow-lg p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">Notifications</h3>
                        {permission === "granted" && (
                            <button
                                onClick={settings.enabled ? disableNotifications : handleEnable}
                                className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${settings.enabled
                                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                    }`}
                            >
                                {settings.enabled ? "Disable" : "Enable"}
                            </button>
                        )}
                    </div>

                    {permission === "default" && (
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-2">
                            <p className="text-sm text-primary mb-2">
                                Enable daily gym reminders!
                            </p>
                            <button
                                onClick={handleEnable}
                                className="w-full bg-primary text-primary-foreground text-sm py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Enable Notifications
                            </button>
                        </div>
                    )}

                    {permission === "denied" && (
                        <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3">
                            <p className="text-sm text-destructive">
                                Notifications are blocked. Please enable them in your browser settings.
                            </p>
                        </div>
                    )}

                    {permission === "granted" && settings.enabled && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Reminder Time
                                </label>
                                <input
                                    type="time"
                                    value={settings.time}
                                    onChange={(e) => updateNotificationTime(e.target.value)}
                                    className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => showTestNotification()}
                                    className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground text-xs py-1.5 rounded-md hover:bg-secondary/80 transition-colors"
                                >
                                    Test Local
                                </button>
                                <button
                                    onClick={() => sendTestNotification()}
                                    className="flex items-center justify-center gap-2 bg-primary/10 text-primary text-xs py-1.5 rounded-md hover:bg-primary/20 transition-colors"
                                >
                                    Test Server
                                </button>
                            </div>

                            <p className="text-[10px] text-muted-foreground text-center">
                                You'll receive a quote & workout preview at {settings.time}
                            </p>

                            {isSubscribed && (
                                <p className="text-[10px] text-green-600 dark:text-green-400 text-center flex items-center justify-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Connected to Push Server
                                </p>
                            )}
                        </div>
                    )}

                    {permission === "granted" && !settings.enabled && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                            Notifications are currently disabled.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
