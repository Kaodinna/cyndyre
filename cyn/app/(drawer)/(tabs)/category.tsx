import {
  View,
  Text,
  TextInput,
  SectionList,
  FlatList,
  Image,
  Pressable,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  Ionicons,
  Octicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCategories,
  getProducts,
  getServiceProvider,
  getServicesByServiceProviderId,
  getAvailableOrders,
  claimOrder,
} from "@/services/api/request";
import { Alert } from "react-native";
import {
  Booking,
  ProductItem,
  ServiceListing,
} from "@/components/flatListItems/items";
import { router, useNavigation } from "expo-router";
import { AppModal, chunkArray, EmptyList } from "@/components/reusables";
import { useAuth } from "@/components/AuthContext";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerActions, ParamListBase } from "@react-navigation/native";

type SectionType = {
  id: string;
  name: string;
  data: Product[][];
};

type Category = {
  id: string;
  name: string;
  parent: string | null;
  createdAt: string;
  updatedAt: string;
  image: string;
};

type Product = {
  id: string;
  title: string;
  coverImage: string;
  images: string[];
  price: number;
  discountPrice: number | null;
  category: Category;
  description: string;
  summary: string;
  returnPolicy: string;
  averageRating: number;
  user: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

// ---------- Main Tab Component ----------
export default function Tab() {
  const [currentType, setCurrentType] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const [openHistory, setOpenHistory] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, logout } = useAuth();

  const [state, setState] = useState<"active" | "inactive" | "drafts">(
    "active",
  );

  const LIMIT = 100;

  type ProductRow = Product[];

  const chunkArray = <T,>(arr: T[], size: number) => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const buildSectionsSmart = (
    products: Product[],
    categories: { id: string; name: string; parent: string | null }[],
    selectedCategoryId: string,
  ): SectionType[] => {
    const subs = categories.filter((c) => c.parent === selectedCategoryId);

    if (subs.length > 0) {
      return subs
        .map((sub) => {
          const items = products.filter((p) => p.category?.id === sub.id);
          if (items.length === 0) return null;
          return {
            id: sub.id,
            name: sub.name,
            data: chunkArray(items, 2),
          };
        })
        .filter((s): s is SectionType => s !== null);
    }

    const selectedCatName =
      categories.find((c) => c.id === selectedCategoryId)?.name || "Products";

    const directItems = products.filter(
      (p) => p.category?.id === selectedCategoryId,
    );

    if (directItems.length === 0) return []; // nothing to show

    return [
      {
        id: selectedCategoryId,
        name: selectedCatName,
        data: chunkArray(directItems, 2),
      },
    ];
  };

  // ----------------- Fetch Categories & Products -----------------
  useEffect(() => {
    const load = async () => {
      if (!user || user.role === "customer") {
        try {
          setLoading(true);

          const catsRes = await getCategories();
          setCategories(catsRes);

          const mainCats = catsRes.filter((c) => !c.parent);
          if (mainCats.length > 0) {
            setCurrentType(mainCats[0].id as string); // triggers products effect
          } else {
            setCurrentType("");
            setProducts([]);
          }
        } catch (e) {
          console.warn("Error loading categories:", e);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (user.role === "businessOwner") {
        try {
          const provider = await getServiceProvider();
          if (!provider?.id) {
            throw new Error("Service provider ID not found");
          }
          setLoading(true);
          const bookings = await getServicesByServiceProviderId(provider.id);
          setListings(bookings.data);
        } catch (err: any) {
          setError(err?.message);
        } finally {
          setLoading(false);
        }
      }
    };

    load();
  }, [user?.id, user?.role]);
  useEffect(() => {
    const loadProducts = async () => {
      if (!user || user.role === "customer") {
        if (!currentType) return;

        try {
          setLoading(true);
          const prodRes = await getProducts(LIMIT);
          setProducts(prodRes.data || []);
          const products = prodRes.data || [];
          const sections = buildSectionsSmart(
            products,
            categories,
            currentType,
          );
          setSections(sections);
          console.log("sections:", sections);
        } catch (e) {
          console.warn("Error loading products:", e);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProducts();
  }, [currentType, user?.role]);

  const fetchVendorServices = async () => {
    try {
      const provider = await getServiceProvider();
      if (!provider?.id) {
        throw new Error("Service provider ID not found");
      }
      const response = await getServicesByServiceProviderId(provider?.id || "");
      setListings(response.data);
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
  // ----------------- Memoized Data -----------------
  const mainCategories = useMemo(
    () => categories.filter((c) => !c.parent),
    [categories],
  );

  // ----------------- Render Functions -----------------
  const renderCategory = ({ item }: { item: Category }) => {
    const active = item.id === currentType;
    return (
      <Pressable
        onPress={() => {
          setCurrentType(item.id ?? "");
       
          if (item.name === "Baby Utilities") {
            setOpenHistory(true);
          }
        }}
      >
        <View
          className={`py-[16px] px-[8px] ${active ? "bg-[#FFF1F9] border-[#FF6EC7] border-b-[1px]" : ""}`}
        >
          <Text
            className={`text-center text-[12px] ${active ? "text-[#FF6EC7]" : "text-[#8C8C8C]"}`}
            style={{ fontFamily: "Manrope_600SemiBold" }}
          >
            {item.name}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionType }) => (
    <View className="bg-[#F7F7F7] py-2 px-4 flex flex-row justify-between border-b border-[#FFE7FE]">
      <Text
        className="text-[10px] font-[700] text-[#050404]"
        style={{ fontFamily: "Manrope" }}
      >
        {section.name}
      </Text>
      <Pressable onPress={() => router.push(`/productCategory/${section.id}`)}>
        <Text
          className="text-[10px] text-[#D22C2C]"
          style={{ fontFamily: "Manrope" }}
        >
          View All
        </Text>
      </Pressable>
    </View>
  );

  const renderItem = ({ item }: { item: Product[] }) => (
    <View className="flex-row justify-between">
      {item.map((p) => (
        <ProductItem
          key={p.id}
          item={{
            ...p,
            category:
              typeof p.category === "object" ? p.category.name : p.category,
          }}
        />
      ))}
    </View>
  );

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // ─── Rider available-orders tab ─────────────────────────────────────────
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchAvailable = useCallback(async () => {
    if (user?.role !== "rider") return;
    try {
      setAvailableLoading(true);
      const res = await getAvailableOrders();
      setAvailableOrders((res as any).data ?? res ?? []);
    } catch { setAvailableOrders([]); }
    finally { setAvailableLoading(false); }
  }, [user?.role]);

  useEffect(() => { fetchAvailable(); }, [fetchAvailable]);

  const handleClaim = async (orderId: string) => {
    try {
      setClaimingId(orderId);
      await claimOrder(orderId);
      Alert.alert("Claimed!", "Order has been assigned to you and marked as shipped.");
      fetchAvailable();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Could not claim order.");
    } finally { setClaimingId(null); }
  };

  if (user?.role === "rider") {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F8FF]" style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}>
        <View className="px-4 py-3 border-b border-[#F3F3F3]">
          <Text className="text-[20px] text-[#050404]" style={{ fontFamily: "Manrope_700Bold" }}>Available Orders</Text>
          <Text className="text-[12px] text-[#585757] mt-1" style={{ fontFamily: "Manrope_400Regular" }}>Packaged orders ready for pickup</Text>
        </View>
        {availableLoading ? (
          <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#FF6EC7" /></View>
        ) : (
          <FlatList
            data={availableOrders}
            keyExtractor={(item) => item.id ?? item._id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }}
            onRefresh={fetchAvailable}
            refreshing={availableLoading}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center pt-20">
                <MaterialCommunityIcons name="package-variant" size={48} color="#FFD2EE" />
                <Text className="text-[14px] text-[#585757] mt-3" style={{ fontFamily: "Manrope_500Medium" }}>No orders available right now</Text>
              </View>
            }
            renderItem={({ item }) => {
              const images = item.cart?.map((c: any) => c.product?.images?.[0] ?? c.product?.coverImage).filter(Boolean) ?? [];
              return (
                <View className="bg-white rounded-[12px] mb-3 overflow-hidden" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 }}>
                  <View className="px-4 pt-4 pb-2">
                    <Text className="text-[13px] text-[#050404]" style={{ fontFamily: "Manrope_700Bold" }}>Order {item.orderId}</Text>
                    <Text className="text-[11px] text-[#585757] mt-[2px]" style={{ fontFamily: "Manrope_400Regular" }}>{item.cart?.length ?? 0} item{(item.cart?.length ?? 0) !== 1 ? "s" : ""}</Text>
                  </View>
                  {images.length > 0 && (
                    <View className="flex flex-row gap-[6px] px-4 pb-3">
                      {images.slice(0, 4).map((uri: string, idx: number) => (
                        <View key={idx} className="w-[48px] h-[48px] rounded-[8px] overflow-hidden bg-[#F3F3F3]">
                          <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                        </View>
                      ))}
                    </View>
                  )}
                  {item.deliveryAddress ? (
                    <View className="flex flex-row items-start gap-2 px-4 pb-3">
                      <Ionicons name="location-outline" size={14} color="#10B981" style={{ marginTop: 2 }} />
                      <Text className="text-[12px] text-[#374151] flex-1" style={{ fontFamily: "Manrope_400Regular" }} numberOfLines={2}>{item.deliveryAddress}</Text>
                    </View>
                  ) : null}
                  <View className="flex flex-row items-center justify-between px-4 py-3 border-t border-[#F3F3F3]">
                    <Text className="text-[13px] text-[#374151]" style={{ fontFamily: "Manrope_400Regular" }}>
                      Total: <Text style={{ fontFamily: "Manrope_700Bold" }}>₦{item.totalAmount?.toLocaleString()}</Text>
                    </Text>
                    <Pressable
                      onPress={() => handleClaim(item.id ?? item._id)}
                      disabled={claimingId === (item.id ?? item._id)}
                      className="bg-[#FF6EC7] px-4 py-[8px] rounded-[8px]"
                      style={{ opacity: claimingId === (item.id ?? item._id) ? 0.6 : 1 }}
                    >
                      {claimingId === (item.id ?? item._id) ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white text-[12px]" style={{ fontFamily: "Manrope_600SemiBold" }}>Claim Order</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ----------------- Loading State -----------------
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  }
  const listingsTabs = [
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "drafts", label: "Drafts" },
  ];
  // ----------------- Main UI -----------------
  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F8FF]"
      style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
    >
      {/* Search */}
      {(!user || user.role === "customer") && (
        <View>
          <View className="px-4 flex flex-row gap-2 justify-between mt-2">
            <Pressable onPress={openDrawer}>
              <View style={[styles.iconBtn]}>
                <Ionicons name="menu" size={24} color="#FF6EC7" />
              </View>
            </Pressable>
            <View className="h-[48px] bg-white rounded-[4px] flex-row items-center px-[16px] flex-1">
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

            <View className="w-[48px] h-[48px] bg-white rounded-full justify-center items-center">
              <Ionicons name="notifications-outline" size={24} color="black" />
            </View>
          </View>

          {/* Category List + Sections */}
          <View className="flex-row h-full mt-4">
            {/* LEFT CATEGORY LIST */}
            <View className="w-[22%] bg-white">
              <FlatList
                data={mainCategories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id ?? ""}
              />
            </View>

            {/* RIGHT SECTIONS */}
            <View className="w-[78%] bg-[#F8F8FF] p-[6px]">
              <SectionList
                sections={sections}
                renderSectionHeader={renderSectionHeader}
                renderItem={renderItem}
                keyExtractor={(item, i) =>
                  `${item?.map((p) => p.id).join("-")}-${i}`
                }
                contentContainerStyle={{ paddingBottom: 200 }}
              />
            </View>
          </View>
        </View>
      )}
      {user && user.role === "businessOwner" && (
        <View className="bg-[#F9FAFB] px-4 flex flex-col gap-[24px]">
          <View className="flex flex-col gap-[24px]">
            <Pressable
              className="h-[56px] bg-[#E60076] rounded-[14px] flex flex-row items-center justify-center gap-[8px]"
              onPress={() => router.push("/createListing")}
            >
              <Feather name="plus" size={20} color="white" />
              <Text
                className="text-[#ffffff] text-[16px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Create New Listing
              </Text>
            </Pressable>
            <View className="h-[50.43px] bg-white  flex-row items-center px-[16px] w-full border-[#D1D5DC] border-[1px] rounded-[10px]">
              <Octicons name="search" size={24} color="#B2B1B1" />
              <TextInput
                placeholder="Search your listings..."
                placeholderTextColor="#B2B1B1"
                className="flex-1 mx-[8px]"
              />
            </View>

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
          </View>

          <FlatList
            data={listings}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ServiceListing
                bookings={item.totalBookings}
                image={item.image}
                name={item.name}
                rating={item.averageRating}
                price={item.basePrice}
                status={item.isActive}
                duration={item.durationMinutes}
                category={item.categoryId.name}
              />
            )}
            ListFooterComponent={
              <View className="bg-[#FDF2F8] border-[#FCCEE8] border-[1.24px] p-[25px] rounded-[14px] gap-[12px]">
                <Text
                  className="text-[#861043] text-[16px]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  Listing Tips
                </Text>
                <View className="flex flex-col gap-[8px]">
                  <Text
                    className="text-[#861043] text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    • Keep your listings active and up-to-date for better
                    visibility
                  </Text>
                  <Text
                    className="text-[#861043] text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    • High-quality photos increase booking rates by up to 40%
                  </Text>
                  <Text
                    className="text-[#861043] text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    • Detailed descriptions help customers make informed
                    decisions
                  </Text>
                  <Text
                    className="text-[#861043] text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    • Update your availability regularly to avoid booking
                    conflicts
                  </Text>
                  <Text
                    className="text-[#861043] text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    • Respond quickly to inquiries to maintain high ratings
                  </Text>
                </View>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 200 }}
            ListEmptyComponent={<EmptyList message="You have no Listings" />}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        </View>
      )}
      <AppModal
        visible={openHistory}
        onClose={() => setOpenHistory(false)}
        title=""
      >
        <View>
          <Text
            className="text-[#050404] text-[18px] text-center"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            Please provide the age of your Baby for the best shopping experience
          </Text>
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
