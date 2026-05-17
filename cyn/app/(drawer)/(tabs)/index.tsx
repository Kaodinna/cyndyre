import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  Octicons,
  MaterialCommunityIcons,
  Feather,
  MaterialIcons,
  Entypo,
  AntDesign,
} from "@expo/vector-icons";

import ImageSlider from "@/components/imaageSlider";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getCategories,
  getProducts,
  getServiceCategories,
  getServiceProvider,
  getServiceProviderBookingStats,
  getServiceProviderDetailedStats,
  getServiceProviders,
  getServiceProviderStats,
  getUpcomingBookings,
} from "@/services/api/request";
import {
  AppModal,
  ContactCustomerModal,
  DetailedStatsBody,
  DownloadReportsBody,
  EmptyList,
  filterItemsWithNullParent,
  formatNumberToThousands,
  formatShortDate,
  getGreeting,
  InfoRow,
  PerformanceCard,
  QuickActions,
  SectionHeader,
  StatCard,
  StatCardTwo,
} from "@/components/reusables";
import { BookingStatsData, Category, ProductPropsType } from "@/types/type";
import {
  Product,
  Listing,
  ProductCategory,
  Booking,
  ServiceCategory,
  UpcomingBooking,
} from "@/components/flatListItems/items";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, Link, router } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import type { ParamListBase } from "@react-navigation/native";
import { useAuth } from "@/components/AuthContext";
const images = [
  "https://picsum.photos/id/11/200/300",
  "https://picsum.photos/id/10/200/300",
  "https://picsum.photos/id/12/200/300",
];

