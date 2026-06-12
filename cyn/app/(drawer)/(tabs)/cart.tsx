import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import {
  Ionicons,
  Octicons,
} from "@expo/vector-icons";
import { RadioButton } from "react-native-paper";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/components/store/hooks";
import {
  clearCart,
  clearSelection,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
  selectAll,
  toggleSelect,
} from "@/components/store/slice/cartSlice";
import { RootState } from "@/components/store/store";
import { formatNumberToThousands, EmptyList, formatShortDate } from "@/components/reusables";
import { getProducts, getServiceProvider, getUpcomingBookings } from "@/services/api/request";
import { router } from "expo-router";
import { useAuth } from "@/components/AuthContext";

type ItemProps = {
  id?: string;
  title: string;
  description: string;
  price: number;
  qty: number;
  image: any;
};

export default function Cart() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [vendorBookings, setVendorBookings] = useState<any[]>([]);
  const [vendorBookingsLoading, setVendorBookingsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();

  const selectedItems = useAppSelector(
    (state) => state.cart.selectedItems ?? [],
  );
  const { cart: cartItem } = useAppSelector(
    (state: RootState) => state.cart ?? [],
  );
  const totalSelectedCost = useMemo(() => {
    return cartItem
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => total + (item.quantity ?? 1) * item.price, 0);
  }, [cartItem, selectedItems]);

  const dispatch = useAppDispatch();
  const onRemoveItem = (productId: any) => {
    dispatch(removeItem({ id: productId }));
  };
  const clear = () => {
    dispatch(clearCart());
  };
  const onIncreaseQuantity = (productId: string) => {
    dispatch(increaseQuantity({ id: productId }));
  };

  const onDecreaseQuantity = (productId: string) => {
    dispatch(decreaseQuantity({ id: productId }));
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItem.length && cartItem.length > 0) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAll());
    }
  };

  const CartItem = ({
    id,
    title,
    image,
    description,
    price,
    qty,
  }: ItemProps) => {
    const isSelected = selectedItems?.includes(id ?? "");
    return (
      <View className="flex flex-row items-center mt-4 justify-between pr-4">
        <View className="w-[10%]">
          <RadioButton.Android
            value="option2"
            onPress={() => dispatch(toggleSelect(id ?? ""))}
            status={isSelected ? "checked" : "unchecked"}
            color="#FF6EC7"
          />
        </View>
        <View
          className="rounded-[8px] w-[90%] bg-white flex flex-row  p-2"
          style={styles.card}
        >
          <Image
            source={typeof image === "string" ? { uri: image } : image}
            className="w-[35%] h-[112px] border-[1px] border-[#E6E6E6] rounded-[8px] mr-2"
          />

          <View className="flex flex-col w-[63%]">
            <Text
              className=" text-[13px] text-[#373636] mb-[12px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {title}
            </Text>
            <Text
              className=" text-[12px] text-[#050404]"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              {description}
            </Text>

            <View className="mt-10 flex flex-row  justify-between">
              <View className="w-[1/2]">
                <Text
                  className="text-[#050404] text-[18px]"
                  style={{ fontFamily: "Manrope_700Bold" }}
                >
                  ₦{formatNumberToThousands(price)}
                </Text>
              </View>
              <View className="w-[1/2] flex-row flex items-center justify-between">
                <Pressable
                  onPress={() => onDecreaseQuantity(id ?? "")}
                  className="w-[24px] h-[24px] border-[#FF9ED9] border-[1px] rounded-full justify-center items-center"
                >
                  <Text
                    className=" text-[16px] text-[#FF9ED9]"
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                  >
                    -
                  </Text>
                </Pressable>
                <View className="w-[24px] h-[24px] bg-[#FFF1F9] mx-2 flex justify-center items-center rounded-[5px]">
                  <Text
                    className=" text-[12px] text-[#050404] "
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                  >
                    {qty}
                  </Text>
                </View>
                <Pressable
                  onPress={() => onIncreaseQuantity(id ?? "")}
                  className="w-[24px] h-[24px] border-[#FF9ED9] border-[1px] rounded-full justify-center items-center"
                >
                  <Text
                    className=" text-[16px] text-[#FF9ED9]"
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                  >
                    +
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (!user || user.role !== "customer") return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsRes = await getProducts(10);
        setProducts(productsRes?.data ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "businessOwner") return;
    const fetchVendorBookings = async () => {
      try {
        setVendorBookingsLoading(true);
        const provider = await getServiceProvider();
        if (!provider?.id) return;
        const bookings = await getUpcomingBookings(provider.id);
        setVendorBookings(Array.isArray(bookings) ? bookings : []);
      } catch {
        setVendorBookings([]);
      } finally {
        setVendorBookingsLoading(false);
      }
    };
    fetchVendorBookings();
  }, [user?.role]);

  const filteredVendorBookings = useMemo(() => {
    if (!searchQuery.trim()) return vendorBookings;
    const q = searchQuery.toLowerCase();
    return vendorBookings.filter(
      (b) =>
        b.customerId?.fullName?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q),
    );
  }, [vendorBookings, searchQuery]);

  return (
    <SafeAreaView
      className="flex-1 flex bg-[#F8F8FF] "
      style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
    >
      {(!user || user?.role === "customer") && (
        <View className="flex-1 ">
          <View className="flex flex-row justify-between pt-2 items-center px-4">
            <View className="flex flex-row items-center">
              <Text
                className=" text-[18px] mr-[4px] "
                style={{ fontFamily: "Manrope_700Bold" }}
              >
                Cart
              </Text>
              <View className="py-[2px] px-[4px] bg-[#FFD2EE] rounded-[24px] w-[24px] h-[24px] justify-center items-center">
                <Text
                  className="font-[500] text-[14px]"
                  style={{ fontFamily: "Manrope_500Medium" }}
                >
                  {cartItem.length}
                </Text>
              </View>
            </View>
            <Pressable onPress={clear}>
              <Ionicons name="trash-outline" size={24} color="black" />
            </Pressable>
          </View>
          <View className="flex flex-row justify-between items-center w-full px-4 mt-4">
            <View className="flex-1 flex flex-row items-center">
              <RadioButton.Android
                value="option2"
                onPress={handleSelectAll}
                status={
                  cartItem.length > 0 &&
                  selectedItems.length === cartItem.length
                    ? "checked"
                    : "unchecked"
                }
                color="#FF6EC7"
              />
              <Text
                style={{ fontFamily: "Manrope_700Bold" }}
                className=" text-[16px]"
              >
                All
              </Text>
            </View>
            <View className="flex-1 flex flex-row items-center justify-end  space-x-4">
              <Text
                className=" text-[16px] text-[#050404] mr-[23px]"
                style={{ fontFamily: "Manrope_600SemiBold" }}
              >
                ₦{formatNumberToThousands(totalSelectedCost)}
              </Text>
              <Pressable
                onPress={() => router.push("/orderConfirmation")}
                disabled={selectedItems.length < 1}
                className={`py-[8px] px-[16px] rounded-[4px]  ${selectedItems.length < 1 ? "bg-[#B2B1B1]" : "bg-[#FF6EC7]"}`}
              >
                <Text
                  className=" text-[14px] text-white"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  Checkout ({selectedItems?.length})
                </Text>
              </Pressable>
            </View>
          </View>
          <FlatList
            style={{ paddingRight: 5 }}
            data={cartItem}
            renderItem={({ item }) => (
              <CartItem
                id={item.id}
                title={item.title}
                description={item.description}
                price={item.price}
                qty={item.quantity}
                image={item.coverImage}
              />
            )}
            extraData={selectedItems}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}
      {user && user?.role === "businessOwner" && (
        <View className="flex-1 bg-[#F9FAFB]">
          {/* Search */}
          <View className="px-4 py-3 border-b border-[#E5E7EB]">
            <View className="h-[50px] bg-white flex-row items-center px-4 border border-[#E5E7EB] rounded-[10px]">
              <Octicons name="search" size={20} color="#B2B1B1" />
              <TextInput
                placeholder="Search conversations..."
                placeholderTextColor="#B2B1B1"
                className="flex-1 mx-[8px] text-[14px]"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {vendorBookingsLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#FF6EC7" />
            </View>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredVendorBookings}
              keyExtractor={(item) => item.id ?? item._id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 }}
              ListEmptyComponent={
                <EmptyList message="No conversations yet. Customers will appear here once they book your services." />
              }
              renderItem={({ item }) => {
                const customerName = item.customerId?.fullName ?? "Customer";
                const avatarUrl = item.customerId?.avatarURL;
                const initials = customerName
                  .split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const statusColor =
                  item.status === "completed"
                    ? "#10B981"
                    : item.status === "cancelled"
                      ? "#EF4444"
                      : "#F59E0B";

                return (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/chat",
                        params: {
                          bookingId: item.id ?? item._id,
                          providerName: customerName,
                          serviceType: item.description ?? "Booking",
                          bookingRef: item.id ?? item._id,
                          avatarUrl: avatarUrl ?? "",
                        },
                      })
                    }
                    className="flex-row items-center gap-3 py-4 border-b border-[#F3F4F6]"
                  >
                    {/* Avatar */}
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-full bg-[#FF6EC7] items-center justify-center">
                        <Text
                          className="text-white text-[16px]"
                          style={{ fontFamily: "Manrope_700Bold" }}
                        >
                          {initials}
                        </Text>
                      </View>
                    )}

                    {/* Info */}
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center">
                        <Text
                          className="text-[15px] text-[#101828]"
                          style={{ fontFamily: "Manrope_600SemiBold" }}
                        >
                          {customerName}
                        </Text>
                        <Text
                          className="text-[11px] text-[#9CA3AF]"
                          style={{ fontFamily: "Manrope_400Regular" }}
                        >
                          {formatShortDate(item.appointmentDate)}
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center mt-[2px]">
                        <Text
                          className="text-[13px] text-[#6A7282]"
                          style={{ fontFamily: "Manrope_400Regular" }}
                          numberOfLines={1}
                        >
                          {item.description ?? "Tap to open chat"}
                        </Text>
                        <View
                          className="px-2 py-[2px] rounded-full"
                          style={{ backgroundColor: statusColor + "20" }}
                        >
                          <Text
                            className="text-[10px] capitalize"
                            style={{ color: statusColor, fontFamily: "Manrope_500Medium" }}
                          >
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 14,
  },
});
