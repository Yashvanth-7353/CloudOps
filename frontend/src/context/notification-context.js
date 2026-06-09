import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Notification Context
 * Manages toast notifications and alerts
 */
import { createContext, useContext, useCallback, useMemo, useState } from 'react';
const NotificationContext = createContext(undefined);
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const addNotification = useCallback((notification) => {
        const id = `${Date.now()}-${Math.random()}`;
        const newNotification = {
            ...notification,
            id,
            duration: notification.duration || 3000,
        };
        setNotifications((prev) => [...prev, newNotification]);
        // Auto-remove notification after duration
        if (newNotification.duration) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }
        return id;
    }, []);
    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);
    const value = useMemo(() => ({
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
    }), [notifications, addNotification, removeNotification, clearNotifications]);
    return _jsx(NotificationContext.Provider, { value: value, children: children });
};
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};
