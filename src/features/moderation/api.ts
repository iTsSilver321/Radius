
import { supabase } from "@/src/lib/supabase";

export interface Report {
  id: string;
  reporter_id: string;
  target_id: string; // Item ID or Profile ID
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed'; // Default: pending
  created_at: string;
}

export const createReport = async (report: Omit<Report, "id" | "created_at" | "status">) => {
  const { data, error } = await supabase
    .from("reports")
    .insert(report)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const blockUser = async (blockerId: string, blockedId: string) => {
    const { error } = await supabase
        .from('blocks')
        .insert({ blocker_id: blockerId, blocked_id: blockedId });
    if (error) throw error;
};

export const unblockUser = async (blockerId: string, blockedId: string) => {
    const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId);
    if (error) throw error;
};

export const fetchBlockedUsers = async (userId: string) => {
    const { data, error } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', userId);
    
    if (error) throw error;
    return data.map((b) => b.blocked_id);
};

export const checkIfBlocked = async (blockerId: string, blockedId: string) => {
    const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"
    return !!data;
};

export const fetchBlockedProfiles = async (userId: string) => {
    const { data, error } = await supabase
        .from('blocks')
        .select(`
            blocked_id,
            profiles:blocked_id (
                id,
                full_name,
                avatar_url,
                reputation,
                username
            )
        `)
        .eq('blocker_id', userId);
    
    if (error) throw error;
    
    // Map to profile structure (flattening the joined data)
    return data.map((item: any) => ({
        ...item.profiles,
        id: item.blocked_id // User the blocked_id as the primary ID reference
    }));
};
