// Service Worker for Push Notifications
// This file handles push events and displays notifications

// Listen for push events
self.addEventListener('push', function (event) {
    console.log('Push event received:', event);

    let notificationData = {
        title: 'Pregnancy Assistant',
        body: 'You have a new notification',
        icon: '/logo192.png',
        badge: '/badge-72x72.png',
        data: {}
    };

    // Parse notification data from push event
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                title: data.title || notificationData.title,
                body: data.body || notificationData.body,
                icon: data.icon || notificationData.icon,
                badge: data.badge || notificationData.badge,
                data: data.data || {},
                tag: data.tag || 'pregnancy-assistant',
                requireInteraction: data.requireInteraction || false,
                vibrate: data.vibrate || [200, 100, 200]
            };
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }

    // Show notification
    const promiseChain = self.registration.showNotification(
        notificationData.title,
        {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            data: notificationData.data,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            vibrate: notificationData.vibrate,
            actions: [
                {
                    action: 'open',
                    title: 'פתח',
                    icon: '/icons/open.png'
                },
                {
                    action: 'close',
                    title: 'סגור',
                    icon: '/icons/close.png'
                }
            ]
        }
    );

    event.waitUntil(promiseChain);
});

// Handle notification click events
self.addEventListener('notificationclick', function (event) {
    console.log('Notification clicked:', event);

    event.notification.close();

    // Handle different actions
    if (event.action === 'close') {
        return;
    }

    // Determine URL to open based on notification data
    let urlToOpen = '/';

    if (event.notification.data && event.notification.data.url) {
        urlToOpen = event.notification.data.url;
    } else if (event.notification.data && event.notification.data.type) {
        // Route based on notification type
        switch (event.notification.data.type) {
            case 'checkup':
                urlToOpen = '/dashboard#appointments';
                break;
            case 'water':
                urlToOpen = '/dashboard#daily-log';
                break;
            case 'test':
                urlToOpen = '/dashboard#recommended-tests';
                break;
            default:
                urlToOpen = '/dashboard';
        }
    }

    // Open or focus the app window
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    })
        .then(function (windowClients) {
            // Check if there's already a window open
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }

            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        });

    event.waitUntil(promiseChain);
});

// Handle notification close events
self.addEventListener('notificationclose', function (event) {
    console.log('Notification closed:', event);

    // Optional: Send analytics or tracking data
    // You can track which notifications were dismissed
});

// Service Worker installation
self.addEventListener('install', function (event) {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', function (event) {
    console.log('Service Worker activating...');
    event.waitUntil(clients.claim());
});

// Handle background sync (optional - for offline support)
self.addEventListener('sync', function (event) {
    if (event.tag === 'sync-notifications') {
        event.waitUntil(syncNotifications());
    }
});

async function syncNotifications() {
    // Implement sync logic if needed
    console.log('Syncing notifications...');
}
