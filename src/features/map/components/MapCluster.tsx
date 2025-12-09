import { Item } from "@/src/features/feed/types";
import { useLocationStore } from "@/src/features/location/hooks/useLocation";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// @ts-ignore - react-native-map-clustering types might be missing
import ClusteredMapView from "react-native-map-clustering";

interface MapClusterProps {
    items: Item[];
}

const INITIAL_REGION = {
    latitude: 40.730610, // New York
    longitude: -73.935242,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export const MapCluster = ({ items }: MapClusterProps) => {
    const mapRef = useRef<MapView>(null);
    const userLocation = useLocationStore((state) => state.location);

    useEffect(() => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        }
    }, [userLocation]);

    const renderMarker = (item: Item) => {
        // Ensure coordinates exist
        if (!item.location) return null;

        const { latitude, longitude } = item.location;

        return (
            <Marker
                key={item.id}
                coordinate={{ latitude, longitude }}
                title={item.title}
                description={`$${item.price}`}
                onCalloutPress={() => {
                    // Navigate to item detail (future)
                    console.log("Pressed item:", item.id);
                }}
            />
        );
    };

    return (
        <View style={styles.container}>
            <ClusteredMapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={INITIAL_REGION}
                clusterColor="#2563eb"
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {items.map(renderMarker)}
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
