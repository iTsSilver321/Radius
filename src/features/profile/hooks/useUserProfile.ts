import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";
import { Profile } from "../api"; // Assuming api.ts exists or we define it

export function useUserProfile(userId?: string) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (profileError) throw profileError;

            // Fetch actual item counts
            const { count: listedCount, error: listedError } = await supabase
                .from("items")
                .select("*", { count: 'exact', head: true })
                .eq("owner_id", userId)
                .neq("status", "sold"); // Count active and reserved as listed

             const { count: soldCount, error: soldError } = await supabase
                .from("items")
                .select("*", { count: 'exact', head: true })
                .eq("owner_id", userId)
                .eq("status", "sold");

            setProfile({
                ...profileData,
                items_listed: listedCount || 0,
                items_sold: soldCount || 0,
            });
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    return { profile, loading, error, refetch: fetchProfile };
}
