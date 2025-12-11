'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    requestNotificationPermission,
    getNotificationSettings,
    saveNotificationSettings,
    shouldShowNotification,
    showGymNotification,
    type NotificationSettings,
} from '@/lib/notifications';

export function useNotifications() {
    const [settings, setSettings] = useState<NotificationSettings>({
        enabled: false,
        time: '18:30',
        lastNotified: null,
    });
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(true);

    // Load settings on mount
    useEffect(() => {
        setIsSupported('Notification' in window);
        if ('Notification' in window) {
            setPermission(Notification.permission);
            setSettings(getNotificationSettings());
        }
    }, []);

    // Check for notification time every minute
    useEffect(() => {
        if (!isSupported || !settings.enabled) return;

        const checkNotification = () => {
            if (shouldShowNotification(settings)) {
                showGymNotification();
                // Update settings to reflect notification was shown
                const updatedSettings = {
                    ...settings,
                    lastNotified: new Date().toISOString().split('T')[0],
                };
                setSettings(updatedSettings);
            }
        };

        // Check immediately
        checkNotification();

        // Then check every minute
        const interval = setInterval(checkNotification, 60000);

        return () => clearInterval(interval);
    }, [settings, isSupported]);

    const enableNotifications = useCallback(async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            const newSettings = { ...settings, enabled: true };
            setSettings(newSettings);
            saveNotificationSettings(newSettings);
            setPermission('granted');
            return true;
        }
        return false;
    }, [settings]);

    const disableNotifications = useCallback(() => {
        const newSettings = { ...settings, enabled: false };
        setSettings(newSettings);
        saveNotificationSettings(newSettings);
    }, [settings]);

    const updateNotificationTime = useCallback((time: string) => {
        const newSettings = { ...settings, time };
        setSettings(newSettings);
        saveNotificationSettings(newSettings);
    }, [settings]);

    return {
        settings,
        permission,
        isSupported,
        enableNotifications,
        disableNotifications,
        updateNotificationTime,
    };
}
