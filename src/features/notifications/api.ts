
import { supabase } from "@/src/lib/supabase";

export interface Notification {
  id: string;
  user_id: string;
  type: string; // 'message', 'price_drop', 'sold', 'system'
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const fetchNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((n: any) => ({
    ...n,
    message: n.content, // Map content to message
    title: n.type === 'message' ? 'New Message' : 
           n.type === 'price_drop' ? 'Price Drop' :
           n.type === 'sold' ? 'Item Sold' : 'Notification'
  })) as Notification[];
};

export const markAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
};
