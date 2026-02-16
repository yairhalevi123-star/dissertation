import React, { useState, useEffect } from 'react';
import {
    isPushNotificationSupported,
    subscribeUserToPush,
    unsubscribeUserFromPush,
    isUserSubscribed,
    sendTestNotification
} from '../utils/pushNotifications';
import './NotificationSettings.css';

/**
 * NotificationSettings Component
 * Allows users to enable/disable push notifications
 */
function NotificationSettings({ userId }) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [permission, setPermission] = useState('default');

    useEffect(() => {
        checkNotificationStatus();
    }, []);

    const checkNotificationStatus = async () => {
        // Check if notifications are supported
        const supported = isPushNotificationSupported();
        setIsSupported(supported);

        if (!supported) {
            return;
        }

        // Check current permission status
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }

        // Check if user is subscribed
        const subscribed = await isUserSubscribed();
        setIsSubscribed(subscribed);
    };

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await subscribeUserToPush(userId);
            setIsSubscribed(true);
            setPermission('granted');
        } catch (err) {
            console.error('Error enabling notifications:', err);
            setError(err.message || 'שגיאה בהפעלת התראות');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisableNotifications = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await unsubscribeUserFromPush(userId);
            setIsSubscribed(false);
        } catch (err) {
            console.error('Error disabling notifications:', err);
            setError(err.message || 'שגיאה בביטול התראות');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestNotification = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await sendTestNotification(
                userId,
                '🔔 התראת בדיקה',
                'זו התראת בדיקה מאפליקציית ליווי ההריון'
            );
            alert('התראת בדיקה נשלחה!');
        } catch (err) {
            console.error('Error sending test notification:', err);
            setError(err.message || 'שגיאה בשליחת התראת בדיקה');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="notification-settings-card">
                <div className="notification-header">
                    <h3 className="notification-title">🔔 התראות</h3>
                </div>
                <div className="notification-body">
                    <p className="notification-unsupported">
                        הדפדפן שלך אינו תומך בהתראות דחיפה
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-settings-card">
            <div className="notification-header">
                <h3 className="notification-title">🔔 הגדרות התראות</h3>
                <div className={`notification-status ${isSubscribed ? 'active' : 'inactive'}`}>
                    {isSubscribed ? 'פעיל' : 'כבוי'}
                </div>
            </div>

            <div className="notification-body">
                <p className="notification-description">
                    קבלי תזכורות חשובות על בדיקות, פגישות ושתיית מים
                </p>

                {error && (
                    <div className="notification-error">
                        ⚠️ {error}
                    </div>
                )}

                {permission === 'denied' && (
                    <div className="notification-warning">
                        <p>🚫 הרשאות התראות נחסמו</p>
                        <p className="notification-help-text">
                            כדי להפעיל התראות, יש לאפשר אותן בהגדרות הדפדפן
                        </p>
                    </div>
                )}

                <div className="notification-actions">
                    {!isSubscribed ? (
                        <button
                            className="notification-btn enable-btn"
                            onClick={handleEnableNotifications}
                            disabled={isLoading || permission === 'denied'}
                        >
                            {isLoading ? 'מפעיל...' : '🔔 הפעל התראות'}
                        </button>
                    ) : (
                        <>
                            <button
                                className="notification-btn disable-btn"
                                onClick={handleDisableNotifications}
                                disabled={isLoading}
                            >
                                {isLoading ? 'מבטל...' : '🔕 בטל התראות'}
                            </button>
                            <button
                                className="notification-btn test-btn"
                                onClick={handleTestNotification}
                                disabled={isLoading}
                            >
                                {isLoading ? 'שולח...' : '📨 שלח התראת בדיקה'}
                            </button>
                        </>
                    )}
                </div>

                {isSubscribed && (
                    <div className="notification-info">
                        <h4>סוגי התראות:</h4>
                        <ul>
                            <li>📅 תזכורות לבדיקות ופגישות (יום לפני)</li>
                            <li>💧 תזכורות לשתיית מים (כל שעתיים)</li>
                            <li>📊 עדכונים על מעקב ההריון</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationSettings;
