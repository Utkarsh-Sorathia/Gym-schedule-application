import { startNotificationCron } from '@/lib/cron';

// Start the cron job when the server starts
if (typeof window === 'undefined') {
    // Only run on server-side
    startNotificationCron();
}

export function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        startNotificationCron();
    }
}
