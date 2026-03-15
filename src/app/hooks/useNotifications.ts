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

  // LOG 1: Verificamos si el hook detecta al usuario
  console.log("useNotifications init, userId:", userId);

  const fetchNotifications = async () => {
    if (!userId) {
      console.log("fetchNotifications cancelado: no hay userId"); // LOG 2
      return;
    }

    console.log("Fetching notifications para el usuario:", userId); // LOG 3

    const { data, error } = await supabase
      .from('notificaciones')
      .select(`
        *,
        emisor:Usuarios!emisor_id(username) 
      `) // Corregido a "Usuarios" que es el nombre real de tu tabla
      .eq('receptor_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching notifs:", error); // LOG 4
    }

    if (data) {
      console.log("Fetch notifs EXITOSO, data:", data); // LOG 5
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n: any) => !n.leido).length);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    console.log("Configurando suscripción Realtime para:", userId); // LOG 6

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
        (payload) => {
          console.log("¡EVENTO REALTIME INSERT RECIBIDO!", payload); // LOG 7
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        console.log("Estado de la suscripción Realtime:", status); // LOG EXTRA
      });

    return () => {
      console.log("Removiendo canal Realtime"); // LOG 8
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