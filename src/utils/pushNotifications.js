/**
 * Push Notifications Utility Functions
 * Handles service worker registration, subscription, and notification permissions
 */

const VAPID_PUBLIC_KEY_ENDPOINT = '/api/notifications/vapid-public-key';
const SUBSCRIBE_ENDPOINT = '/api/notifications/subscribe';

/**
 * Convert VAPID public key from base64 string to Uint8Array
 * @param {string} base64String - VAPID public key in base64 format
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check if push notifications are supported in the browser
 * @returns {boolean}
 */
export function isPushNotificationSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Request notification permission from the user
 * @returns {Promise<NotificationPermission>}
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.error('This browser does not support notifications');
        return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
}

/**
 * Register service worker
 * @returns {Promise<ServiceWorkerRegistration>}
 */
export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        console.log('Service Worker registered successfully:', registration);
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
    }
}

/**
 * Subscribe user to push notifications
 * @param {number} userId - User ID to associate with subscription
 * @returns {Promise<PushSubscription>}
 */
export async function subscribeUserToPush(userId) {
    try {
        // Check if notifications are supported
        if (!isPushNotificationSupported()) {
            throw new Error('Push notifications are not supported');
        }

        // Request permission
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
            throw new Error('Notification permission denied');
        }

        // Register service worker
        const registration = await registerServiceWorker();

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        // Get VAPID public key from backend
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${VAPID_PUBLIC_KEY_ENDPOINT}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch VAPID key: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const publicKey = data.publicKey;

        if (!publicKey) {
            throw new Error('VAPID public key not found in response. Please check server configuration.');
        }

        console.log('VAPID public key received:', publicKey);

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        // Send subscription to backend
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${SUBSCRIBE_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscription,
                userId
            })
        });

        console.log('User subscribed to push notifications:', subscription);
        return subscription;

    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        throw error;
    }
}

/**
 * Unsubscribe user from push notifications
 * @param {number} userId - User ID
 * @returns {Promise<boolean>}
 */
export async function unsubscribeUserFromPush(userId) {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            // Unsubscribe from push manager
            await subscription.unsubscribe();

            // Remove subscription from backend
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/notifications/unsubscribe`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    userId
                })
            });

            console.log('User unsubscribed from push notifications');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        throw error;
    }
}

/**
 * Check if user is currently subscribed to push notifications
 * @returns {Promise<boolean>}
 */
export async function isUserSubscribed() {
    try {
        if (!isPushNotificationSupported()) {
            return false;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        return subscription !== null;
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false;
    }
}

/**
 * Get current push subscription
 * @returns {Promise<PushSubscription|null>}
 */
export async function getCurrentSubscription() {
    try {
        if (!isPushNotificationSupported()) {
            return null;
        }

        const registration = await navigator.serviceWorker.ready;
        return await registration.pushManager.getSubscription();
    } catch (error) {
        console.error('Error getting subscription:', error);
        return null;
    }
}

/**
 * Send a test notification (for development/testing)
 * @param {number} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @returns {Promise<void>}
 */
export async function sendTestNotification(userId, title = 'Test Notification', body = 'This is a test notification') {
    try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/notifications/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                title,
                body,
                icon: '/logo192.png'
            })
        });

        console.log('Test notification sent');
    } catch (error) {
        console.error('Error sending test notification:', error);
        throw error;
    }
}
