import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { RadioButton } from "react-native-paper";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/components/store/hooks";
import {
  clearSelection,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
  selectAll,
  toggleSelect,
} from "@/components/store/slice/cartSlice";
import * as WebBrowser from "expo-web-browser";
import { RootState } from "@/components/store/store";
import { formatNumberToThousands, StatCardThree } from "@/components/reusables";
import { addProductOrder, getShippingAddress } from "@/services/api/request";
import { router } from "expo-router";

type ItemProps = {
  id?: string;
  title: string;
  description: string;
  price: number;
  qty: number;
  image: any;
};

export default function OrderConfirmation() {
  const [address, setAddress] = useState<any>();
  const [, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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

  const onIncreaseQuantity = (productId: string) => {
    dispatch(increaseQuantity({ id: productId }));
  };

  const onDecreaseQuantity = (productId: string) => {
    dispatch(decreaseQuantity({ id: productId }));
  };
  const handlePayNow = async () => {
    if (!checkout) return;

    await WebBrowser.openBrowserAsync(checkout);
  };
  const CartItem = ({
    id,
    title,
    image,
    description,
    price,
    qty,
  }: ItemProps) => {
    return (
      <View className="flex flex-row items-center mt-4 justify-between ">
        <View className="rounded-[8px]  flex flex-row  p-2">
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
    const fetchAddress = async () => {
      try {
        const response = await getShippingAddress("67367ece6cec8afc58094a1e");
        console.log("response", response);
        setAddress(response.data);
      } catch (error: any) {
        setError(error);
      }
    };

    fetchAddress();
  }, []);
  const ProductOrder = async () => {
    const itemsToSend = cartItem.map((item) => ({
      product: item.id,
      count: item.quantity,
    }));
    const payload = {
      cart: itemsToSend,
      deliveryAddress: "selectedAddress", // string
      deliveryCost: 500, // number
    };
    console.log("payload", payload);
    try {
      setLoading(true);
      const response = await addProductOrder({ cart: itemsToSend });
      if (response.status === 201) {
        const responseData = response.data.message;
        console.log("responseData", responseData);

        if (response.data.data.checkoutLink) {
          setCheckout(response.data.data.checkoutLink);
        }
      } else {
        const errorData = await response.data.message;
        console.log("errorData", errorData);
      }
    } catch (error: any) {
      console.log("error.response.data.message,", error.response.data.message);
    }
    setLoading(false);
  };
  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  return (
    <SafeAreaView
      edges={["bottom"]}
      className="flex-1 flex bg-[#F8F8FF] "
      style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
    >
      <ScrollView className=" mx-4" showsVerticalScrollIndicator={false}>
        <View className="flex flex-col gap-[40px] mt-4">
          <View className="flex flex-col gap-[24px]">
            <View className="flex flex-col gap-[12px]">
              <Pressable
                onPress={() => router.push("/shippingAddress")}
                style={styles.card}
                className="flex flex-row justify-between items-center px-[22px] py-[16px] bg-white rounded-[8px]"
              >
                <View className="flex flex-col gap-[6px] w-5/6">
                  <Text
                    className=" text-[16px] text-[#050404] "
                    style={{ fontFamily: "Manrope_700Bold" }}
                  >
                    Shipping Address
                  </Text>
                  <Text
                    className=" text-[12px] text-[#585757] "
                    style={{ fontFamily: "Manrope_700Bold" }}
                  >
                    3 Zeb Street, Ogbuodor Layout, Maryland, Enugu South, Enugu
                    State, Nigeria, 400102.
                  </Text>
                </View>
                <View className="w-1/6 flex flex-row items-center justify-center">
                  <FontAwesome6
                    name="chevron-right"
                    size={24}
                    color="#585757"
                  />
                </View>
              </Pressable>
              <View
                style={styles.card}
                className="flex flex-row justify-between items-center px-[22px] py-[16px] bg-white rounded-[8px]"
              >
                <View className="flex flex-col gap-[6px] w-5/6">
                  <Text
                    className=" text-[16px] text-[#050404] "
                    style={{ fontFamily: "Manrope_700Bold" }}
                  >
                    Shipping Address
                  </Text>
                  <Text
                    className=" text-[12px] text-[#585757] "
                    style={{ fontFamily: "Manrope_700Bold" }}
                  >
                    3 Zeb Street, Ogbuodor Layout, Maryland, Enugu South, Enugu
                    State, Nigeria, 400102.
                  </Text>
                </View>
                <View className="w-1/6 flex flex-row items-center justify-center">
                  <FontAwesome6
                    name="chevron-right"
                    size={24}
                    color="#585757"
                  />
                </View>
              </View>
            </View>
            <View>
              <View className="">
                <View className="flex flex-row justify-between pt-2 items-center ">
                  <View className="flex flex-row items-center">
                    <Text
                      className=" text-[18px] mr-[4px] "
                      style={{ fontFamily: "Manrope_700Bold" }}
                    >
                      Items
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
                  <Ionicons name="trash-outline" size={24} color="black" />
                </View>

                <FlatList
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
                  scrollEnabled={false}
                />
              </View>
            </View>
            <View className="flex flex-row items-center justify-between">
              <Text
                className=" text-[18px] text-[#050404] text-center"
                style={{ fontFamily: "Manrope_800ExtraBold" }}
              >
                Total
              </Text>
              <Text
                className=" text-[18px] text-[#050404] text-center"
                style={{ fontFamily: "Manrope_700Bold" }}
              >
                ₦ {formatNumberToThousands(totalSelectedCost)}
              </Text>
            </View>
          </View>
          {!checkout && (
            <Pressable
              onPress={ProductOrder}
              className="bg-[#FF6EC7] h-[48px] rounded-[8px] flex flex-col items-center justify-center"
            >
              <Text
                className=" text-[16px] text-white text-center"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Proceed
              </Text>
            </Pressable>
          )}
          {checkout && (
            <Pressable
              onPress={handlePayNow}
              className="bg-[#FF6EC7] h-[48px] rounded-[8px] flex flex-col items-center justify-center"
            >
              <Text
                className=" text-[16px] text-white text-center"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    shadowColor: "#585757",
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
