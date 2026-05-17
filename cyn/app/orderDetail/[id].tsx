import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { OrderThumbnail } from "@/components/flatListItems/items";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { PRODUCT_ORDER_STATUS, TimelineEvent } from "@/types/type";
import { addCommasToNumber } from "@/helpers/functions";
import { getProduct, getProductOrderById } from "@/services/api/request";

type Product = {
  title: string;
  images?: string[];
  price?: number;
};

type CartItem = {
  id: string;
  count: number;
  product: Product;
};

export type Order = {
  id: string;
  orderId: string;
  status: PRODUCT_ORDER_STATUS;
  totalAmount: number;
  trackingNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  cart: CartItem[];
};

const money = (n: number) => `₦${addCommasToNumber(Math.round(n))}`;

const statusLabelMap: Record<PRODUCT_ORDER_STATUS, string> = {
  [PRODUCT_ORDER_STATUS.PENDING]: "Pending",
  [PRODUCT_ORDER_STATUS.PACKAGED]: "Packed",
  [PRODUCT_ORDER_STATUS.SHIPPED]: "Shipped",
  [PRODUCT_ORDER_STATUS.DELIVERED]: "Delivered",
};

// Stepper expects: 0=Packed, 1=Shipped, 2=Delivered
const progressStepFromStatus = (status: PRODUCT_ORDER_STATUS): 0 | 1 | 2 => {
  switch (status) {
    case PRODUCT_ORDER_STATUS.PENDING:
      return 0;
    case PRODUCT_ORDER_STATUS.PACKAGED:
      return 0;
    case PRODUCT_ORDER_STATUS.SHIPPED:
      return 1;
    case PRODUCT_ORDER_STATUS.DELIVERED:
      return 2;
    default:
      return 0;
  }
};

const formatTime = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const buildTimelineFromOrder = (order: Order): TimelineEvent[] => {
  const tCreated = formatTime(order?.createdAt);
  const tUpdated = formatTime(order?.updatedAt);

  if (order?.status === PRODUCT_ORDER_STATUS.PENDING) {
    return [
      {
        id: "pending",
        title: "Pending",
        timeText: tCreated,
        description: "Your order has been received and is being processed.",
      },
    ];
  }

  if (order?.status === PRODUCT_ORDER_STATUS.PACKAGED) {
    return [
      {
        id: "packed",
        title: "Packed",
        timeText: tUpdated || tCreated,
        description: "Your parcel has been packaged and is ready to move.",
      },
    ];
  }

  if (order?.status === PRODUCT_ORDER_STATUS.SHIPPED) {
    return [
      {
        id: "packed",
        title: "Packed",
        timeText: tCreated,
        description: "Your parcel has been packaged and is ready to move.",
      },
      {
        id: "shipped",
        title: "Shipped",
        timeText: tUpdated,
        description: "Your parcel is on its way.",
      },
    ];
  }

  // DELIVERED
  return [
    {
      id: "packed",
      title: "Packed",
      timeText: tCreated,
      description: "Your parcel has been packaged and is ready to move.",
    },
    {
      id: "shipped",
      title: "Shipped",
      timeText: tUpdated || tCreated,
      description: "Your parcel is on its way.",
    },
    {
      id: "delivered",
      title: "Delivered",
      timeText: tUpdated,
      description: "Your parcel has been delivered.",
      tone: "success",
    },
  ];
};

function Dot({ state }: { state: "done" | "todo" }) {
  return (
    <View className="items-center justify-center">
      <View
        className={`w-[12px] h-[12px] rounded-full ${
          state === "done" ? "bg-[#22C55E]" : "bg-[#D1D5DB]"
        }`}
      />
    </View>
  );
}

function Stepper({ step }: { step: 0 | 1 | 2 }) {
  const left = step >= 1 ? "bg-[#22C55E]" : "bg-[#E5E7EB]";
  const right = step >= 2 ? "bg-[#22C55E]" : "bg-[#E5E7EB]";

  return (
    <View>
      <Text
        className="text-[11px] text-[#585757]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        Track Your Order
      </Text>

      <View className="mt-2">
        <View className="flex-row items-center">
          <Dot state="done" />
          <View className={`flex-1 h-[3px] mx-2 rounded-full ${left}`} />
          <Dot state={step >= 1 ? "done" : "todo"} />
          <View className={`flex-1 h-[3px] mx-2 rounded-full ${right}`} />
          <Dot state={step >= 2 ? "done" : "todo"} />
        </View>

        <View className="flex-row justify-between mt-2">
          <Text
            className="text-[10px] text-[#585757]"
            style={{ fontFamily: "Manrope_500Medium" }}
          >
            Packed
          </Text>
          <Text
            className="text-[10px] text-[#585757]"
            style={{ fontFamily: "Manrope_500Medium" }}
          >
            Shipped
          </Text>
          <Text
            className="text-[10px] text-[#585757]"
            style={{ fontFamily: "Manrope_500Medium" }}
          >
            Delivered
          </Text>
        </View>
      </View>
    </View>
  );
}

