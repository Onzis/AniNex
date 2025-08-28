"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { NotificationContainer } from "@/components/ui/notification";

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const { notifications, hideNotification } = useNotifications();

  return (
    <>
      {children}
      <NotificationContainer notifications={notifications} onClose={hideNotification} />
    </>
  );
}