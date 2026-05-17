import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBooking,
  getProducts,
  getServiceProviderById,
  getServicesByServiceProviderId,
  servicePayment,
} from "@/services/api/request";
import {
  CalendarPicker,
  EmptyList,
  formatNumberToThousands,
  getPercentage,
  InfoCard,
  InfoRowText,
  PaymentOptionCard,
  ServiceOptionCard,
  StatusModal,
  summarizeBusinessHours,
  TabButtons,
  TimeSlotGrid,
} from "@/components/reusables";
import { ProductPropsType } from "@/types/type";
import {
  SelectedService,
  ServiceDetails,
} from "@/components/flatListItems/items";
import { router, useLocalSearchParams } from "expo-router";
import BottomSheet from "@/components/bottomSheet";
import { useAuth } from "@/components/AuthContext";
import * as WebBrowser from "expo-web-browser";

interface ServiceItem {
  serviceId: string;
}

interface AppointmentFormData {
  providerId: string;
  services: ServiceItem[];
  appointmentDate: string;
  appointmentTime: string;
  serviceLocation: string;

  paymentOption: string;
  isHomeService: boolean;
}

export default function Tab() {
  const [selected, setSelected] = useState<"walkin" | "home" | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<
    "upfront" | "deferred" | null
  >(null);
  const [date, setDate] = useState<string | null>(null);
  const { user, isAuthenticated, logout } = useAuth();

  const [error, setError] = useState<string | null>(null);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [listings, setListings] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [state, setState] = useState(1);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isSheetVisible, setSheetVisible] = useState(false);
  const [serviceProvider, setServiceProvider] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [products, setProducts] = useState<ProductPropsType[]>();
  const [limit, setLimit] = useState(10);

  const { id } = useLocalSearchParams();

  const tabs = ["About", "Reviews", "Services"];
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<AppointmentFormData>({
    providerId: id as string,
    services: [
      {
        serviceId: "",
      },
    ],
    appointmentDate: "",
    appointmentTime: "",
    serviceLocation: "",

    paymentOption: "",
    isHomeService: true,
  });

  useEffect(() => {
    let mounted = true;

    const loadCustomerData = async () => {
      try {
        setPageLoading(true);

        const [serviceProviderRes, listingRes] = await Promise.all([
          getServiceProviderById(id as string),
          getServicesByServiceProviderId(id as string),
        ]);

        if (!mounted) return;
        setServiceProvider(serviceProviderRes.data);
        setListings(listingRes.data);
      } catch (err: any) {
        setError(err?.message);
      } finally {
        mounted && setPageLoading(false);
      }
    };

    loadCustomerData();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await getProducts(limit);
        mounted && setProducts(response.data);
      } catch (err: any) {
        setError(err?.message);
      } finally {
        mounted && setProductsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [limit]);
  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 3️⃣ Call your API
      const payload = {
        ...formData,
        appointmentDate: date,
        appointmentTime: selectedTime,
        serviceLocation: selected,
        paymentOption: selectedPayment,
      };
      // console.log("payload3444", payload);

      const response = await createBooking(payload);

      if (response) {
        if (selectedPayment === "deferred") {
          router.push("/(drawer)/(tabs)/services");
          setSheetVisible(false);
          setShowSuccess(true);
        }
        if (selectedPayment === "upfront") {
          const servicePayload = {
            paymentProcessor: "paystack",
            amount: totalCost,
            bookingId: response.data._id,
          };

          const checkOutLink = await servicePayment(servicePayload);

          await WebBrowser.openBrowserAsync(checkOutLink.data.checkoutLink);
          router.push("/(drawer)/(tabs)/services");
          setSheetVisible(false);
          setShowSuccess(true);
        }
      } else {
        setApiError(
          response.message || "Failed to add service. Please try again.",
        );
      }
    } catch (error: any) {
      setApiError(error.message || "Something went wrong. Please try again.");
      const message =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";

      console.log("EXTRACTED MESSAGE 👉", message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: "walkin" | "home") => {
    setSelected((prev) => (prev === id ? null : id));
  };
  const handleSelectPayment = (id: "upfront" | "deferred") => {
    setSelectedPayment((prev) => (prev === id ? null : id));
  };
  const OPTIONS = [
    {
      id: "walkin",
      title: "Walk-in Studio",
      description: `Visit ${serviceProvider?.businessAddress}`,
      icon: <Ionicons name="location-outline" size={24} color="#F6339A" />,
    },
    {
      id: "home",
      title: "Home Service",
      description: "Stylist comes to your location",
      extraText: "+ ₦2,000 travel fee",
      icon: <Feather name="home" size={24} color="#F6339A" />,
    },
  ];
  const PAYMENT_OPTIONS = [
    {
      id: "deferred",
      title: "Reserve Now, Pay Later",
      description: `Book without immediate payment`,
      icon: <Feather name="calendar" size={24} color="#F6339A" />,
      rules: [
        "✓ Reserve your slot immediately",
        "✓ Payment due at 60% of booking period",
        "✓ Email reminder sent before payment deadline",
        "✓ Free cancellation before payment deadline",
      ],
      warning: "⚠ After payment: 75% forfeit, 20% refund on cancellation",
    },

    {
      id: "upfront",
      title: "Pay Now (Recommended)",
      description: "Secure your appointment immediately",
      extraText: "+ ₦2,000 travel fee",
      icon: <MaterialIcons name="payment" size={24} color="#00C950" />,
      rules: [
        "✓ Appointment confirmed instantly",
        "✓ 100% refund before 60% period",
        "✓ Free reschedule before 60% period",
      ],
      warning: "⚠ After 60% period: 70% forfeit, 20% refund on cancellation",
    },
  ];

  const toggleSelect = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      // 🔥 Sync with formData.services
      setFormData((prevForm) => ({
        ...prevForm,
        services: Array.from(next).map((serviceId) => ({
          serviceId,
        })),
      }));

      return next;
    });
  }, []);

  const summary = useMemo(() => {
    if (!serviceProvider?.businessHours) return [];
    return summarizeBusinessHours(serviceProvider.businessHours);
  }, [serviceProvider?.businessHours]);

  const totalDuration = useMemo(() => {
    if (!listings.length || selectedItems.size === 0) return 0;

    return listings.reduce((total, item) => {
      if (selectedItems.has(item._id)) {
        return total + (item.durationMinutes ?? 0);
      }
      return total;
    }, 0);
  }, [listings, selectedItems]);

  const isDisabled = selectedItems.size < 1;
  const totalCost = useMemo(() => {
    return listings.reduce((sum, item) => {
      if (selectedItems.has(item._id)) {
        return sum + item.basePrice;
      }
      return sum;
    }, 0);
  }, [listings, selectedItems]);

  const totalTime = useMemo(() => {
    const totalMinutes = listings.reduce((sum, item) => {
      if (selectedItems.has(item._id)) {
        return sum + item.durationMinutes; // accumulate duration
      }
      return sum;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  }, [listings, selectedItems]);
  const isStepValid = useMemo(() => {
    switch (state) {
      case 1:
        return selected !== null; // services selected
      case 2:
        return date !== null && selectedTime !== null; // date selected
      case 3:
        return selectedPayment !== null;
      default:
        return true;
    }
  }, [state, date, selectedTime, selected, selectedPayment]);
  const handleNext = () => {
    if (!isStepValid) return;
    setState((prev) => prev + 1);
  };

  const handleBack = () => {
    setState((prev) => Math.max(1, prev - 1));
  };
  if (pageLoading || loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  }

  return (
    <View
      className="flex flex-1 bg-[#ffffff]"
      // style={{ paddingTop: Platform.OS === "android" ? 0 : 0 }}
    >
      <View className="relative">
        <Image
          source={{ uri: serviceProvider.images?.[0] ?? "" }}
          className="h-[272px] w-full"
        />
        <Pressable
          onPress={() => {
            router.back();
          }}
          className="absolute top-16 left-4 bg-white p-2 rounded-full"
        >
          <Octicons
            name="chevron-left"
            size={24}
            color="#373636"
            className=""
          />
        </Pressable>
      </View>
      <ScrollView className="pt-2 ">
        <View>
          <View className="flex gap-[8px] px-4 w-full mt-4">
            <View className="flex flex-row justify-between">
              <Text
                className="text-[16px]  text-[#101828]"
                style={{ fontFamily: "Manrope_600SemiBold" }}
              >
                {serviceProvider?.businessName}
              </Text>
              <View className="bg-[#F0FDF4] px-[10px] py-[2px] rounded-[80px]">
                <Text
                  className="text-[14px]  text-[#00A63E]"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  Available now
                </Text>
              </View>
            </View>

            <View className="flex flex-row gap-[8px] items-center w-full flex-wrap">
              <Ionicons name="location-outline" size={16} color="#4A5565" />
              <Text
                className="text-[14px] text-[#4A5565]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {serviceProvider?.businessAddress}
              </Text>
            </View>

            {summary.map((line) => (
              <Text
                key={line}
                className="text-[14px] text-[#4A5565]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {line}
              </Text>
            ))}

            <View className="flex flex-row gap-[12px]  ">
              <Text
                className="text-[13px]  text-[#8C8C8C]"
                style={{ fontFamily: "Manrope_600SemiBold" }}
              >
                Walk-in-studio
              </Text>
              <View className="bg-[#D1D5DC] h-[16px] w-[2px]"></View>

              <Text
                className="text-[14px] text-[#8C8C8C]"
                style={{ fontFamily: "Manrope_600SemiBold" }}
              >
                Home Service
              </Text>
            </View>

            <View className="flex flex-row gap-[12px] justify-between w-full">
              <Pressable className="bg-[#00C950] rounded-[42px] h-[44px] flex items-center justify-center px-[12px] flex-row gap-[8px]">
                <Ionicons name="chatbubble-outline" size={16} color="white" />
                <Text
                  className="text-[16px]  text-[#ffffff]"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  Open chat
                </Text>
              </Pressable>
              {user ? (
                <Pressable
                  disabled={isDisabled}
                  onPress={() => setSheetVisible(true)}
                  className={`
    flex-1 rounded-[42px] h-[44px]
    flex items-center justify-center
    px-[12px] flex-row gap-[8px]
    ${isDisabled ? "bg-[#F2A1C9]" : "bg-[#F6339A]"}
  `}
                  style={({ pressed }) => [
                    !isDisabled && pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text
                    className="text-[16px] text-[#ffffff]"
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                  >
                    {isDisabled ? "Select a service" : "Book Now"}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => router.push("/login")}
                  className={`
    flex-1 rounded-[42px] h-[44px]
    flex items-center justify-center
    px-[12px] flex-row gap-[8px] bg-[#F6339A]
 }
  `}
                >
                  <Text
                    className="text-[16px] text-[#ffffff]"
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                  >
                    Please Login
                  </Text>
                </Pressable>
              )}
            </View>
            <View className="bg-[#DADADA] mt-6 p-[16px] rounded-[16px] flex flex-row items-center justify-between">
              <View className="flex flex-col gap-[8px]">
                <Text
                  className="text-[12px] text-[#8C8C8C]"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  Experience
                </Text>
                <Text
                  className="text-[12px] text-[#585757]"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  {serviceProvider?.experience} years
                </Text>
              </View>
              <View className="flex flex-col gap-[8px]">
                <Text
                  className="text-[12px] text-[#8C8C8C]"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  Completed
                </Text>
                <Text
                  className="text-[12px] text-[#585757]"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  84 jobs
                </Text>
              </View>
              <View className="flex flex-col gap-[8px]">
                <Text
                  className="text-[12px] text-[#8C8C8C]"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  Response
                </Text>
                <Text
                  className="text-[12px] text-[#585757]"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  10 mins
                </Text>
              </View>
            </View>
            <View className="bg-[#0000001A] h-[2px]"></View>
            <View className="flex flex-col gap-[16px]">
              <TabButtons
                tabs={tabs}
                activeTab={activeTab}
                onChangeTab={setActiveTab}
              />
              {activeTab === 0 && (
                <View className="mb-24">
                  <Text
                    className="text-[12px] text-[#585757] "
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                  >
                    {serviceProvider?.businessDescription}
                  </Text>
                  <Text
                    className="text-[12px] text-[#585757] mt-2"
                    style={{ fontFamily: "Manrope_700Bold" }}
                  >
                    What we do
                  </Text>
                  <View className="mb-10">
                    {listings.map((list, index) => (
                      <View
                        key={index}
                        className="border-[#B2B1B1] mt-4 border-[1px] self-start px-[16px] py-[8px] rounded-[16px]"
                      >
                        <Text
                          className="text-[12px] text-[#585757] "
                          style={{ fontFamily: "Manrope_600SemiBold" }}
                        >
                          {list?.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {activeTab === 2 && (
                <View className="flex flex-col gap-[16px]">
                  <View className="bg-[#0000001A] h-[2px]"></View>

                  <View className="flex flex-col gap-[16px]">
                    <FlatList
                      scrollEnabled={false}
                      data={listings}
                      keyExtractor={(item) => item._id}
                      contentContainerStyle={{ gap: 16 }}
                      renderItem={({ item }) => (
                        <ServiceDetails
                          title={item.name}
                          time={item.durationMinutes}
                          image={item.image}
                          description={item.description}
                          price={item.basePrice}
                          isSelected={selectedItems.has(item._id)}
                          onPress={() => toggleSelect(item._id)}
                        />
                      )}
                      ListFooterComponent={<View style={{ height: 96 }} />}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={
                        <EmptyList message="No service available" />
                      }
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {selectedItems.size > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white pt-[22px] pb-[32px] px-[20px] border-t border-gray-200 flex-row justify-between items-center">
          <View className="flex flex-col gap-[4px]">
            <Text className="text-[14px] font-bold text-[#4A5565]">
              {selectedItems.size} service selected
            </Text>
            <View className="flex flex-row gap-[8px] items-center ">
              <MaterialIcons name="access-time" size={16} color="#4A5565" />
              <Text
                className="text-[14px] text-[#4A5565]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {totalDuration} mins
              </Text>
            </View>
          </View>

          {user ? (
            <Pressable
              onPress={() => setSheetVisible(true)}
              className="bg-[#F6339A] px-4 py-2 rounded-[41768300px] h-[48px] flex items-center flex-row"
            >
              <Text
                className="text-white font-semibold text-[16px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Book Now
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push("/login")}
              className="bg-[#F6339A] px-4 py-2 rounded-[41768300px] h-[48px] flex items-center flex-row"
            >
              <Text
                className="text-white font-semibold text-[16px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Please Login
              </Text>
            </Pressable>
          )}
        </View>
      )}
      <StatusModal
        visible={showSuccess}
        type="success"
        title="Success"
        message="Service Booked Successfully."
        buttonText="Continue"
        onClose={() => setShowSuccess(false)}
      />
      <BottomSheet
        state={state}
        visible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        title={
          state === 1
            ? "Select Service Type"
            : state === 2
              ? "Choose Date & Time"
              : state === 3
                ? "Payment Option"
                : state === 4
                  ? "Review Booking"
                  : ""
        }
        maxHeight={0.94}
        footer={
          <View className="flex flex-row gap-[12px]">
            {state > 1 && (
              <Pressable
                onPress={handleBack}
                className="flex-1 h-[48px] rounded-[42px] border border-pink-500
                 flex flex-row justify-center items-center gap-[8px]"
              >
                <Entypo name="chevron-left" size={20} color="#EC4899" />
                <Text className="text-pink-500">Back</Text>
              </Pressable>
            )}

            <Pressable
              disabled={!isStepValid}
              onPress={state < 4 ? handleNext : handleSubmit}
              className={`
      flex-1 h-[48px] rounded-[42px]
      flex flex-row justify-center items-center gap-[8px]
      ${isStepValid ? "bg-pink-500" : "bg-pink-300"}
    `}
              style={({ pressed }) => [
                isStepValid && pressed && { opacity: 0.8 },
              ]}
            >
              <Text className="text-white text-center">
                {state === 4 ? "Confirm" : "Continue"}
              </Text>
              <Entypo name="chevron-right" size={20} color="white" />
            </Pressable>
          </View>
        }
      >
        {state === 1 && (
          <View className="flex flex-col gap-[12px] mt-4">
            <View className="bg-[#F9FAFB] p-[16px] flex flex-col gap-[8px] rounded-[10px]">
              <Text
                className="text-[#4A5565] font-[400] text-[14px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                You have selected {selectedItems.size} service(s)
              </Text>
              <Text
                className="text-[#101828] font-[400] text-[16px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                ₦ {formatNumberToThousands(totalCost)}
              </Text>
            </View>
            <Text
              className="text-[#101828] font-[400] text-[16px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Where would you like your service?
            </Text>
            <View className="flex flex-col gap-[8px]">
              {OPTIONS.map((option) => (
                <ServiceOptionCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  extraText={option.extraText}
                  icon={option.icon}
                  selected={selected === option.id}
                  onPress={() => handleSelect(option.id as "walkin" | "home")}
                />
              ))}
            </View>
          </View>
        )}
        {state === 2 && (
          <View>
            <CalendarPicker value={date} onSelect={(d) => setDate(d)} />
            <TimeSlotGrid
              value={selectedTime}
              onSelect={(time) => setSelectedTime(time)}
            />
          </View>
        )}
        {state === 3 && (
          <View>
            <View className="flex flex-col gap-[8px] my-4">
              <View className="mb-4 flex-col gap-[8px]">
                {PAYMENT_OPTIONS.map((option) => (
                  <PaymentOptionCard
                    id={option.id}
                    key={option.id}
                    title={option.title}
                    description={option.description}
                    warning={option.warning}
                    icon={option.icon}
                    rules={option.rules}
                    selected={selectedPayment === option.id}
                    onPress={() =>
                      handleSelectPayment(option.id as "upfront" | "deferred")
                    }
                  />
                ))}
              </View>
              <InfoCard
                icon={<Feather name="info" size={20} color="#6A7282" />}
                title={"Important Information"}
                rules={[
                  "• All communication must be done via platform chat room",
                  "• Service charge: 5% of total amount",
                  "• Provider cancellation after 60%: Full refund (provider pays 5% fee)",
                  "• Emergency situations: Contact Cyndarrella support",
                ]}
              />
            </View>
          </View>
        )}
        {state === 4 && (
          <View className="flex flex-col gap-[24px] mt-4">
            <View className="flex flex-col gap-[12px]">
              <Text
                className="text-[#101828]  text-[16px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Selected Services
              </Text>
              <FlatList
                scrollEnabled={false}
                data={listings.filter((item) => selectedItems.has(item._id))}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ gap: 16 }}
                renderItem={({ item }) => (
                  <SelectedService
                    title={item.name}
                    time={item.durationMinutes}
                    image={item.image}
                    description={item.description}
                    price={item.basePrice}
                    isSelected={selectedItems.has(item._id)}
                  />
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <View className="flex flex-col gap-[12px]">
              <Text
                className="text-[#101828]  text-[16px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Booking Details
              </Text>
              <View className="rounded-[10px] bg-[#F9FAFB] p-[16px] flex flex-col gap-[12px]">
                <InfoRowText
                  icon={
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#6A7282"
                    />
                  }
                  label="Location"
                  value={serviceProvider?.businessAddress}
                />
                <InfoRowText
                  icon={<Feather name="calendar" size={20} color="#6A7282" />}
                  label="Date & Time"
                  value={`${date}  ${selectedTime}`}
                />
                <InfoRowText
                  icon={
                    <MaterialCommunityIcons
                      name="clock-time-four-outline"
                      size={20}
                      color="#6A7282"
                    />
                  }
                  label="Duration"
                  value={totalTime}
                />
              </View>
            </View>
            <View className="flex flex-col gap-[12px]">
              <Text
                className="text-[#101828]  text-[16px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Price Breakdown
              </Text>
              <View className="rounded-[10px] bg-[#F9FAFB] p-[16px] flex flex-col gap-[8px]">
                <View className="flex flex-row items-center justify-between">
                  <Text
                    className="text-[#4A5565]  text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Services
                  </Text>
                  <Text
                    className="text-[#101828]  text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    ₦ {formatNumberToThousands(totalCost)}
                  </Text>
                </View>
                <View className="flex flex-row items-center justify-between">
                  <Text
                    className="text-[#4A5565]  text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Service charge (5%)
                  </Text>
                  <Text
                    className="text-[#101828]  text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    ₦ {formatNumberToThousands(getPercentage(totalCost, 5))}
                  </Text>
                </View>
                <View className="flex flex-row items-center justify-between pt-[8px] border-[#0000001A] border-t-[1px]">
                  <Text
                    className="text-[#101828]  text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Total
                  </Text>
                  <Text
                    className="text-[#101828]  text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    ₦
                    {formatNumberToThousands(
                      totalCost + getPercentage(totalCost, 5),
                    )}
                  </Text>
                </View>
              </View>
            </View>
            <View className="bg-[#FDF2F8] border-[#FCCEE8] border-[1px] rounded-[10px] p-[16px]">
              <Text
                className="text-[#4A5565]  text-[14px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Payment Method
              </Text>
              <Text
                className="text-[#101828]  text-[16px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {selectedPayment === "upfront"
                  ? "Pay Now"
                  : "Reserve Now, Pay Later "}
              </Text>
            </View>
            <View className="bg-[#FEFCE8] border-[#FFF085] border-[1px] rounded-[10px] p-[16px] gap-[8px]">
              <Text
                className="text-[#4A5565]  text-[14px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                ⚠ Please Note:
              </Text>
              <Text
                className="text-[#101828]  text-[16px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                By confirming this booking, you agree to Adella&apos;s
                cancellation policy and terms of service. All communications
                regarding this booking must be done through the platform chat
                room to ensure transaction security.
              </Text>
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 10,
  },
  hList: {
    marginTop: 10,
    backgroundColor: "white",
    paddingVertical: 10,
    borderRadius: 4,
  },
  sectionTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 16,
  },
  sectionAction: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: "#FF6EC7",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderColor: "#FF6EC7",
    borderWidth: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
