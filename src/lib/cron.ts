import cron from 'node-cron';

// Cron schedule for daily gym notifications
// Runs every 30 minutes to check for users who should receive notifications
// Format: minute hour day month weekday
const CRON_SCHEDULE = process.env.NOTIFICATION_CRON_SCHEDULE || '*/30 * * * *';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

let cronJob: ReturnType<typeof cron.schedule> | null = null;

export function startNotificationCron() {
    if (cronJob) {
        console.log('📅 Notification cron job already running');
        return;
    }

    if (!CRON_SECRET) {
        console.warn('⚠️  CRON_SECRET not set. Notification cron will not start.');
        return;
    }

    console.log(`📅 Starting notification cron with schedule: ${CRON_SCHEDULE}`);

    cronJob = cron.schedule(CRON_SCHEDULE, async () => {
        console.log('🔔 Running scheduled notification job...');

        try {
            const url = `${BASE_URL}/api/notifications/cron`;
            console.log(`📡 Fetching: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${CRON_SECRET}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log(`📊 Response status: ${response.status} ${response.statusText}`);
            console.log(`📋 Response content-type: ${response.headers.get('content-type')}`);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ Received non-JSON response:', text.substring(0, 200));
                return;
            }

            const data = await response.json();

            if (response.ok) {
                console.log('✅ Notifications sent:', data.message);
            } else {
                console.error('❌ Failed to send notifications:', data.error);
            }
        } catch (error) {
            console.error('❌ Error triggering notifications:', error);
        }
    }, {
        timezone: 'UTC' // Cron runs in UTC, schedule should be in UTC
    });

    console.log('✅ Notification cron job started successfully');
}

export function stopNotificationCron() {
    if (cronJob) {
        cronJob.stop();
        cronJob = null;
        console.log('🛑 Notification cron job stopped');
    }
}
