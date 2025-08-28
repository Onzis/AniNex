"use client";

import { useState, useCallback } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = "info") => {
    const id = Date.now().toString();
    const newNotification = { id, message, type };
    
    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, "success");
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, "error");
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification(message, "info");
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification(message, "warning");
  }, [showNotification]);

  return {
    notifications,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}