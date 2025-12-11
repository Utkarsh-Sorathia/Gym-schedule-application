import { getRandomQuote, getDayName } from './quotes';

export interface NotificationSettings {
    enabled: boolean;
    time: string; // Format: "HH:MM"
    lastNotified: string | null; // ISO date string
}

const STORAGE_KEY = 'gym-notification-settings';
const DEFAULT_TIME = '18:30'; // 6:30 PM

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

// Get notification settings from localStorage
export function getNotificationSettings(): NotificationSettings {
    if (typeof window === 'undefined') return { enabled: false, time: DEFAULT_TIME, lastNotified: null };

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }

    return {
        enabled: false,
        time: DEFAULT_TIME,
        lastNotified: null,
    };
}

// Save notification settings to localStorage
export function saveNotificationSettings(settings: NotificationSettings): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// Check if we should show notification now
export function shouldShowNotification(settings: NotificationSettings): boolean {
    if (!settings.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Check if current time matches notification time
    if (currentTime !== settings.time) return false;

    // Check if we already notified today
    const today = now.toISOString().split('T')[0];
    if (settings.lastNotified === today) return false;

    return true;
}

// Fetch today's workout schedule
async function getTodaysWorkout(): Promise<string> {
    try {
        const day = getDayName();
        const response = await fetch(`/api/schedule?day=${day}`);
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            const exercises = data.data[0].exercises;
            if (exercises && exercises.length > 0) {
                const exerciseList = exercises.slice(0, 3).map((ex: any) => ex.name).join(', ');
                return `Today's workout: ${exerciseList}${exercises.length > 3 ? '...' : ''}`;
            }
        }

        return "Check your schedule for today's workout!";
    } catch (error) {
        console.error('Error fetching workout:', error);
        return "Time to hit the gym!";
    }
}

// Show the notification
export async function showGymNotification(): Promise<void> {
    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
    }

    const day = getDayName();
    const quote = getRandomQuote();
    const workout = await getTodaysWorkout();

    const notification = new Notification(`🏋️ Time for Gym - ${day}'s Workout!`, {
        body: `${quote}\n\n${workout}`,
        icon: '/icons/icon-192x192.png', // You can add a gym icon here
        badge: '/icons/icon-192x192.png',
        tag: 'gym-reminder',
        requireInteraction: true,
    });

    notification.onclick = () => {
        window.focus();
        window.location.href = '/schedule';
        notification.close();
    };

    // Update last notified date
    const settings = getNotificationSettings();
    settings.lastNotified = new Date().toISOString().split('T')[0];
    saveNotificationSettings(settings);
}

// Test notification (for immediate testing)
export async function showTestNotification(): Promise<void> {
    if (Notification.permission !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) return;
    }

    const day = getDayName();
    const quote = getRandomQuote();

    const notification = new Notification(`🏋️ Test - ${day}'s Workout Reminder!`, {
        body: `${quote}\n\nThis is a test notification. Your daily reminder will appear at your scheduled time.`,
        icon: '/icons/icon-192x192.png',
        tag: 'gym-test',
        requireInteraction: false,
    });

    notification.onclick = () => {
        window.focus();
        notification.close();
    };
}
