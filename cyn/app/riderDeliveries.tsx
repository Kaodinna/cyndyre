import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/components/AuthContext";
import { getRiderOrders, updateRiderOrderStatus } from "@/services/api/request";
import { EmptyList } from "@/components/reusables";
import * as Location from "expo-location";
import { updateRiderLocation } from "@/services/api/request";

const STATUS_FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "shipped", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

const NEXT_STATUS: Record<string, { label: string; value: string }> = {
  pending: { label: "Mark Picked Up", value: "shipped" },
  shipped: { label: "Mark Delivered", value: "delivered" },
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B",
  packaged: "#3B82F6",
  shipped: "#8B5CF6",
  delivered: "#10B981",
};

export default function RiderDeliveriesScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("pending");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getRiderOrders(user.id, filter);
      setOrders((res as any).data ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let watchSub: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      watchSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 30000, distanceInterval: 50 },
        (loc) => {
          updateRiderLocation(loc.coords.latitude, loc.coords.longitude).catch(() => {});
        },
      );
    };

    startTracking();
    return () => { watchSub?.remove(); };
  }, []);

  const handleStatusUpdate = async (orderId: string, nextStatus: string) => {
    try {
      setUpdatingId(orderId);
      await updateRiderOrderStatus(orderId, nextStatus);
      await fetchOrders();
    } catch {
      Alert.alert("Error", "Failed to update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderOrder = ({ item }: { item: any }) => {
    const images = item.cart?.map((c: any) => c.product?.images?.[0]).filter(Boolean) ?? [];
    const next = NEXT_STATUS[item.status];
    const statusColor = STATUS_COLOR[item.status] ?? "#6B7280";

    return (
      <View
        className="bg-white rounded-[12px] mb-3 overflow-hidden"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 }}
      >
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-4 pt-4 pb-2">
          <View>
            <Text className="text-[13px] text-[#050404]" style={{ fontFamily: "Manrope_700Bold" }}>
              Order #{item.orderId}
            </Text>
            <Text className="text-[11px] text-[#585757] mt-[2px]" style={{ fontFamily: "Manrope_400Regular" }}>
              {item.cart?.length ?? 0} item{(item.cart?.length ?? 0) !== 1 ? "s" : ""}
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: statusColor + "20" }}>
            <Text className="text-[11px] capitalize" style={{ color: statusColor, fontFamily: "Manrope_600SemiBold" }}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Product thumbnails */}
        {images.length > 0 && (
          <View className="flex flex-row gap-[6px] px-4 pb-3">
            {images.slice(0, 4).map((uri: string, idx: number) => (
              <View key={idx} className="w-[48px] h-[48px] rounded-[8px] overflow-hidden bg-[#F3F3F3]">
                <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              </View>
            ))}
          </View>
        )}

        {/* Delivery addresses */}
        {item.vendor?.address && (
          <View className="flex flex-row items-start gap-[8px] px-4 pb-2">
            <MaterialCommunityIcons name="store-outline" size={16} color="#FF6EC7" style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-[11px] text-[#9CA3AF]" style={{ fontFamily: "Manrope_400Regular" }}>Pickup from vendor</Text>
              <Text className="text-[12px] text-[#374151]" style={{ fontFamily: "Manrope_500Medium" }} numberOfLines={1}>
                {item.vendor.address}
              </Text>
            </View>
          </View>
        )}
        {item.shippingAddress && (
          <View className="flex flex-row items-start gap-[8px] px-4 pb-3">
            <Ionicons name="location-outline" size={16} color="#10B981" style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-[11px] text-[#9CA3AF]" style={{ fontFamily: "Manrope_400Regular" }}>Deliver to customer</Text>
              <Text className="text-[12px] text-[#374151]" style={{ fontFamily: "Manrope_500Medium" }} numberOfLines={2}>
                {[item.shippingAddress.address, item.shippingAddress.city, item.shippingAddress.state].filter(Boolean).join(", ")}
              </Text>
            </View>
          </View>
        )}

        {/* Amount */}
        <View className="flex flex-row items-center justify-between px-4 py-3 border-t border-[#F3F3F3]">
          <Text className="text-[13px] text-[#374151]" style={{ fontFamily: "Manrope_400Regular" }}>
            Total: <Text style={{ fontFamily: "Manrope_700Bold" }}>₦{item.totalAmount?.toLocaleString()}</Text>
          </Text>

          {next && (
            <Pressable
              onPress={() => handleStatusUpdate(item.id, next.value)}
              disabled={updatingId === item.id}
              className="bg-[#F6339A] px-4 py-[8px] rounded-[8px] flex flex-row items-center gap-[6px]"
              style={{ opacity: updatingId === item.id ? 0.6 : 1 }}
            >
              {updatingId === item.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons name="check-circle-outline" size={16} color="#fff" />
              )}
              <Text className="text-white text-[12px]" style={{ fontFamily: "Manrope_600SemiBold" }}>
                {next.label}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F8FF]" edges={["top"]}>
      {/* Header */}
      <View className="flex flex-row items-center gap-3 px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#050404" />
        </Pressable>
        <Text className="text-[18px] text-[#050404]" style={{ fontFamily: "Manrope_700Bold" }}>
          My Deliveries
        </Text>
      </View>

      {/* Status filter tabs */}
      <View className="mx-4 mb-3 flex flex-row p-[2px] border border-[#FFD2EE59] bg-[#FFF1F9] rounded-[6px]">
        {STATUS_FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={`flex-1 py-[6px] rounded-[6px] ${isActive ? "bg-[#FF6EC7]" : "bg-transparent"}`}
            >
              <Text
                className={`text-center text-[13px] ${isActive ? "text-white" : "text-[#373636]"}`}
                style={{ fontFamily: "Manrope_600SemiBold" }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6EC7" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <EmptyList message={`No ${filter === "shipped" ? "in-transit" : filter} deliveries`} />
          }
          onRefresh={fetchOrders}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}
