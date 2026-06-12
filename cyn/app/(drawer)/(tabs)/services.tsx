import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  Octicons,
  AntDesign,
  Entypo,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import {
  createWithdrawalRequest,
  getBanks,
  getBookingsPayment,
  getProducts,
  getServiceProvider,
  getServiceProviders,
  getServiceProviderStats,
  getUser,
} from "@/services/api/request";
import {
  AppModal,
  DistanceSlider,
  EmptyList,
  FilterCheckbox,
  formatAppointmentDate,
  formatNumberToThousands,
  StatCardThree,
  TransactionHistoryBody,
  WithdrawFundsModal,
} from "@/components/reusables";
import { BookingStatsData, Category } from "@/types/type";
import { Payments, Service } from "@/components/flatListItems/items";
import { router, useNavigation } from "expo-router";
import { useAuth } from "@/components/AuthContext";
import { FilterSheet } from "@/components/filterSheet";
import { ProvidersMap } from "@/components/ProvidersMap";

import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerActions, ParamListBase } from "@react-navigation/native";

type Filters = {
  homeService: boolean;
  availableNow: boolean;
  maxDistanceKm: number;
};

export default function Tab() {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [serviceProvicders, setServicProviders] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  const [payments, setPayments] = useState<any[]>([]);
  const [page, setPage] = useState<"list" | "map">("list");
  const [filter, setFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openHistory, setOpenHistory] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [sendReminder, setSendReminder] = useState(false);
  const [address, setAddress] = useState<string>("Getting location...");
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [payment, setPayment] = useState<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [bankAccounts, setBankAccounts] = useState<
    { id: string; bankName: string; accountNumber: string; accountName: string }[]
  >([]);
  const [withdrawing, setWithdrawing] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const DEFAULT: Filters = {
    homeService: false,
    availableNow: false,
    maxDistanceKm: 10,
  };
  const [stats, setStats] = useState<BookingStatsData>({
    cancelledBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    rating: 0,
    totalBookings: 0,
    totalRatings: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    totalServices: 0,
  });
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();

  const [filters, setFilters] = useState<Filters>(DEFAULT);
  const [state, setState] = useState<"pending" | "completed" | "cancelled">(
    "pending",
  );
  const listingsTabs = [
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setAddress("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      setUserLat(lat);
      setUserLng(lng);
      const places = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const place = places[0];

      if (place) {
        setAddress(
          `${place.district || place.subregion || ""}, ${place.city || place.region || ""}`,
        );
      }
    })();
  }, []);
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        const listRes = await getServiceProviders();

        setServicProviders(listRes);
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };
    const loadVendorData = async () => {
      try {
        setLoading(true);
        const provider = await getServiceProvider();
        if (!provider?.id) {
          throw new Error("Service provider ID not found");
        }
        const [payRes, providerStats, userProfile, banksRes] = await Promise.all([
          getBookingsPayment(),
          getServiceProviderStats(provider.id),
          getUser(),
          getBanks(),
        ]);

        setStats(providerStats);
        setPayments(payRes);
        setWalletBalance((userProfile as any)?.data?.wallet ?? 0);
        const rawBanks: any[] = (banksRes as any)?.data ?? (Array.isArray(banksRes) ? banksRes : []);
        setBankAccounts(
          rawBanks.map((b: any) => ({
            id: b._id ?? b.id,
            bankName: b.bankName,
            accountNumber: b.accountNumber,
            accountName: b.accountName,
          })),
        );
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };
    if (!user || user?.role === "customer") {
      loadCustomerData();
    } else {
      loadVendorData();
    }
  }, []);
  const fetchVendorServices = async () => {
    try {
      const provider = await getServiceProvider();
      if (!provider?.id) {
        throw new Error("Service provider ID not found");
      }
      const response = await getServiceProviders();
      setServicProviders(response);
      console.log("Fetched services:", response);
    } catch (err: any) {
      console.error("Error fetching services:", err);
      setError(err?.message);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true); // show the pull-to-refresh spinner
    await fetchVendorServices();
    setRefreshing(false); // hide spinner
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View className="flex flex-row justify-between">
      <Text
        className="text-[#6A7282] text-[14px]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {label}
      </Text>
      <Text
        className="text-[#101828] text-[14px] max-w-[70%]"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {value}
      </Text>
    </View>
  );
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  }
  return (
    <SafeAreaView
      className="flex-1 bg-[#F9FAFB]"
      style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
    >
      {(!user || user?.role === "customer") && (
        <View>
          <View className="px-4 mb-4 bg-white pb-4">
            <Text
              className="text-[16px] mb-4 mt-2"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              Find Your Perfect Stylist
            </Text>
            <View className="flex-row items-center gap-[4px] mb-[4px]">
              <Pressable onPress={openDrawer}>
                <View style={[styles.iconBtn]}>
                  <Ionicons name="menu" size={24} color="#FF6EC7" />
                </View>
              </Pressable>
              <View className="flex-row items-center h-[50px] bg-white rounded-full px-4 border border-[#D1D5DC] flex-1">
                <Octicons name="search" size={22} color="#B2B1B1" />
                <TextInput
                  placeholder="Search"
                  placeholderTextColor="#B2B1B1"
                  className="flex-1 ml-2"
                />
              </View>
            </View>

            <View className="flex-row justify-between items-center mt-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="location-outline" size={16} color="#F6339A" />
                <Text
                  className="text-[14px] text-[#4A5565]"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  {address}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setOpen((prev) => !prev)}
                  className={`h-8 w-8 rounded-full items-center justify-center ${
                    open ? "bg-[#F6339A]" : "bg-[#F3F4F6]"
                  }`}
                >
                  <Octicons
                    name="filter"
                    size={16}
                    color={filter ? "#fff" : "#364153"}
                  />
                </Pressable>

                <View className="flex-row bg-[#F3F4F6] p-1 rounded-full">
                  <Pressable
                    onPress={() => setPage("list")}
                    className={`h-8 w-8 rounded-full items-center justify-center ${
                      page === "list" ? "bg-white" : ""
                    }`}
                  >
                    <AntDesign name="unordered-list" size={16} />
                  </Pressable>

                  <Pressable
                    onPress={() => setPage("map")}
                    className={`h-8 w-8 rounded-full items-center justify-center ${
                      page === "map" ? "bg-white" : ""
                    }`}
                  >
                    <Entypo name="map" size={16} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
          <ScrollView className="">
            {page === "list" && (
              <View className="bg-[#F9FAFB] ">
                <FlatList
                  scrollEnabled={false}
                  data={serviceProvicders}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ padding: 16 }}
                  renderItem={({ item }) => (
                    <Service
                      id={item.id}
                      isAvailableForHomeService={item.isAvailableForHomeService}
                      experience={item.experience}
                      businessName={item.businessName}
                      image={item.images?.[0] ?? ""}
                      description={item.description}
                      businessHours={item.businessHours}
                      businessAddress={item.businessAddress}
                    />
                  )}
                  ListEmptyComponent={
                    <EmptyList message="No service providers available" />
                  }
                  ListFooterComponent={<View className="h-28" />}
                  onRefresh={onRefresh}
                  refreshing={refreshing}
                />
              </View>
            )}
          </ScrollView>
        </View>
      )}
      {user && user.role === "businessOwner" && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="bg-[#F9FAFB] px-4 flex flex-col gap-[24px]">
            <View className="bg-white border-[#E5E7EB] border-[1.24px] rounded-[16px] p-[16px] gap-[24px]">
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-col gap-[8px]">
                  <Text
                    className="text-[#6A7282] text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Available Balance
                  </Text>
                  <Text
                    className="text-[#101828] text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    ₦{formatNumberToThousands(walletBalance)}
                  </Text>
                </View>
                <Pressable
                  className="h-[48px] bg-[#E60076] rounded-[14px] flex flex-row items-center justify-center gap-[8px] px-[24px]"
                  onPress={() => setOpenWithdraw(true)}
                >
                  <MaterialCommunityIcons
                    name="arrow-top-right"
                    size={20}
                    color="white"
                  />
                  <Text
                    className="text-[#ffffff] text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Withdraw
                  </Text>
                </Pressable>
              </View>
              <View className="flex flex-row flex-wrap justify-between">
                <View className="w-[48%] mb-4">
                  <StatCardThree
                    icon={
                      <Feather name="dollar-sign" size={16} color="black" />
                    }
                    value={`₦${stats.pendingRevenue || 0}`}
                    label="Pending"
                  />
                </View>

                <View className="w-[48%] mb-4">
                  <StatCardThree
                    icon={<Feather name="calendar" size={16} color="black" />}
                    value={stats.totalRevenue ? `₦${stats.totalRevenue}` : "₦0"}
                    label="Total Earnings"
                  />
                </View>
              </View>
              <Pressable
                onPress={() => setOpenHistory(true)}
                className="h-[44px]  border-[#D1D5DC] border-[1.24px] rounded-[14px] flex flex-row items-center justify-center "
              >
                <Text
                  className="text-[#364153] text-[14px]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  View Transaction History
                </Text>
              </Pressable>
            </View>
            <View className="bg-white border-[#E5E7EB] border-[1.24px] rounded-[16px] p-[16px] gap-[24px]">
              <View className="flex flex-row gap-[8px]">
                {listingsTabs.map((tab) => {
                  const active = state === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => setState(tab.key as any)}
                      className={`rounded-[10px] h-[36px] px-[12px] flex items-center justify-center ${
                        active ? "bg-[#F6339A]" : "bg-[#ffffff]"
                      }`}
                    >
                      <Text
                        className={`text-[16px] ${
                          active ? "text-[#ffffff]" : "text-[#4A5565]"
                        }`}
                        style={{ fontFamily: "Manrope_400Regular" }}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View className="h-[50.43px] bg-[#F9FAFB]  flex-row items-center px-[16px] w-full border-[#E5E7EB] border-[1px] rounded-[10px]">
                <Octicons name="search" size={24} color="#B2B1B1" />
                <TextInput
                  placeholder="Search..."
                  placeholderTextColor="#B2B1B1"
                  className="flex-1 mx-[8px]"
                />
              </View>
            </View>

            <FlatList
              scrollEnabled={false}
              data={payments?.slice(-3)}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <Payments
                  title={item.title}
                  image={item.customerId.avatarURL}
                  customerName={item.customerId.fullName}
                  price={item.amount}
                  bookingDate={item.bookingId.appointmentDate}
                  status={item.bookingId.status}
                  paymentType={item.bookingId.paymentOption}
                  platformFee={item.platformFee}
                  deadline={item.paymentDeadline}
                  onViewDetails={() => {
                    setPayment(item);
                    setOpenBooking(true);
                  }}
                  onSendReminder={() => {
                    setPayment(item);
                    setSendReminder(true);
                  }}
                />
              )}
              ListFooterComponent={
                <View className="bg-[#FDF2F8] border-[#FCCEE8] border-[1.24px] p-[25px] rounded-[14px] gap-[12px]">
                  <Text
                    className="text-[#861043] text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Payment & Cancellation Policy
                  </Text>
                  <View className="flex flex-col gap-[8px]">
                    <Text
                      className="text-[#861043] text-[14px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      • Platform charges 5% service fee on all bookings
                    </Text>
                    <Text
                      className="text-[#861043] text-[14px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      • Reserve Now: Customer must pay by 60% of days between
                      booking and appointment date
                    </Text>
                    <Text
                      className="text-[#861043] text-[14px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      • If you cancel after the 60% date, you must provide full
                      refund to customer
                    </Text>
                    <Text
                      className="text-[#861043] text-[14px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      • Late cancellations result in loss of 5% service charge
                      to platform
                    </Text>
                    <Text
                      className="text-[#861043] text-[14px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      • All communications must be done through platform chat
                      for evidence and protection
                    </Text>
                    <Text
                      className="text-[#861043] text-[14px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      • For emergencies, contact Cyndarrella support to arrange
                      reschedule or compensation
                    </Text>
                  </View>
                </View>
              }
              ListEmptyComponent={<EmptyList message="No payment available" />}
              contentContainerStyle={{ paddingBottom: 200 }}
            />
          </View>
        </ScrollView>
      )}
      {(!user || user?.role === "customer") && page === "map" && (
        <View style={{ flex: 1 }}>
          <ProvidersMap
            userLat={userLat}
            userLng={userLng}
            providers={serviceProvicders}
            onSelectProvider={(p) => {
              router.push(`/serviceProvider/${p.id}`);
            }}
          />
        </View>
      )}

      <FilterSheet<Filters>
        title="Filters"
        isOpen={open}
        value={filters}
        defaultValue={DEFAULT}
        onClose={() => setOpen(false)}
        onApply={(next) => setFilters(next)}
        renderContent={({ draft, setDraft }) => (
          <View style={{ gap: 14 }}>
            <FilterCheckbox
              label="Home service available"
              checked={draft.homeService}
              onChange={(val) =>
                setDraft((prev) => ({ ...prev, homeService: val }))
              }
            />

            <FilterCheckbox
              label="Available now"
              checked={draft.availableNow}
              onChange={(val) =>
                setDraft((prev) => ({ ...prev, availableNow: val }))
              }
            />

            <DistanceSlider
              value={draft.maxDistanceKm}
              max={30}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, maxDistanceKm: v }))
              }
            />
            {/* slider component here -> setDraft(p => ({...p, maxDistanceKm: value})) */}
          </View>
        )}
      />
      <WithdrawFundsModal
        visible={openWithdraw}
        onClose={() => setOpenWithdraw(false)}
        availableBalance={walletBalance}
        accounts={bankAccounts}
        onAddNewBank={() => {
          setOpenWithdraw(false);
          router.push("/banks");
        }}
        onConfirmWithdrawal={async ({ amount }) => {
          if (withdrawing) return;
          try {
            setWithdrawing(true);
            await createWithdrawalRequest(amount);
            setWalletBalance((prev) => Math.max(0, prev - amount));
            setOpenWithdraw(false);
          } catch {
            // modal stays open on error
          } finally {
            setWithdrawing(false);
          }
        }}
      />
      <AppModal
        visible={openHistory}
        onClose={() => setOpenHistory(false)}
        title="Transaction History"
      >
        <TransactionHistoryBody
          transactions={[
            {
              id: "1",
              type: "payment",
              title: "Payment received",
              subtitle: "Sarah Williams • Manicure & Pedicure",
              date: "Dec 3, 2025 • 2:30 PM",
              amount: 176,
            },
            {
              id: "2",
              type: "fee",
              title: "Platform service fee",
              subtitle: "Manicure & Pedicure",
              date: "Dec 3, 2025 • 2:30 PM",
              amount: -4,
            },
            {
              id: "3",
              type: "withdrawal",
              title: "Withdrawal to GTBank",
              subtitle: "WD-87654321",
              date: "Dec 1, 2025 • 10:15 AM",
              amount: -200000,
            },
          ]}
        />
      </AppModal>
      <AppModal
        visible={openBooking}
        onClose={() => setOpenBooking(false)}
        title="Booking Details"
      >
        <View className="flex flex-col gap-[16px]">
          <InfoRow label="Customer" value={payment?.customerId?.fullName} />
          <InfoRow
            label="Service"
            value={
              payment?.bookingId?.services
                ?.map((service: any) => service.name)
                .join(", ") || "No service"
            }
          />
          <InfoRow
            label="Amount"
            value={
              payment?.amount
                ? `₦${formatNumberToThousands(payment.amount)}`
                : "₦0"
            }
          />

          <InfoRow
            label="Payment Type"
            value={payment?.bookingId?.paymentOption}
          />
          <InfoRow
            label="Booking Date"
            value={formatAppointmentDate(payment?.bookingId?.appointmentDate)}
          />
          <InfoRow
            label="Due Date"
            value={formatAppointmentDate(payment?.paymentDeadline)}
          />

          <View className="flex justify-end items-end">
            <Pressable
              onPress={() => setOpenBooking(false)}
              className="bg-[#E5E7EB] h-[40px] rounded-[10px] w-[70px] flex items-center justify-center mt-[16px]"
            >
              <Text
                className="text-[#101828] text-[14px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </AppModal>
      <AppModal
        visible={sendReminder}
        onClose={() => setSendReminder(false)}
        title="Send Reminder"
      >
        <View className="flex flex-col gap-[16px]">
          <Text
            className="text-[#4A5565] text-[16px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            Are you sure you want to send a reminder to Jane Doe for their
            payment?
          </Text>

          <View className="flex justify-end items-end flex-row  gap-[12px]">
            <Pressable
              onPress={() => setSendReminder(false)}
              className="bg-[#E5E7EB] h-[40px] rounded-[10px] w-[70px] flex items-center justify-center mt-[16px]"
            >
              <Text
                className="text-[#101828] text-[14px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable className="bg-[#F6339A] h-[40px] rounded-[10px] w-[139px] flex items-center justify-center mt-[16px]">
              <Text
                className="text-[#ffffff] text-[14px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Send Reminder
              </Text>
            </Pressable>
          </View>
        </View>
      </AppModal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
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