export default function Tab() {
  const profilepix = require("@/assets/images/profilePhoto.jpg");
  const logo = require("@/assets/images/logo2.png");
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [openDownload, setOpenDownload] = useState(false);
  const [openStats, setOpenStats] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [serviceProvicders, setServicProviders] = useState<any[]>([]);
  const [bookingStats, setBookingStats] = useState<any>([]);
  const [detailedStats, setDetailedStats] = useState<any>();
  const [booking, setBooking] = useState<any>();
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any>(null);
  const [stats, setStats] = useState<BookingStatsData>({
    cancelledBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    rating: 0,
    totalBookings: 0,
    totalRatings: 0,
    totalRevenue: 0,
    totalServices: 0,
  });

  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();

  const [state, setState] = useState<"overview" | "bookings" | "analytics">(
    "overview",
  );
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "completed" | "cancelled"
  >("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "bookings", label: "Bookings" },
    { key: "analytics", label: "Analytics" },
  ];
  const bookingTabs = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];
  const limit = 10;

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        const [catRes, servCatRes, prodRes, listRes] = await Promise.all([
          getCategories(),
          getServiceCategories(),
          getProducts(limit),
          getServiceProviders(),
        ]);
        setCategories(catRes);
        setServiceCategories(servCatRes);
        setProducts(prodRes);
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
        setError(null);

        // 1) run this first
        const provider = await getServiceProvider();
        if (!provider?.id) {
          throw new Error("Service provider ID not found");
        }

        // 2) now run the rest using provider.id
        const [bookings, providerStats, bookingStats, detailedStats] =
          await Promise.all([
            getUpcomingBookings(provider.id),
            getServiceProviderStats(provider.id),
            getServiceProviderBookingStats(provider.id),
            getServiceProviderDetailedStats(provider.id),
          ]);

        // 3) set states
        setUpcoming(bookings);
        setStats(providerStats);
        setBookingStats(bookingStats);
        setDetailedStats(detailedStats);
      } catch (err: any) {
        setError(err?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (!user || user?.role === "customer") {
      loadCustomerData();
    } else if (user?.role === "businessOwner") {
      loadVendorData();
    }
  }, [user?.id, user?.role]);

  useEffect(() => {}, []);
  // --- Memoized Derived Data ---
  const subCategories = useMemo(
    () => filterItemsWithNullParent(categories ?? []),
    [categories],
  );

  const featuredProducts = useMemo(
    () => products?.data?.slice(-6) ?? [],
    [products],
  );

  // --- Memoized Renderers for FlatLists ---
  const renderServiceItem = useCallback(
    ({ item }: { item: Category }) => (
      <ServiceCategory title={item.name} image={item.image} />
    ),
    [],
  );

  const renderCategoryItem = useCallback(
    ({ item }: { item: Category }) => (
      <ProductCategory id={item.id} title={item.name} image={item.image} />
    ),
    [],
  );

  const renderListing = useCallback(
    ({ item }: any) => (
      <Listing
        name={item.businessName}
        totalRatings={item.totalRatings}
        image={item.images?.[0]}
        id={item.id}
        address={item.businessAddress}
      />
    ),
    [],
  );

  const renderProduct = useCallback(
    ({ item }: { item: ProductPropsType }) => (
      <Product
        id={item.id}
        title={item.title}
        image={item.coverImage}
        description={item.description}
        price={item.price}
        averageRating={item.averageRating}
      />
    ),
    [],
  );

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const handleOpenModal = () => {
    setOpen(true);
  };
  const mappedStats = useMemo(() => {
    if (!detailedStats) return null;

    const stats = detailedStats;

    return {
      thisWeek: [
        { label: "Revenue", value: `₦${stats.thisWeek.revenue}` },
        { label: "Bookings", value: `${stats.thisWeek.bookings}` },
        { label: "New Customers", value: `${stats.thisWeek.newCustomers}` },
        {
          label: "Avg Rating",
          value: `${stats.thisWeek.avgRating}`,
          showStar: true,
        },
      ],
      thisMonth: [
        {
          label: "Revenue",
          value: `₦${stats.thisMonth.revenue}`,
          changeText: `${stats.thisMonth.revenueGrowth}%`,
          changeTone:
            stats.thisMonth.revenueGrowth >= 0
              ? ("up" as const)
              : ("down" as const),
        },
        {
          label: "Bookings",
          value: `${stats.thisMonth.bookings}`,
          changeText: `${stats.thisMonth.bookingsGrowth}%`,
          changeTone:
            stats.thisMonth.bookingsGrowth >= 0
              ? ("up" as const)
              : ("down" as const),
        },
        {
          label: "Completion Rate",
          value: `${stats.thisMonth.completionRate}%`,
        },
      ],
      allTime: [
        { label: "Total Revenue", value: `₦${stats.allTime.totalRevenue}` },
        { label: "Total Bookings", value: `${stats.allTime.totalBookings}` },
        { label: "Total Customers", value: `${stats.allTime.totalCustomers}` },
      ],
    };
  }, [detailedStats]);
  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F8FF]"
      style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
    >
      <StatusBar barStyle="dark-content" />
      <View
        className={`px-4 flex flex-col gap-[12px] ${!user || user.role === "customer" ? "" : "border-[#aaaaaa] border-b-[1px] pb-3"}`}
      >
        <View className="flex flex-row justify-between items-center pt-[8px] ">
          <Pressable onPress={openDrawer}>
            <View style={[styles.iconBtn]}>
              <Ionicons name="menu" size={24} color="#FF6EC7" />
            </View>
          </Pressable>

          <View className="flex justify-center items-center">
            <Image source={logo} />
          </View>

          {!user || user.role === "customer" ? (
            <Image source={profilepix} className="h-[40px] w-[40px]" />
          ) : (
            <Ionicons name="notifications-outline" size={24} color="black" />
          )}
        </View>
        {user && user.role === "businessOwner" && (
          <View className="flex flex-col gap-[24px]">
            <View className="flex flex-col gap-[4px]">
              <Text
                className="text-[#6A7282] text-[14px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {getGreeting()}
              </Text>
              <Text
                className="text-[#101828] text-[16px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Hi, {user?.fullName} !
              </Text>
            </View>
            <View className="flex flex-row gap-[8px]">
              {tabs.map((tab) => {
                const active = state === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setState(tab.key as any)}
                    className={`rounded-[10px] h-[36px] px-[12px] flex items-center justify-center ${
                      active ? "bg-[#F6339A]" : "bg-[#F3F4F6]"
                    }`}
                  >
                    <Text
                      className={`text-[14px] ${
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
          </View>
        )}
      </View>
      {/* MAIN SCROLL CONTENT */}
      {(!user || user.role === "customer") && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* SEARCH + SLIDER */}
          <View className="pt-2 px-4">
            <View className="flex flex-row gap-2 justify-between pr-4 mb-4">
              <View
                style={[styles.card]}
                className="flex flex-row h-[48px] items-center bg-white rounded-[4px] py-[13px] px-[16px] w-[80%]"
              >
                <Octicons name="search" size={24} color="#B2B1B1" />
                <TextInput
                  placeholder="Search"
                  placeholderTextColor="#B2B1B1"
                  className="flex-1 mx-[8px]"
                />
                <MaterialCommunityIcons
                  name="briefcase-search-outline"
                  size={24}
                  color="#B2B1B1"
                />
              </View>

              <View className="w-[20%] flex items-end">
                <Link href={"/notification"}>
                  <View
                    style={[styles.card]}
                    className="w-[48px] h-[48px] bg-white rounded-full flex justify-center items-center"
                  >
                    <Ionicons
                      name="notifications-outline"
                      size={24}
                      color="black"
                    />
                  </View>
                </Link>
              </View>
            </View>

            <ImageSlider images={images} />

            {/* FEATURED CATEGORIES */}
            <SectionHeader
              title="Featured Categories"
              action="View All"
              href={"/(drawer)/(tabs)/category"}
            />
            <FlatList
              horizontal
              data={subCategories}
              keyExtractor={(i) => i.id ?? ""}
              renderItem={renderCategoryItem}
              showsHorizontalScrollIndicator={false}
              style={styles.hList}
              ListEmptyComponent={<EmptyList message="No category available" />}
            />
          </View>

          {/* FEATURED LISTINGS */}
          <View className="px-4 mt-4">
            <SectionHeader
              title="Featured Listings"
              action="View All"
              href={"/(drawer)/(tabs)/services"}
            />

            <FlatList
              // horizontal
              data={serviceProvicders.slice(0, 6)}
              renderItem={renderListing}
              numColumns={3}
              keyExtractor={(i) => i.id ?? ""}
              // showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              ListEmptyComponent={
                <EmptyList message="No service provider available" />
              }
            />
          </View>

          {/* NEW RELEASE */}
          <View className="px-4 mt-4 mb-8">
            <SectionHeader
              title="New Release"
              action="Explore"
              href={"/(drawer)/(tabs)/category"}
            />

            <FlatList
              data={featuredProducts}
              renderItem={renderProduct}
              numColumns={2}
              keyExtractor={(i) => i.id}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: "space-between" }}
            />
          </View>
        </ScrollView>
      )}
      {user && user.role === "businessOwner" && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="bg-[#F9FAFB] flex-1"
        >
          {user && user.role === "businessOwner" && state === "overview" && (
            <View className="px-4 pt-4 flex flex-col gap-[24px] flex-1">
              <PerformanceCard
                stats={[
                  { label: "Revenue", value: `₦${stats?.totalRevenue}` },
                  { label: "Bookings", value: `${stats?.totalBookings}` },
                  { label: "Rating", value: `${stats?.rating}` },
                ]}
                onPrimaryPress={() => setOpenStats(true)}
                onSecondaryPress={() => setOpenDownload(true)}
              />
              <View className="flex flex-row flex-wrap justify-between">
                {/* Box 1 */}
                <View className="w-[48%] mb-4">
                  <StatCard
                    icon={
                      <Feather name="dollar-sign" size={24} color="black" />
                    }
                    value={`₦${stats?.totalRevenue}`}
                    label="Total Revenue"
                  />
                </View>

                {/* Box 2 */}
                <View className="w-[48%] mb-4">
                  <StatCard
                    icon={<Feather name="calendar" size={24} color="black" />}
                    value={`${stats?.totalBookings}`}
                    label="Bookings"
                  />
                </View>

                {/* Box 3 */}
                <View className="w-[48%] mb-4">
                  <StatCard
                    icon={
                      <MaterialCommunityIcons
                        name="clock-time-four-outline"
                        size={24}
                        color="black"
                      />
                    }
                    value={`${stats?.pendingBookings}`}
                    label="Pending"
                  />
                </View>

                {/* Box 4 */}
                <View className="w-[48%] mb-4">
                  <StatCard
                    icon={
                      <MaterialIcons
                        name="chat-bubble-outline"
                        size={24}
                        color="black"
                      />
                    }
                    value="8"
                    label="Messages"
                  />
                </View>
              </View>
              <View className=" flex flex-col gap-2">
                <SectionHeader
                  title="Upcoming Bookings"
                  action="View All"
                  href={"/"}
                />

                <FlatList
                  scrollEnabled={false}
                  numColumns={1}
                  horizontal={false}
                  data={upcoming?.slice(-3)}
                  renderItem={({ item }) => (
                    <UpcomingBooking
                      status={item.status}
                      providerId={item.providerId?.businessName}
                      appointmentDate={item?.appointmentDate}
                      appointmentTime={item?.appointmentTime}
                      image={item.providerId?.images[0]}
                      price={item?.servicePrice}
                    />
                  )}
                  keyExtractor={(item) => item._id}
                  ListEmptyComponent={
                    <EmptyList message="You have no upcoming bookings" />
                  }
                />
              </View>
              <View
                className="p-[20px] bg-white rounded-[16px] flex flex-col gap-[16px]"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 5, // Android shadow
                }}
              >
                <Text
                  className="text-[#101828] text-[16px]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  Quick Actions
                </Text>
                <View className="flex flex-row flex-wrap justify-between">
                  {/* Box 1 */}
                  <View className="w-[48%] mb-4">
                    <QuickActions
                      icon={
                        <Entypo name="add-to-list" size={24} color="#F6339A" />
                      }
                      value="New Listing"
                      route="createListing"
                    />
                  </View>

                  {/* Box 2 */}
                  <View className="w-[48%] mb-4">
                    <QuickActions
                      icon={
                        <Feather name="calendar" size={24} color="#F6339A" />
                      }
                      value="Availability"
                      route="availabilityScreen"
                    />
                  </View>

                  {/* Box 3 */}
                  <View className="w-[48%] mb-4">
                    <QuickActions
                      icon={
                        <Feather name="dollar-sign" size={24} color="#F6339A" />
                      }
                      value="Payments"
                      route="services"
                    />
                  </View>

                  {/* Box 4 */}
                  <View className="w-[48%] mb-4">
                    <QuickActions
                      icon={
                        <MaterialIcons
                          name="chat-bubble-outline"
                          size={24}
                          color="#F6339A"
                        />
                      }
                      value="Messages"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
          {user && user.role === "businessOwner" && state === "bookings" && (
            <View className="px-4 pt-4 flex flex-col gap-[24px] ">
              <View className="flex flex-row h-[50px] items-center  px-[16px] w-full border-[#E5E7EB] border-[1px] rounded-[14px]">
                <Octicons name="search" size={24} color="#B2B1B1" />
                <TextInput
                  placeholder="Search bookings..."
                  placeholderTextColor="#B2B1B1"
                  className="flex-1 mx-[8px] text-[16px]"
                />
              </View>
              <View className="flex flex-row gap-[8px]">
                {bookingTabs.map((tab) => {
                  const active = filter === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => setFilter(tab.key as any)}
                      className={`rounded-[10px] h-[36px] px-[12px] flex items-center justify-center  ${
                        active
                          ? "bg-[#F6339A]"
                          : "bg-[#ffffff] border-[#E5E7EB] border-[1px]"
                      }`}
                    >
                      <Text
                        className={`text-[14px] ${
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
              <FlatList
                scrollEnabled={false}
                numColumns={1}
                horizontal={false}
                data={upcoming}
                renderItem={({ item }) => (
                  <Booking
                    fullname={item.customerId.fullName}
                    appointmentDate={item.appointmentDate}
                    appointmentTime={item.appointmentTime}
                    image={item.customerId.avatarURL}
                    description={item.description}
                    price={item.servicePrice}
                    status={item.status}
                    serviceLocation={item.serviceLocation}
                    onViewDetails={() => {
                      handleOpenModal();
                      setBooking(item);
                    }}
                  />
                )}
                keyExtractor={(item) => item._id}
                ListEmptyComponent={
                  <EmptyList message="You have no upcoming bookings" />
                }
              />
            </View>
          )}
          {user && user.role === "businessOwner" && state === "analytics" && (
            <View className="px-4 pt-4 flex flex-col gap-[24px] ">
              <View className="flex flex-row flex-wrap justify-between">
                {/* Box 1 */}
                <View className="w-[48%] mb-4">
                  <StatCardTwo
                    icon={<Feather name="users" size={24} color="#4A5565" />}
                    value={bookingStats?.bookingStats?.totalBookings}
                    label="Total Bookings"
                  />
                </View>

                {/* Box 2 */}
                <View className="w-[48%] mb-4">
                  <StatCardTwo
                    icon={
                      <Feather name="check-circle" size={24} color="#4A5565" />
                    }
                    value={bookingStats?.bookingStats?.completedBookings}
                    label="Completed Bookings"
                  />
                </View>

                {/* Box 3 */}
                <View className="w-[48%] mb-4">
                  <StatCardTwo
                    icon={<Feather name="users" size={24} color="#4A5565" />}
                    value={bookingStats?.bookingStats?.upcomingBookings}
                    label="Upcoming Bookings"
                  />
                </View>

                {/* Box 4 */}
                <View className="w-[48%] mb-4">
                  <StatCardTwo
                    icon={<AntDesign name="star" size={24} color="#FFC107" />}
                    value={bookingStats?.bookingStats?.completionRate}
                    label="Completion Rate"
                  />
                </View>
              </View>
              <View
                className={`rounded-[16px] p-[20px] bg-white flex flex-col gap-[16px]`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 5, // Android shadow
                }}
              >
                <Text
                  className="text-[#101828] text-[16px]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  Top Services
                </Text>

                <InfoRow
                  title="Hair Styling"
                  subtitle="Most booked services"
                  rightText={5400}
                />
              </View>
            </View>
          )}
        </ScrollView>
      )}
      <ContactCustomerModal
        visible={open}
        onClose={() => setOpen(false)}
        name={booking?.customerId.fullName || ""}
        service={""}
        phone="+234 802 345 6789"
        appointment={`${formatShortDate(booking?.appointmentDate)} at ${booking?.appointmentTime}`}
        amount={`₦${formatNumberToThousands(booking?.servicePrice || 0)}`}
        onOpenChat={() => {
          setOpen(false);
          router.push("/chat");
        }}
        onCall={() => setOpen(false)}
      />
      <AppModal
        visible={openStats}
        onClose={() => setOpenStats(false)}
        title="Detailed Statistics"
      >
        <DetailedStatsBody
          thisWeek={mappedStats?.thisWeek ?? []}
          thisMonth={mappedStats?.thisMonth ?? []}
          allTime={mappedStats?.allTime ?? []}
        />
      </AppModal>
      <AppModal
        visible={openDownload}
        onClose={() => setOpenDownload(false)}
        title="Download Reports"
      >
        <DownloadReportsBody
          onSelectReport={(key) => {
            console.log("download report", key);
            // call api or navigate to report screen
          }}
          onGenerateCustomReport={({ from, to }) => {
            console.log("custom report", from, to);
            // call api
          }}
        />
      </AppModal>
    </SafeAreaView>
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
