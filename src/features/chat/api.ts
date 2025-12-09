
import { supabase } from "@/src/lib/supabase";

export interface ChatRoom {
  id: string;
  updated_at: string;
  item_id: string;
  buyer_id: string;
  seller_id: string;
  item?: {
    id: string;
    title: string;
    image_url: string;
    price: number;
    owner_id: string;
  };
  other_user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
  };
}

export const fetchRooms = async (userId: string) => {
  // Fetch rooms where user is buyer OR seller
  const { data, error } = await supabase
    .from("rooms")
    .select(`
      *,
      item:items (
        id, title, image_url, price, owner_id
      ),
      buyer:profiles!rooms_buyer_id_fkey (id, full_name, avatar_url),
      seller:profiles!rooms_seller_id_fkey (id, full_name, avatar_url),
      messages (
        content,
        created_at,
        sender_id,
        read_at
      )
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return data.map((room: any) => {
    const isBuyer = room.buyer_id === userId;
    const otherUser = isBuyer ? room.seller : room.buyer;
    
    // Get latest message
    const sortedMessages = room.messages?.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastMessage = sortedMessages?.[0];

    return {
      ...room,
      other_user: otherUser,
      last_message: lastMessage ? {
        ...lastMessage,
        is_read: !!lastMessage.read_at
      } : undefined,
    };
  }) as ChatRoom[];
};

export const createRoom = async (itemId: string, buyerId: string, sellerId: string) => {
  // Check if room exists
  const { data: existingRoom } = await supabase
    .from("rooms")
    .select("*")
    .eq("item_id", itemId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .single();

  if (existingRoom) return existingRoom;

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      item_id: itemId,
      buyer_id: buyerId,
      seller_id: sellerId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchMessages = async (roomId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

export const sendMessage = async (roomId: string, senderId: string, content: string) => {
  const { error } = await supabase
    .from("messages")
    .insert({
      room_id: roomId,
      sender_id: senderId,
      content,
    });

  if (error) throw error;

  // Update room updated_at
  await supabase
    .from("rooms")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", roomId);
};
