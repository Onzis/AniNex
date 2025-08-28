"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, TriangleAlert, X } from "lucide-react";

interface NotificationProps {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: (id: string) => void;
}

export function Notification({ id, message, type, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Анимация появления
    setTimeout(() => setIsVisible(true), 10);
    
    // Автоматическое закрытие через 4.5 секунды
    const timer = setTimeout(() => {
      handleClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 500);
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: TriangleAlert,
  };

  const colors = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  };

  const borderColors = {
    success: "border-green-500/20",
    error: "border-red-500/20",
    info: "border-blue-500/20",
    warning: "border-yellow-500/20",
  };

  const Icon = icons[type];

  return (
    <div
      className={`
        fixed left-1/2 bottom-8 transform -translate-x-1/0 z-[99999]
        transition-all duration-500 ease-out pointer-events-none
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
      `}
    >
      <div
        className={`
          bg-black/80 backdrop-blur-md text-white px-6 py-4 rounded-xl
          shadow-lg border flex items-center gap-4 min-w-[300px] max-w-md
          pointer-events-auto ${borderColors[type]}
        `}
      >
        <Icon className={`h-6 w-6 flex-shrink-0 ${colors[type]}`} />
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="text-white/60 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface NotificationContainerProps {
  notifications: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>;
  onClose: (id: string) => void;
}

export function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  return (
    <div className="fixed left-1/2 bottom-8 transform -translate-x-1/2 z-[99999] flex flex-col gap-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={onClose}
        />
      ))}
    </div>
  );
}