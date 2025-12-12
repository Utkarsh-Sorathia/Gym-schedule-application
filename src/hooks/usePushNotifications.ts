'use client';

import { useState, useEffect } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [notificationTime, setNotificationTime] = useState('18:30'); // Default time

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            // Register Service Worker
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    setRegistration(reg);
                    reg.pushManager.getSubscription().then(sub => {
                        if (sub) {
                            setSubscription(sub);
                            setIsSubscribed(true);
                        }
                    });
                })
                .catch(err => console.error('Service Worker registration failed', err));
        }
    }, []);

    const subscribeToPush = async (time: string = '18:30') => {
        if (!registration) {
            console.error('No Service Worker registration found');
            return false;
        }

        if (!VAPID_PUBLIC_KEY) {
            console.error('VAPID_PUBLIC_KEY is undefined. Check your .env.local file and restart the dev server.');
            alert('Configuration error: VAPID key not found. Please check the console.');
            return false;
        }

        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            setSubscription(sub);
            setIsSubscribed(true);
            setNotificationTime(time);

            // Send subscription to backend with notification time
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...sub.toJSON(),
                    notificationTime: time
                }),
            });

            return true;
        } catch (error) {
            console.error('Failed to subscribe to push notifications', error);
            return false;
        }
    };

    const unsubscribeFromPush = async () => {
        if (!subscription) return;

        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
        setNotificationTime('18:30'); // Reset to default
    };

    const updateNotificationTime = async (time: string) => {
        if (!subscription) {
            console.error('No active subscription to update');
            return false;
        }

        try {
            const response = await fetch('/api/notifications/update-time', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    notificationTime: time
                }),
            });

            if (response.ok) {
                setNotificationTime(time);
                return true;
            } else {
                console.error('Failed to update notification time');
                return false;
            }
        } catch (error) {
            console.error('Error updating notification time:', error);
            return false;
        }
    };

    const sendTestNotification = async () => {
        await fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
    };

    return {
        isSubscribed,
        subscribeToPush,
        unsubscribeFromPush,
        sendTestNotification,
        notificationTime,
        updateNotificationTime
    };
}
