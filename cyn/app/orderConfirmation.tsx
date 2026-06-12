import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/components/store/hooks";
import {
  decreaseQuantity,
  increaseQuantity,
  removeMultipleItems,
} from "@/components/store/slice/cartSlice";
import * as WebBrowser from "expo-web-browser";
import { RootState } from "@/components/store/store";
import { formatNumberToThousands } from "@/components/reusables";
import { addProductOrder, getShippingAddress } from "@/services/api/request";
import { router } from "expo-router";
import { useAuth } from "@/components/AuthContext";

type CartItemProps = {
  id?: string;
  title: string;
  description: string;
  price: number;
  qty: number;
  image: any;
  onIncrease: () => void;
  onDecrease: () => void;
};

function CartItemRow({ id, title, image, description, price, qty, onIncrease, onDecrease }: CartItemProps) {
  return (
    <View className="flex flex-row items-center mt-4 justify-between">
      <View className="rounded-[8px] flex flex-row p-2">
        <Image
          source={typeof image === "string" ? { uri: image } : image}
          className="w-[35%] h-[112px] border-[1px] border-[#E6E6E6] rounded-[8px] mr-2"
        />
        <View className="flex flex-col w-[63%]">
          <Text className="text-[13px] text-[#373636] mb-[12px]" style={{ fontFamily: "Manrope_400Regular" }}>
            {title}
          </Text>
          <Text className="text-[12px] text-[#050404]" style={{ fontFamily: "Manrope_600SemiBold" }}>
            {description}
          </Text>
          <View className="mt-10 flex flex-row justify-between">
            <Text className="text-[#050404] text-[18px]" style={{ fontFamily: "Manrope_700Bold" }}>
              ₦{formatNumberToThousands(price)}
            </Text>
            <View className="flex-row flex items-center justify-between">
              <Pressable
                onPress={onDecrease}
                className="w-[24px] h-[24px] border-[#FF9ED9] border-[1px] rounded-full justify-center items-center"
              >
                <Text className="text-[16px] text-[#FF9ED9]" style={{ fontFamily: "Manrope_600SemiBold" }}>-</Text>
              </Pressable>
              <View className="w-[24px] h-[24px] bg-[#FFF1F9] mx-2 flex justify-center items-center rounded-[5px]">
                <Text className="text-[12px] text-[#050404]" style={{ fontFamily: "Manrope_600SemiBold" }}>{qty}</Text>
              </View>
              <Pressable
                onPress={onIncrease}
                className="w-[24px] h-[24px] border-[#FF9ED9] border-[1px] rounded-full justify-center items-center"
              >
                <Text className="text-[16px] text-[#FF9ED9]" style={{ fontFamily: "Manrope_600SemiBold" }}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function OrderConfirmation() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [checkout, setCheckout] = useState<string>("");
  const [orderedItemIds, setOrderedItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const selectedItems = useAppSelector((state) => state.cart.selectedItems ?? []);
  const { cart: cartItem } = useAppSelector((state: RootState) => state.cart ?? []);

  const itemsToOrder = useMemo(
    () => cartItem.filter((item) => selectedItems.includes(item.id)),
    [cartItem, selectedItems],
  );

  const totalSelectedCost = useMemo(
    () => itemsToOrder.reduce((total, item) => total + (item.quantity ?? 1) * item.price, 0),
    [itemsToOrder],
  );

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;
    try {
      setAddressLoading(true);
      const res = await getShippingAddress(user.id);
      const list: any[] = (res as any).data ?? [];
      setAddresses(list);
      // auto-select default or first
      const def = list.find((a: any) => a.isDefault) ?? list[0];
      if (def) setSelectedAddressId(def.id);
    } catch {
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handlePayNow = async () => {
    if (!checkout) return;
    await WebBrowser.openBrowserAsync(checkout);
    dispatch(removeMultipleItems({ ids: orderedItemIds }));
    router.replace("/(drawer)/(tabs)/cart");
  };

  const handleProceed = async () => {
    if (!selectedAddress) {
      Alert.alert("No address", "Please select or add a delivery address before proceeding.");
      return;
    }
    if (itemsToOrder.length === 0) {
      Alert.alert("Empty cart", "Select at least one item to order.");
      return;
    }

    const deliveryAddressStr = [
      selectedAddress.address,
      selectedAddress.townOrCity,
      selectedAddress.state,
      selectedAddress.country,
      selectedAddress.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    const cart = itemsToOrder.map((item) => ({ product: item.id, count: item.quantity }));
    const payload = { cart, deliveryAddress: deliveryAddressStr, deliveryCost: 500 };

    try {
      setLoading(true);
      const response = await addProductOrder(payload);
      const checkoutLink = response.data?.data?.checkoutLink;
      if (response.status === 201 && checkoutLink) {
        setCheckout(checkoutLink);
        setOrderedItemIds(itemsToOrder.map((i) => i.id));
      } else {
        Alert.alert("Error", response.data?.message ?? "Payment could not be initialised. Please try again.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message ?? "Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["bottom"]}
      className="flex-1 flex bg-[#F8F8FF]"
      style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
    >
      <ScrollView className="mx-4" showsVerticalScrollIndicator={false}>
        <View className="flex flex-col gap-[40px] mt-4">
          <View className="flex flex-col gap-[24px]">

            {/* Delivery address section */}
            <View className="flex flex-col gap-[10px]">
              <View className="flex flex-row items-center justify-between mb-1">
                <Text className="text-[16px] text-[#050404]" style={{ fontFamily: "Manrope_700Bold" }}>
                  Delivery Address
                </Text>
                <Pressable onPress={() => router.push("/shippingAddress")}>
                  <Text className="text-[13px] text-[#FF6EC7]" style={{ fontFamily: "Manrope_600SemiBold" }}>
                    + Add / Manage
                  </Text>
                </Pressable>
              </View>

              {addressLoading ? (
                <ActivityIndicator color="#FF6EC7" />
              ) : addresses.length === 0 ? (
                <Pressable
                  onPress={() => router.push("/shippingAddress")}
                  style={styles.card}
                  className="flex flex-row items-center gap-3 px-[22px] py-[16px] bg-white rounded-[8px]"
                >
                  <MaterialCommunityIcons name="map-marker-plus-outline" size={20} color="#FF6EC7" />
                  <Text className="text-[13px] text-[#585757]" style={{ fontFamily: "Manrope_400Regular" }}>
                    No saved addresses. Tap to add one.
                  </Text>
                </Pressable>
              ) : (
                addresses.map((addr) => (
                  <Pressable
                    key={addr.id}
                    onPress={() => setSelectedAddressId(addr.id)}
                    style={styles.card}
                    className={`flex flex-row items-start gap-3 px-[16px] py-[14px] rounded-[8px] ${
                      selectedAddressId === addr.id ? "bg-[#FFF1F9] border-[1.5px] border-[#FF6EC7]" : "bg-white"
                    }`}
                  >
                    <View className="mt-[2px]">
                      <Ionicons
                        name={selectedAddressId === addr.id ? "radio-button-on" : "radio-button-off"}
                        size={18}
                        color={selectedAddressId === addr.id ? "#FF6EC7" : "#B2B1B1"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[13px] text-[#050404]" style={{ fontFamily: "Manrope_600SemiBold" }}>
                        {[addr.address, addr.townOrCity, addr.state].filter(Boolean).join(", ")}
                      </Text>
                      <Text className="text-[11px] text-[#585757] mt-1" style={{ fontFamily: "Manrope_400Regular" }}>
                        {[addr.country, addr.postalCode].filter(Boolean).join(" · ")}
                      </Text>
                      {addr.isDefault && (
                        <View className="mt-1 self-start bg-[#FFD2EE] px-2 py-[2px] rounded-full">
                          <Text className="text-[10px] text-[#C6005C]" style={{ fontFamily: "Manrope_600SemiBold" }}>Default</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))
              )}
            </View>

            {/* Items */}
            <View>
              <View className="flex flex-row justify-between pt-2 items-center">
                <View className="flex flex-row items-center">
                  <Text className="text-[18px] mr-[4px]" style={{ fontFamily: "Manrope_700Bold" }}>Items</Text>
                  <View className="py-[2px] px-[4px] bg-[#FFD2EE] rounded-[24px] w-[24px] h-[24px] justify-center items-center">
                    <Text className="font-[500] text-[14px]" style={{ fontFamily: "Manrope_500Medium" }}>
                      {itemsToOrder.length}
                    </Text>
                  </View>
                </View>
              </View>

              <FlatList
                data={itemsToOrder}
                renderItem={({ item }) => (
                  <CartItemRow
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    price={item.price}
                    qty={item.quantity}
                    image={item.coverImage}
                    onIncrease={() => dispatch(increaseQuantity({ id: item.id }))}
                    onDecrease={() => dispatch(decreaseQuantity({ id: item.id }))}
                  />
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>

            {/* Total */}
            <View className="flex flex-row items-center justify-between">
              <Text className="text-[18px] text-[#050404] text-center" style={{ fontFamily: "Manrope_800ExtraBold" }}>Total</Text>
              <Text className="text-[18px] text-[#050404] text-center" style={{ fontFamily: "Manrope_700Bold" }}>
                ₦ {formatNumberToThousands(totalSelectedCost)}
              </Text>
            </View>
          </View>

          {!checkout ? (
            <Pressable
              onPress={handleProceed}
              className="bg-[#FF6EC7] h-[48px] rounded-[8px] flex flex-col items-center justify-center mb-8"
            >
              <Text className="text-[16px] text-white text-center" style={{ fontFamily: "Manrope_400Regular" }}>
                Proceed
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handlePayNow}
              className="bg-[#FF6EC7] h-[48px] rounded-[8px] flex flex-col items-center justify-center mb-8"
            >
              <Text className="text-[16px] text-white text-center" style={{ fontFamily: "Manrope_400Regular" }}>
                Pay Now
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#585757",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
