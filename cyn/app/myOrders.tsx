import {
  View,
  Pressable,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrders } from "@/services/api/request";
import { useAuth } from "@/components/AuthContext";
import { OrderItem } from "@/components/flatListItems/items";
import { EmptyList } from "@/components/reusables";
import BottomSheet from "@/components/bottomSheet";
import { addCommasToNumber } from "@/helpers/functions";

export default function MyOrdersScreen() {
  const [filter, setFilter] = useState("pending");
  const [product, setProduct] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const productRes = await getOrders(user.id, filter);

        if (isMounted) {
          setProduct(productRes.data);
        }
      } catch (error: any) {
        if (isMounted) {
          setError(error?.message ?? "Something went wrong");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, filter]);

  const filters = [
    { key: "pending", label: "Pending" },
    { key: "packaged", label: "Packaged" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-[#F8F8FF] ">
      <StatusBar barStyle="dark-content" />

      <View className="px-4 flex-1">
        <View className="flex flex-row p-[2px] border border-[#FFD2EE59] bg-[#FFF1F9] rounded-[6px]">
          {filters.map((item) => {
            const isActive = filter === item.key;

            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                className={`flex-1 py-[6px] rounded-[6px] ${
                  isActive ? "bg-[#FF6EC7]" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-center text-[14px] ${
                    isActive ? "text-white" : "text-[#373636]"
                  }`}
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <FlatList
          ListEmptyComponent={<EmptyList message="You have no orders yet" />}
          className="mt-4"
          data={product}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const images = item.cart
              .map((c: any) => c.product?.images?.[0])
              .filter(Boolean);

            return (
              <OrderItem
                id={item.id}
                orderId={item.orderId}
                status={item.status}
                total={item.totalAmount}
                item={item.cart.length}
                images={images}
                onPress={() => {
                  setSelectedOrder(item);
                  setSheetVisible(true);
                }}
              />
            );
          }}
        />
      </View>
      <BottomSheet
        visible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Item Details"
        maxHeight={0.54}
        footer={<View className="flex flex-row gap-[12px]" />}
      >
        <View className=" pb-6">
          <View className="mt-3 mb-2">
            <Text
              style={{ fontFamily: "Manrope_700Bold" }}
              className="text-[14px]"
            >
              Order {selectedOrder?.orderId}
            </Text>

            <Text
              style={{ fontFamily: "Manrope_400Regular" }}
              className="text-[12px] text-[#585757]"
            >
              Status: {selectedOrder?.status}
            </Text>
          </View>

          {!selectedOrder?.cart || selectedOrder.cart.length === 0 ? (
            <EmptyList message="No items in this order" />
          ) : (
            selectedOrder.cart.map((c: any) => (
              <View
                key={c.id}
                className="border border-[#E6E6E6] bg-white rounded-[10px] p-3 mb-2 flex flex-row gap-3"
              >
                <View className="w-[70px] h-[70px] rounded-[10px] overflow-hidden bg-[#F3F3F3]">
                  <Image
                    source={{ uri: c.product?.images?.[0] }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontFamily: "Manrope_700Bold" }}
                    className="text-[13px] text-[#050404]"
                    numberOfLines={1}
                  >
                    {c.product?.title ?? "Product"}
                  </Text>

                  <Text
                    style={{ fontFamily: "Manrope_400Regular" }}
                    className="text-[11px] text-[#585757] mt-1"
                  >
                    Qty: {c.count}
                  </Text>

                  <Text
                    style={{ fontFamily: "Manrope_700Bold" }}
                    className="text-[13px] text-[#050404] mt-2"
                  >
                    ₦
                    {addCommasToNumber(
                      (c.product?.price ?? 0) * (c.count ?? 1),
                    )}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
