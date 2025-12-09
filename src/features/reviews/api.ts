import { supabase } from "@/src/lib/supabase";

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  item_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: {
    full_name: string;
    avatar_url: string;
  };
}

export const createReview = async (review: Omit<Review, "id" | "created_at" | "reviewer">) => {
  const { data, error } = await supabase
    .from("reviews")
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchUserReviews = async (userId: string) => {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviewer_id (
        full_name,
        avatar_url
      )
    `)
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Review[];
};
