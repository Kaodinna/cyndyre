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
  Button,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Octicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams } from "expo-router";
import ImageSlider from "@/components/imaageSlider";
import { useCallback, useEffect, useState } from "react";
import { getCategories, getProducts } from "@/services/api/request";
import { EmptyList, filterItemsWithNullParent } from "@/components/reusables";
import { Category } from "@/types/type";
import { Item, Product, Listing } from "@/components/flatListItems/items";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Tab() {
  const profilepix = require("@/assets/images/profilePhoto.jpg");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<any>();
  const [limit, setLimit] = useState(10);
  const { id } = useLocalSearchParams();

  const renderHeader = () => (
    <View className="pt-2 px-4">
      <View className=" flex flex-row gap-2 justify-between pr-4 mb-4">
        <View
          className="flex flex-row h-[48px] items-center justify-between bg-white rounded-[4px] py-[13px] px-[16px] w-[80%]"
          style={styles.card}
        >
          <Octicons name="search" size={24} color="#B2B1B1" className="" />
          <TextInput
            placeholder={`Search`}
            placeholderTextColor="#B2B1B1"
            className="flex-1 mx-[8px]"
          />
          <MaterialCommunityIcons
            name="briefcase-search-outline"
            size={24}
            color="#B2B1B1"
            className=""
          />
        </View>

        <View className="w-[20%] flex items-end">
          <Link href={"/notification"}>
            <View
              className="w-[48px] h-[48px] bg-white rounded-full flex justify-center items-center"
              style={styles.card}
            >
              <Ionicons name="notifications-outline" size={24} color="black" />
            </View>
          </Link>
        </View>
      </View>
    </View>
  );

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProducts(limit, id as string);
      setProducts(response);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [limit, id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const logo = require("../../assets/images/logo2.png");
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  }

  const data = products?.data?.slice(-6) ?? [];

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F8FF]"
      style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
    >
      <View className="flex flex-row justify-between items-center py-[8px] px-4">
        <View className="flex justify-center items-center">
          <Image source={logo} />
        </View>
        <Image source={profilepix} className="h-[40px] w-[40px]" />
      </View>

      <FlatList
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        numColumns={2}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Product
            id={item.id}
            title={item.title}
            image={item.coverImage}
            description={item.description}
            price={item.price}
          />
        )}
        ListEmptyComponent={
          <EmptyList message="You have no products in this category" />
        }
        refreshing={loading}
        onRefresh={() => fetchProducts()}
      />
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
