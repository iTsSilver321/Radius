import { supabase } from "@/src/lib/supabase";
import { parseEWKB } from "../location/utils";
import { Item } from "./types";

export interface FeedFilters {
  searchQuery?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const fetchItems = async (filters: FeedFilters = {}) => {
  // Get current user to filter blocked content
  const { data: { session } } = await supabase.auth.getSession();
  let blockedUserIds: string[] = [];

  if (session?.user) {
    const { data } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', session.user.id);
    if (data) blockedUserIds = data.map(b => b.blocked_id);
  }

  let query = supabase
    .from("items")
    .select("*")
    .eq("status", "active")
    .order("is_boosted", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  
  if (blockedUserIds.length > 0) {
    query = query.not('owner_id', 'in', `(${blockedUserIds.join(',')})`);
  }

  if (filters.searchQuery) {
    query = query.ilike("title", `%${filters.searchQuery}%`);
  }

  if (filters.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item: any) => ({
    ...item,
    location: typeof item.location === 'string' ? parseEWKB(item.location) : item.location,
  })) as Item[];
};

export const fetchItemById = async (id: string): Promise<Item | null> => {
    const { data, error } = await supabase
        .from("items")
        .select(`
            *,
            profiles:owner_id (
                id,
                full_name,
                avatar_url,
                reputation
            )
        `)
        .eq("id", id)
        .single();

    if (error) throw error;

    return {
        ...data,
        location: typeof data.location === 'string' ? parseEWKB(data.location) : data.location,
        owner: data.profiles, // Map joined profile to owner
    } as Item;
};

export const updateItemStatus = async (id: string, status: 'active' | 'reserved' | 'sold') => {
    const { error } = await supabase
        .from('items')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
};

export const boostItem = async (id: string, durationHours: number = 24 * 7) => {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + durationHours);

    const { error } = await supabase
        .from('items')
        .update({ 
            is_boosted: true,
            boost_expiry: expiry.toISOString()
        })
        .eq('id', id);

    if (error) throw error;
};

export const fetchItemsByIds = async (ids: string[]) => {
    if (ids.length === 0) return [];

    const { data, error } = await supabase
        .from("items")
        .select("*")
        .in("id", ids);

    if (error) throw error;

    return data.map((item: any) => ({
        ...item,
        location: typeof item.location === 'string' ? parseEWKB(item.location) : item.location,
    })) as Item[];
};

export const deleteItem = async (id: string, userId: string) => {
    // 1. Check if user is owner
    const item = await fetchItemById(id);
    if (!item) throw new Error("Item not found");
    if (item.owner_id !== userId) throw new Error("Unauthorized to delete this item");

    // 2. Delete item
    const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", id);

    if (error) throw error;
};
