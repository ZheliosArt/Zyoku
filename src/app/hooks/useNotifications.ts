"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  tipo: string;
  leido: boolean;
  emisor_id: string;
  created_at: string;
  emisor?: {
    username: string;
  };
}

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('notificaciones')
      .select(`
        *,
        emisor:Usuarios!emisor_id(username)
      `)
      .eq('receptor_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error al cargar notificaciones:", error.message);
    }

    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n: any) => !n.leido).length);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const channel = supabase
      .channel(`notifs-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `receptor_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAllAsRead = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('notificaciones')
      .update({ leido: true })
      .eq('receptor_id', userId)
      .eq('leido', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
      setUnreadCount(0);
    }
  };

  return { notifications, unreadCount, loading, markAllAsRead };
};
