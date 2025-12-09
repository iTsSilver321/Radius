import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { create } from "zustand";

interface LocationState {
  location: Location.LocationObject | null;
  address: Location.LocationGeocodedAddress | null;
  errorMsg: string | null;
  setLocation: (location: Location.LocationObject | null) => void;
  setAddress: (address: Location.LocationGeocodedAddress | null) => void;
  setErrorMsg: (msg: string | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  address: null,
  errorMsg: null,
  setLocation: (location) => set({ location }),
  setAddress: (address) => set({ address }),
  setErrorMsg: (errorMsg) => set({ errorMsg }),
}));

export const useLocation = () => {
  const { location, address, errorMsg, setLocation, setAddress, setErrorMsg } =
    useLocationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if not already set (or we could force refresh)
    if (location && address) {
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

        // Reverse Geocode
        if (location) {
          let addresses = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (addresses && addresses.length > 0) {
            setAddress(addresses[0]);
          }
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Could not fetch location");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, address, errorMsg, loading };
};
