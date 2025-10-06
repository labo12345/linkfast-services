import { supabase } from '@/integrations/supabase/client';

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function subscribeToPushNotifications(userId: string) {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.log('Notification permission denied');
      return;
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        )
      });

      console.log('Push subscription successful');
    }
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
  }
}

export function showLocalNotification(notification: PushNotification) {
  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/icon-192.png',
      tag: notification.tag,
      data: notification.data
    });
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Listen for notifications from real-time
export function setupNotificationListener(userId: string) {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const notification = payload.new as any;
        showLocalNotification({
          title: notification.title,
          body: notification.message,
          tag: notification.type,
          data: notification
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}