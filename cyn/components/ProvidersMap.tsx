import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, Image, Pressable } from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";

// types/provider.ts
export type ProviderFromApi = {
  id: string;
  businessName?: string;
  displayImage?: string;
  rating?: number;
  user?: { fullName?: string; avatarURL?: string };
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
};

type MapProvider = {
  id: string;
  name: string;
  image?: string;
  rating: number;
  lat: number;
  lng: number;
  raw: ProviderFromApi;
  distance?: number | null;
};

export function ProvidersMap({
  userLat,
  userLng,
  providers,
  onSelectProvider,
}: {
  userLat?: number | null;
  userLng?: number | null;
  providers: ProviderFromApi[];
  onSelectProvider?: (p: ProviderFromApi) => void;
}) {
  const mapRef = useRef<MapView>(null);

  const hasUserLocation =
    typeof userLat === "number" &&
    typeof userLng === "number" &&
    Number.isFinite(userLat) &&
    Number.isFinite(userLng);

  const mapProviders: MapProvider[] = useMemo(() => {
    return providers
      .map((p): MapProvider | null => {
        const coords = p.location?.coordinates;
        if (!coords || coords.length < 2) return null;

        const [lng, lat] = coords;

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

        const distance = hasUserLocation
          ? getDistanceKm(userLat!, userLng!, lat, lng)
          : null;

        return {
          id: p.id,
          name: p.businessName || p.user?.fullName || "Provider",
          image: p.displayImage || p.user?.avatarURL,
          rating: p.rating ?? 0,
          lat,
          lng,
          distance,
          raw: p,
        };
      })
      .filter((x): x is MapProvider => x !== null);
  }, [providers, userLat, userLng]);

  const initialRegion: Region = useMemo(() => {
    // start at user location (fine), then we'll fit markers in useEffect
    return {
      latitude: hasUserLocation ? (userLat as number) : 6.5244,
      longitude: hasUserLocation ? (userLng as number) : 3.3792,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [hasUserLocation, userLat, userLng]);

  // ✅ Auto-fit map to markers (so you don't "see nothing")
  useEffect(() => {
    if (!mapRef.current) return;

    if (mapProviders.length > 0) {
      mapRef.current.fitToCoordinates(
        mapProviders.map((p) => ({ latitude: p.lat, longitude: p.lng })),
        {
          edgePadding: { top: 120, right: 60, bottom: 220, left: 60 },
          animated: true,
        },
      );
      return;
    }

    // If no providers, center on user
    if (hasUserLocation) {
      mapRef.current.animateToRegion(initialRegion, 500);
    }
  }, [mapProviders, hasUserLocation, initialRegion]);

  if (!hasUserLocation) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#4A5565" }}>Getting your location…</Text>
      </View>
    );
  }
  function getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371; // Earth radius in km

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {mapProviders.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }}>
            <View
              style={{
                backgroundColor: "#FF4FA3",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>★</Text>
            </View>

            <Callout tooltip onPress={() => onSelectProvider?.(p.raw)}>
              <Pressable
                style={{
                  width: 190,
                  backgroundColor: "white",
                  borderRadius: 14,
                  padding: 10,
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => onSelectProvider?.(p.raw)}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={
                      p.image
                        ? { uri: p.image }
                        : require("../assets/images/Google - Original.jpg")
                    }
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      marginRight: 10,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontWeight: "700", fontSize: 13 }}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                    <Text
                      style={{ marginTop: 2, fontSize: 12, color: "#4A5565" }}
                    >
                      ⭐ {p.rating ?? "—"}
                    </Text>
                    <Text
                      style={{ marginTop: 2, fontSize: 12, color: "#4A5565" }}
                    >
                      📍 {p.distance ? `${p.distance.toFixed(1)} km away` : ""}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View
        style={{
          position: "absolute",
          alignSelf: "center",
          top: 120,
          backgroundColor: "white",
          paddingVertical: 16,
          paddingHorizontal: 22,
          borderRadius: 16,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 3,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "800", color: "#FF4FA3" }}>Map View</Text>
        <Text style={{ color: "#4A5565", fontSize: 12, marginTop: 6 }}>
          Showing {mapProviders.length} providers
        </Text>
      </View>
    </View>
  );
}
