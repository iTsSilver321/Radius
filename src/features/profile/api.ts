import { supabase } from "@/src/lib/supabase";
import { Item } from "../feed/types";

export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  reputation: number;
  is_verified?: boolean;
  rating?: number;
  reviews_count?: number;
  items_sold?: number;
  items_listed?: number;
  total_earnings?: number;
}

export const fetchUserItems = async (userId: string) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Item[];
};

export const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates });

  if (error) throw error;
};