function TimelineRow({ e, isLast }: { e: TimelineEvent; isLast: boolean }) {
  const isSuccess = e.tone === "success";
  const dotBg = isSuccess ? "bg-[#22C55E]" : "bg-[#22C55E]";
  const titleColor = isSuccess ? "text-[#050404]" : "text-[#050404]";

  return (
    <View className="flex-row gap-3 mt-4">
      <View className="items-center">
        <View className={`w-[10px] h-[10px] rounded-full ${dotBg}`} />
        {!isLast && <View className="w-[2px] flex-1 bg-[#E5E7EB] mt-2" />}
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-start">
          <Text
            className={`text-[12px] ${titleColor}`}
            style={{ fontFamily: "Manrope_700Bold" }}
          >
            {e.title}
          </Text>
          {!!e.timeText && (
            <Text
              className="text-[10px] text-[#8A8A8A]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {e.timeText}
            </Text>
          )}
        </View>

        {!!e.description && (
          <Text
            className="text-[10px] text-[#8A8A8A] mt-1 leading-4"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {e.description}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function OrderTrackingScreen() {
  const [order, setProductOrder] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const itemCount = useMemo(
    () => order?.cart?.reduce((sum: number, c: any) => sum + (c.count || 0), 0),
    [order?.cart],
  );
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const productRes = await getProductOrderById(id as string);

        setProductOrder(productRes.data);
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
  const collageImages = useMemo(
    () =>
      order?.cart
        ?.map((c: any) => c.product?.images?.[0])
        .filter(Boolean) as string[],
    [order?.cart],
  );

  const progressStep = progressStepFromStatus(order?.status);
  const statusLabel = order?.status
    ? statusLabelMap[order.status as PRODUCT_ORDER_STATUS]
    : "";
  const timeline = useMemo(() => buildTimelineFromOrder(order), [order]);

  const copyTracking = async () => {
    if (!order.trackingNumber) return;
    await Clipboard.setStringAsync(order.trackingNumber);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F8FF]">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="w-[40px] h-[40px] items-center justify-center rounded-full bg-white border border-[#E6E6E6]"
        >
          <Text style={{ fontSize: 18 }}>‹</Text>
        </Pressable>

        <Text
          className="text-[14px] text-[#050404]"
          style={{ fontFamily: "Manrope_700Bold" }}
        >
          To Receive
        </Text>

        <View className="w-[40px] h-[40px]" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white border border-[#E6E6E6] rounded-[12px] p-3">
          <View className="flex-row gap-3">
            <View className="w-[92px]">
              <View className="rounded-[10px] overflow-hidden border border-[#E6E6E6] bg-[#F3F3F3]">
                <OrderThumbnail
                  images={collageImages}
                  size={92}
                  borderRadius={10}
                />
              </View>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-[12px] text-[#050404]"
                  style={{ fontFamily: "Manrope_700Bold" }}
                >
                  Order {order?.orderId}
                </Text>

                <View className="bg-[#F9F9F9] rounded-[6px] px-3 py-[3px]">
                  <Text
                    className="text-[10px] text-[#050404]"
                    style={{ fontFamily: "Manrope_500Medium" }}
                  >
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </Text>
                </View>
              </View>

              <Text
                className="text-[10px] text-[#8A8A8A] mt-1"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Status: {statusLabel}
              </Text>

              <View className="mt-3 flex-row items-center justify-between">
                <View className="flex-row items-baseline">
                  <Text
                    className="text-[10px] text-[#585757]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Total:{" "}
                  </Text>
                  <Text
                    className="text-[14px] text-[#050404]"
                    style={{ fontFamily: "Manrope_700Bold" }}
                  >
                    {money(order?.totalAmount)}
                  </Text>
                </View>

                <Pressable className="bg-[#FF6EC7] rounded-[8px] px-4 py-2">
                  <Text
                    className="text-white text-[12px]"
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                  >
                    Track
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white border border-[#E6E6E6] rounded-[12px] p-3 mt-3">
          <Text
            className="text-[11px] text-[#050404]"
            style={{ fontFamily: "Manrope_600SemiBold" }}
          >
            Tracking Number
          </Text>

          <View className="flex-row items-center justify-between mt-2">
            <Text
              className="text-[10px] text-[#8A8A8A]"
              style={{ fontFamily: "Manrope_400Regular" }}
              numberOfLines={1}
            >
              {order?.trackingNumber ?? "—"}
            </Text>

            <Pressable
              onPress={copyTracking}
              disabled={!order?.trackingNumber}
              className={`w-[34px] h-[34px] items-center justify-center rounded-[10px] bg-[#F9F9F9] border border-[#E6E6E6] ${
                !order?.trackingNumber ? "opacity-40" : ""
              }`}
            >
              <Text style={{ fontSize: 14 }}>⧉</Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-white border border-[#E6E6E6] rounded-[12px] p-3 mt-3">
          <Stepper step={progressStep} />
        </View>

        <View className="mt-2 bg-white border border-[#E6E6E6] rounded-[12px] p-3">
          {timeline.map((e, idx) => (
            <TimelineRow
              key={e.id}
              e={e}
              isLast={idx === timeline?.length - 1}
            />
          ))}
        </View>

        <View className="mt-3 bg-white border border-[#E6E6E6] rounded-[12px] p-3">
          <Text
            className="text-[12px] text-[#050404]"
            style={{ fontFamily: "Manrope_700Bold" }}
          >
            Items
          </Text>

          <View className="mt-2">
            {order?.cart?.map((c: any) => (
              <View key={c.id} className="flex-row gap-3 py-2">
                <View className="w-[54px] h-[54px] rounded-[10px] overflow-hidden bg-[#F3F3F3] border border-[#E6E6E6]">
                  <Image
                    source={{ uri: c.product?.images?.[0] }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className="text-[12px] text-[#050404]"
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                    numberOfLines={1}
                  >
                    {c.product?.title ?? "Product"}
                  </Text>
                  <Text
                    className="text-[10px] text-[#8A8A8A] mt-1"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Qty: {c.count}
                  </Text>
                </View>

                <Text
                  className="text-[12px] text-[#050404]"
                  style={{ fontFamily: "Manrope_700Bold" }}
                >
                  {money((c.product?.price ?? 0) * (c.count ?? 1))}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
