import { create } from "zustand";
import { fetchSavedItemIds, saveItem, unsaveItem } from "./api";

interface SavedStore {
    savedIds: Set<string>;
    loading: boolean;
    initialized: boolean;
    fetchSavedIds: (userId: string) => Promise<void>;
    toggleSave: (itemId: string, userId: string) => Promise<void>;
    isSaved: (itemId: string) => boolean;
    reset: () => void;
}

export const useSavedStore = create<SavedStore>((set, get) => ({
    savedIds: new Set(),
    loading: false,
    initialized: false,

    fetchSavedIds: async (userId: string) => {
        if (get().initialized) return; // Avoid re-fetching if already loaded
        set({ loading: true });
        try {
            const ids = await fetchSavedItemIds(userId);
            set({ savedIds: new Set(ids), initialized: true });
        } catch (error) {
            console.error("Failed to fetch saved IDs:", error);
        } finally {
            set({ loading: false });
        }
    },

    toggleSave: async (itemId: string, userId: string) => {
        const isCurrentlySaved = get().savedIds.has(itemId);
        
        // Optimistic Update
        set((state) => {
            const newSet = new Set(state.savedIds);
            if (isCurrentlySaved) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return { savedIds: newSet };
        });

        try {
            if (isCurrentlySaved) {
                await unsaveItem(itemId, userId);
            } else {
                await saveItem(itemId, userId);
            }
        } catch (error) {
            console.error("Failed to toggle save:", error);
            // Revert on error
            set((state) => {
                const newSet = new Set(state.savedIds);
                if (isCurrentlySaved) {
                    newSet.add(itemId);
                } else {
                    newSet.delete(itemId);
                }
                return { savedIds: newSet };
            });
            throw error;
        }
    },

    isSaved: (itemId: string) => get().savedIds.has(itemId),
    
    reset: () => set({ savedIds: new Set(), initialized: false }),
}));
