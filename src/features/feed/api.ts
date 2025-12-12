import { supabase } from "@/src/lib/supabase";
import { parseEWKB } from "../location/utils";
import { FeedFilters, Item } from "./types";

// Haversine formula to calculate distance in meters
const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const fetchItems = async (filters: FeedFilters = {}) => {
  // Get current user to filter blocked content
  const {
    data: { session },
  } = await supabase.auth.getSession();
  let blockedUserIds: string[] = [];

  if (session?.user) {
    const { data } = await supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", session.user.id);
    if (data) blockedUserIds = data.map((b) => b.blocked_id);
  }

  let query = supabase.from("items").select("*").eq("status", "active");

  // Apply Sorting
  if (filters.sortBy === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sortBy === "price_desc") {
    query = query.order("price", { ascending: false });
  } else if (filters.sortBy === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    // Default or Closest (Closest needs base set to filter then text sort)
    // Always prioritize boosted if not sorting by price strict
    query = query
      .order("is_boosted", { ascending: false })
      .order("created_at", { ascending: false });
  }

  // Default limit
  query = query.limit(100);

  if (blockedUserIds.length > 0) {
    query = query.not("owner_id", "in", `(${blockedUserIds.join(",")})`);
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

  let items = data.map((item: any) => ({
    ...item,
    location:
      typeof item.location === "string"
        ? parseEWKB(item.location)
        : item.location,
  })) as Item[];

  // Radius Filtering
  // Only apply radius if we are NOT searching by map bounds specifically.
  // This allows "Search This View" to override the "My Radius" filter.
  if (filters.radius && filters.userLocation && !filters.mapBounds) {
    items = items.filter((item) => {
      if (!item.location) return false;
      const dist = getDistanceFromLatLonInKm(
        filters.userLocation!.latitude,
        filters.userLocation!.longitude,
        item.location.latitude,
        item.location.longitude,
      );
      return dist <= filters.radius!;
    });
  }

  // Map Bounds Filtering (Search This Area)
  if (filters.mapBounds) {
    items = items.filter((item) => {
      if (!item.location) return false;
      const { latitude, longitude } = item.location;
      const { northeast, southwest } = filters.mapBounds!;

      return (
        latitude <= northeast.latitude &&
        latitude >= southwest.latitude &&
        longitude <= northeast.longitude &&
        longitude >= southwest.longitude
      );
    });
  }

  // Client-side Distance Sort
  if (filters.sortBy === "closest" && filters.userLocation) {
    items.sort((a, b) => {
      if (!a.location || !b.location) return 0;
      const distA = getDistanceFromLatLonInKm(
        filters.userLocation!.latitude,
        filters.userLocation!.longitude,
        a.location.latitude,
        a.location.longitude,
      );
      const distB = getDistanceFromLatLonInKm(
        filters.userLocation!.latitude,
        filters.userLocation!.longitude,
        b.location.latitude,
        b.location.longitude,
      );
      return distA - distB;
    });
  }

  return items;
};

export const fetchItemById = async (id: string): Promise<Item | null> => {
  const { data, error } = await supabase
    .from("items")
    .select(
      `
            *,
            profiles:owner_id (
                id,
                full_name,
                avatar_url,
                reputation
            )
        `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return {
    ...data,
    location:
      typeof data.location === "string"
        ? parseEWKB(data.location)
        : data.location,
    owner: data.profiles, // Map joined profile to owner
  } as Item;
};

export const updateItemStatus = async (
  id: string,
  status: "active" | "reserved" | "sold",
) => {
  const { error } = await supabase
    .from("items")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
};

export const boostItem = async (id: string, durationHours: number = 24 * 7) => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + durationHours);

  const { error } = await supabase
    .from("items")
    .update({
      is_boosted: true,
      boost_expiry: expiry.toISOString(),
    })
    .eq("id", id);

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
    location:
      typeof item.location === "string"
        ? parseEWKB(item.location)
        : item.location,
  })) as Item[];
};

export const deleteItem = async (id: string, userId: string) => {
  // 1. Check if user is owner
  const item = await fetchItemById(id);
  if (!item) throw new Error("Item not found");
  if (item.owner_id !== userId)
    throw new Error("Unauthorized to delete this item");

  // 2. Delete item
  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) throw error;
};
