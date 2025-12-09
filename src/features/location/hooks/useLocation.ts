import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { create } from "zustand";

interface LocationState {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  setLocation: (location: Location.LocationObject | null) => void;
  setErrorMsg: (msg: string | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  errorMsg: null,
  setLocation: (location) => set({ location }),
  setErrorMsg: (errorMsg) => set({ errorMsg }),
}));

export const useLocation = () => {
  const { location, errorMsg, setLocation, setErrorMsg } = useLocationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if not already set (or we could force refresh)
    if (location) {
        setLoading(false);
        return;
    }

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Could not fetch location");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, errorMsg, loading };
};
