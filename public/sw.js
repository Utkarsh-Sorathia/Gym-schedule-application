// Service Worker for Push Notifications
// Handles push events even when the app is closed
const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('push', function (event) {
    if (isDev) console.log('[Service Worker] Push event received');

    if (event.data) {
        try {
            const data = event.data.json();
            if (isDev) console.log('[Service Worker] Push data:', data);

            const options = {
                body: data.body || 'You have a new notification',
                icon: data.icon || '/icon.svg',
                badge: '/icon.svg',
                vibrate: [200, 100, 200],
                data: {
                    url: data.url || '/schedule',
                },
                requireInteraction: true, // Keep notification visible
                tag: 'gym-notification', // Replace previous notifications
            };

            event.waitUntil(
                self.registration.showNotification(data.title || 'Gym Schedule', options)
                    .then(() => {
                        if (isDev) console.log('[Service Worker] Notification shown successfully');
                    })
                    .catch(err => console.error('[Service Worker] Error showing notification:', err))
            );
        } catch (error) {
            console.error('[Service Worker] Error parsing push data:', error);
        }
    } else {
        if (isDev) console.warn('[Service Worker] Push event has no data');
    }
});

self.addEventListener('notificationclick', function (event) {
    if (isDev) console.log('[Service Worker] Notification click received');
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/schedule')
            .then(() => {
                if (isDev) console.log('[Service Worker] Window opened');
            })
            .catch(err => console.error('[Service Worker] Error opening window:', err))
    );
});

// Optional: Handle notification close event
self.addEventListener('notificationclose', function (event) {
    if (isDev) console.log('[Service Worker] Notification was closed', event.notification.tag);
});
