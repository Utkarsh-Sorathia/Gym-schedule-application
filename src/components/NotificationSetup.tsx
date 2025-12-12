'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { showTestNotification } from '@/lib/notifications';

export default function NotificationSetup() {
    const {
        settings,
        permission,
        isSupported,
        enableNotifications,
        disableNotifications,
        updateNotificationTime,
    } = useNotifications();

    if (!isSupported) {
        return (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-600 dark:text-yellow-400">
                    ⚠️ Your browser doesn&apos;t support notifications
                </p>
            </div>
        );
    }

    const handleEnable = async () => {
        const success = await enableNotifications();
        if (!success) {
            alert('Please allow notifications in your browser settings');
        }
    };

    const handleTest = async () => {
        await showTestNotification();
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">🔔 Daily Gym Reminders</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Get motivated with daily workout reminders
                    </p>
                </div>

                {permission === 'granted' && (
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${settings.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                            {settings.enabled ? '✓ Enabled' : 'Disabled'}
                        </span>
                        <button
                            onClick={settings.enabled ? disableNotifications : handleEnable}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${settings.enabled
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-primary hover:bg-primary/90 text-white'
                                }`}
                        >
                            {settings.enabled ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                )}
            </div>

            {permission === 'default' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                        Enable notifications to receive daily gym reminders with motivational quotes!
                    </p>
                    <button
                        onClick={handleEnable}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Enable Notifications
                    </button>
                </div>
            )}

            {permission === 'denied' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        ❌ Notifications are blocked. Please enable them in your browser settings.
                    </p>
                </div>
            )}

            {permission === 'granted' && settings.enabled && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Reminder Time
                        </label>
                        <input
                            type="time"
                            value={settings.time}
                            onChange={(e) => updateNotificationTime(e.target.value)}
                            className="bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            You&apos;ll receive a reminder at this time every day
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleTest}
                            className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            🧪 Test Notification
                        </button>
                        {settings.lastNotified && (
                            <span className="text-xs text-muted-foreground self-center">
                                Last notified: {new Date(settings.lastNotified).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <p className="text-sm text-green-600 dark:text-green-400">
                            ✓ You&apos;ll receive a notification at {settings.time} with a motivational quote and today&apos;s workout!
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            💡 Tip: Keep this tab open or pinned for notifications to work
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
