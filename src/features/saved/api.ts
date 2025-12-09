import { supabase } from "@/src/lib/supabase";
import { Item } from "../feed/types";
import { parseEWKB } from "../location/utils";

export const saveItem = async (itemId: string, userId: string) => {
    const { error } = await supabase
        .from("saved_items")
        .insert({ item_id: itemId, user_id: userId });

    if (error) throw error;
};

export const unsaveItem = async (itemId: string, userId: string) => {
    const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("item_id", itemId)
        .eq("user_id", userId);

    if (error) throw error;
};

export const fetchSavedItemIds = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
        .from("saved_items")
        .select("item_id")
        .eq("user_id", userId);

    if (error) throw error;
    return data.map((row) => row.item_id);
};

export const fetchSavedItems = async (userId: string): Promise<Item[]> => {
    const { data, error } = await supabase
        .from("saved_items")
        .select(`
            item_id,
            items (
                *
            )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    // Extract items from the join and parse location
    return data.map((row: any) => {
        const item = row.items;
        return {
            ...item,
            location: typeof item.location === 'string' ? parseEWKB(item.location) : item.location,
        };
    }) as Item[];
};
