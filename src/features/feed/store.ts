import { create } from "zustand";
import { fetchItems } from "./api";
import { Item } from "./types";

interface FeedState {
    items: Item[];
    isLoading: boolean;
    error: string | null;
    fetchItems: (userId?: string) => Promise<void>;
}

export const useFeedStore = create<FeedState>((set) => ({
    items: [],
    isLoading: false,
    error: null,
    fetchItems: async (userId?: string) => {
        set({ isLoading: true, error: null });
        try {
            // Pass userId to filter out blocked users if implemented
            const items = await fetchItems({ searchQuery: undefined }); // Basic call, or handle userid filtering inside API if it checks session
            // Wait, fetchItems() takes filters object. The original code passed userId. API logic checks session for blocks. 
            // So we can just call fetchItems(). Or fetchItems({}).
            // But if we wanted to pass other filters we would. 
            // The previous code was: fetchItems(userId). 
            // The API expects (filters: FeedFilters = {}).
            // userId is NOT in FeedFilters. It does session check. 
            // So just calling fetchItems() is correct.
            set({ items });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },
}));
