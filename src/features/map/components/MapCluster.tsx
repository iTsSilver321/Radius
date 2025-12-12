import { Item } from "@/src/features/feed/types";
import { useLocationStore } from "@/src/features/location/hooks/useLocation";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// @ts-ignore - react-native-map-clustering types might be missing
import ClusteredMapView from "react-native-map-clustering";

interface MapClusterProps {
  items: Item[];
  onRegionChangeComplete?: (region: any) => void;
  initialRegion?: any;
}

const DEFAULT_REGION = {
  latitude: 40.73061, // New York
  longitude: -73.935242,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const MapCluster = ({
  items,
  onRegionChangeComplete,
  initialRegion,
}: MapClusterProps) => {
  const mapRef = useRef<MapView>(null);
  const userLocation = useLocationStore((state) => state.location);
  const [hasCentered, setHasCentered] = React.useState(false);

  useEffect(() => {
    // If initialRegion is provided (from navigation), use it immediately
    if (initialRegion && mapRef.current) {
      mapRef.current.animateToRegion(initialRegion);
      setHasCentered(true);
    }
    // Otherwise fallback to user location logic
    else if (userLocation && mapRef.current && !hasCentered) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setHasCentered(true);
    }
  }, [userLocation, hasCentered, initialRegion]);

  // Memoize and Jitter Items to prevent exact overlap
  const jitteredItems = React.useMemo(() => {
    const processed: Item[] = [];
    const locMap = new Map<string, number>();

    items.forEach((item) => {
      if (!item.location) return;

      // Generate a key based on rough coords
      const key = `${item.location.latitude.toFixed(4)},${item.location.longitude.toFixed(4)}`;
      const count = locMap.get(key) || 0;
      locMap.set(key, count + 1);

      // Apply tighter jitter to maintain location accuracy while preventing overlap.
      // 0.0003 deg is approx 30 meters. This keeps items within the same "property" or block.
      const jitterAmount = 0.0003 * Math.min(count, 3); // Cap expansion

      // Tighter spiral
      const angle = count * 2.0;

      processed.push({
        ...item,
        location: {
          ...item.location,
          latitude: item.location.latitude + Math.sin(angle) * jitterAmount,
          longitude: item.location.longitude + Math.cos(angle) * jitterAmount,
        },
      });
    });

    return processed;
  }, [items]);

  const renderMarker = (item: Item) => {
    if (!item.location) return null;
    const { latitude, longitude } = item.location;

    return (
      <Marker
        key={item.id}
        coordinate={{ latitude, longitude }}
        title={item.title}
        description={`$${item.price}`}
        tracksViewChanges={false} // Performance optimization
        onCalloutPress={() => {
          // console.log("Pressed item:", item.id);
        }}
      >
        {/* Custom Marker View if needed, otherwise default Google pin is very visible */}
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      <ClusteredMapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={DEFAULT_REGION}
        // Clustering Configuration
        clusterColor="#2563eb"
        clusterTextColor="#ffffff"
        radius={15} // Very small radius to prefer individual pins
        minPoints={5} // Only cluster if 5+ items crowd exactly
        maxZoom={13} // Stop clustering earlier (city level)
        extent={512}
        animationEnabled={true}
        spiderLineColor="#2563eb"
        showsUserLocation={true}
        showsMyLocationButton={true}
        mapPadding={{ top: 120, right: 10, bottom: 0, left: 0 }}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {jitteredItems.map(renderMarker)}
      </ClusteredMapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
