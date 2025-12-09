
import { supabase } from "@/src/lib/supabase";

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  item_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'disputed' | 'cancelled';
  stripe_payment_intent_id?: string;
  created_at: string;
  item?: {
    title: string;
    images: string[];
  };
}

export const createOrder = async (order: Omit<Order, "id" | "created_at" | "item">) => {
  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchUserOrders = async (userId: string, type: "buyer" | "seller") => {
  const column = type === "buyer" ? "buyer_id" : "seller_id";
  
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      item:items (
        title,
        images
      )
    `)
    .eq(column, userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Order[];
};
