import {
  Text,
  View,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Octicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProduct, getProducts } from "@/services/api/request";
import CarouselWithThumbnails, {
  formatNumberToThousands,
  RatingStars,
} from "@/components/reusables";
import { useDispatch } from "react-redux";
import { addToCart } from "@/components/store/slice/cartSlice";
import { ProductPropsType } from "@/types/type";
import { ProductRows } from "@/components/flatListItems/items";
import { useAppSelector } from "@/components/store/hooks";
import { RootState } from "@/components/store/store";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
export default function Page() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const [product, setProduct] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any>();
  const [limit, setLimit] = useState(10);
  const [quantity, setQuantity] = useState(1);
  const { cart: cartItem } = useAppSelector((state: RootState) => state.cart);

  const dispatch = useDispatch();
  const increaseQty = () => setQuantity((q) => q + 1);

  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // const onAddToCart = (product: ProductPropsType | null, quantity: number) => {
  //   dispatch(addToCart({ ...product, quantity }));
  //   Toast.show({
  //     type: "success", // 'success' | 'error' | 'info'
  //     text1: "Added to Cart",
  //     text2: `${product?.title} x${quantity} added`,
  //     position: "top",
  //     visibilityTime: 1500, // 2 seconds
  //     // autoHide: true,
  //   });
  // };
  const onAddToCart = (product: ProductPropsType | null, quantity: number) => {
    if (!product) return;
    const existingItem = cartItem.find((i) => i.id === product.id);
    dispatch(addToCart({ ...product, quantity }));

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Toast.hide();
    Toast.show({
      type: "success",
      text1: existingItem ? "Quantity Updated" : "Added to Cart",
      text2: `${product.title} x${quantity} added`,
      position: "top",
      visibilityTime: 1500,
    });
  };

  const { id } = useLocalSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productRes, productsRes] = await Promise.all([
          getProduct(id as string),
          getProducts(limit),
        ]);

        setProduct(productRes.data);
        setProducts(productsRes);
      } catch (error: any) {
        setError(error?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F8FF]">
      <View className="flex flex-row justify-between pt-2 items-center px-4">
        <Pressable
          onPress={() => {
            router.back();
          }}
        >
          <Octicons
            name="chevron-left"
            size={24}
            color="#373636"
            className=""
          />
        </Pressable>

        <Pressable
          onPress={() => {
            router.push("/cart");
          }}
        >
          <MaterialCommunityIcons
            name="cart-outline"
            size={24}
            color="#373636"
          />
          <View className="absolute -top-2 -right-2 bg-[#FF6EC7] w-5 h-5 rounded-full items-center justify-center">
            <Text className="text-white text-[10px] font-bold">
              {cartItem.length}
            </Text>
          </View>
        </Pressable>
      </View>
      {/* Content */}
      <ScrollView className="flex-1">
        {/* Product Header */}
        <View className="pt-4 px-4">
          <CarouselWithThumbnails
            images={product?.images}
            height={213}
            borderRadius={12}
            thumbnailSize={86}
            thumbnailSpacing={8}
          />

          <View className="mt-4">
            <Text
              style={{ fontFamily: "Raleway_700Bold_Italic" }}
              className="text-[20px] mb-2"
            >
              {product?.title}
            </Text>

            <Text className="text-[12px] text-[#585757]">
              {product?.category?.name}
            </Text>
          </View>

          <View className="flex-row items-center gap-4 mt-2">
            <RatingStars rating={product?.averageRating} />
          </View>

          <Text className="text-[20px] font-bold mt-2">
            ₦{formatNumberToThousands(product?.price)}
          </Text>

          {/* Details */}
          <View className="mt-6">
            <Text className="font-bold text-[14px]">Product Details</Text>
            <Text className="text-[12px] mt-2">{product?.description}</Text>
          </View>

          <View className="mt-6 flex flex-col">
            <Text className="font-bold text-[14px]">Return Policy</Text>
            <Text className="text-[12px] mt-2">
              Free return within 7 days for all eligible items and full refund
            </Text>
          </View>
        </View>

        {/* Popular Products */}
        <View className="px-4 mt-8 pb-6">
          <Text className="text-[18px] font-bold mb-4">
            Most Popular Products
          </Text>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={products?.data?.slice(-4)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductRows
                id={item.id}
                title={item.title}
                image={item.coverImage}
                description={item.description}
                price={item.price}
                averageRating={item.averageRating}
              />
            )}
          />
        </View>
      </ScrollView>
      <View className="bg-[#FFFFFF] py-[20px] px-[16px] border-[#FFF1F9] border-[1px]">
        <View className="flex flex-row justify-between gap-[8px]">
          <View className="flex-row items-center border border-[#FF6EC7] rounded px-3 py-2">
            <Pressable onPress={decreaseQty} className="px-2">
              <Text className="text-[#FF6EC7] text-lg">−</Text>
            </Pressable>

            <Text className="mx-3 text-[16px] font-bold">{quantity}</Text>

            <Pressable onPress={increaseQty} className="px-2">
              <Text className="text-[#FF6EC7] text-lg">+</Text>
            </Pressable>
          </View>

          <Pressable
            className="flex-1 py-3 border border-[#FF6EC7] rounded"
            onPress={() => onAddToCart(product, quantity)}
          >
            <Text className="text-center text-[#FF6EC7]">Add to cart</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
