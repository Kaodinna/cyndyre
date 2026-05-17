import { View, Text, Pressable, ScrollView } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { router } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Feather from "@expo/vector-icons/Feather";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useAuth } from "./AuthContext";
export default function CustomDrawer(props: DrawerContentComponentProps) {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <View {...props} style={{ paddingHorizontal: 0 }} className="flex-1">
      <View className="flex-1 bg-[#FF00B8]  py-8 flex-col gap-[32px]">
        {/* User Info */}
        <View className="mb-8 bg-[#FF42B6] p-[10px] rounded-[8px] border-[#FFF1F9] border-[1px] mx-[24px] mt-[32px]">
          <View className="flex flex-row gap-[12px] items-center">
            <FontAwesome5 name="user-circle" size={40} color="white" />
            {isAuthenticated ? (
              <View className="flex flex-col gap-[6px]">
                <Text
                  className="text-white font-bold text-[16px]"
                  style={{ fontFamily: "Manrope_700Bold" }}
                >
                  {user?.fullName}
                </Text>

                <Text
                  className="text-white text-[12px]"
                  style={{ fontFamily: "Manrope_500Medium" }}
                >
                  {user?.email}
                </Text>
              </View>
            ) : (
              <Pressable onPress={() => router.push("/login")}>
                <Text
                  className="text-white  text-[16px]"
                  style={{ fontFamily: "Manrope_700Bold" }}
                >
                  Login
                </Text>
              </Pressable>
            )}
          </View>
        </View>
        <View className="h-[1px] bg-[#FF9ED9]"></View>
        {/* Menu */}
        <ScrollView className="flex flex-col mx-[24px]">
          {user?.role === "customer" && (
            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/profile");
              }}
              className=" flex flex-row gap-[10px] items-center h-[48px]"
            >
              <Feather name="user" size={24} color="white" />
              <Text className="text-white">Profile</Text>
            </Pressable>
          )}
          {user?.role === "businessOwner" && (
            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/serviceProviderProfile");
              }}
              className=" flex flex-row gap-[10px] items-center h-[48px]"
            >
              <Feather name="user" size={24} color="white" />
              <Text className="text-white">Profile</Text>
            </Pressable>
          )}
          {user?.role !== "businessOwner" && (
            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/myOrders");
              }}
              className=" flex flex-row gap-[10px] items-center h-[48px]"
            >
              <Ionicons name="receipt-outline" size={24} color="white" />
              <Text className="text-white">My Orders</Text>
            </Pressable>
          )}
          {user?.role !== "businessOwner" && (
            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/cart");
              }}
              className=" flex flex-row gap-[10px] items-center h-[48px]"
            >
              <Ionicons name="cart-outline" size={24} color="white" />
              <Text className="text-white">Cart</Text>
            </Pressable>
          )}
          {user?.role !== "businessOwner" && (
            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/periodTrackerScreen");
              }}
              className=" flex flex-row gap-[10px] items-center h-[48px]"
            >
              <Ionicons name="calendar-outline" size={24} color="white" />
              <Text className="text-white">Period Tracker</Text>
            </Pressable>
          )}
          {user?.role !== "businessOwner" && (
            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/myBookings");
              }}
              className=" flex flex-row gap-[10px] items-center h-[48px]"
            >
              <AntDesign name="schedule" size={24} color="white" />
              <Text className="text-white">My Bookings</Text>
            </Pressable>
          )}
          {user?.role !== "businessOwner" && (
            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/category");
              }}
              className=" flex flex-row gap-[10px] items-center h-[48px]"
            >
              <MaterialIcons name="category" size={24} color="white" />
              <Text className="text-white">Category</Text>
            </Pressable>
          )}
          {user?.role === "businessOwner" && (
            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/availabilityScreen");
              }}
              className=" flex flex-row gap-[10px] items-center h-[48px]"
            >
              <Feather name="calendar" size={24} color="white" />
              <Text className="text-white">Availability</Text>
            </Pressable>
          )}
          {user?.role === "businessOwner" && (
            <Pressable
              onPress={() => {
                props.navigation.closeDrawer();
                router.push("/banks");
              }}
              className=" flex flex-row gap-[10px] items-center h-[48px]"
            >
              <FontAwesome name="bank" size={24} color="white" />

              <Text className="text-white">Withdrawal Bank</Text>
            </Pressable>
          )}
        </ScrollView>
        {/* Footer */}
        <View className="mt-auto border-[#FF9ED9] border-t-[1px] mb-[32px]">
          {isAuthenticated && (
            <View className="flex flex-col gap-[8px] mt-[24px] ">
              <View className="flex flex-col gap-[8px] mx-[24px]">
                <Pressable
                  onPress={() => {
                    props.navigation.closeDrawer();
                    router.push("/settings");
                  }}
                  className=" flex flex-row gap-[10px] items-center h-[48px]"
                >
                  <Ionicons name="settings-outline" size={24} color="white" />
                  <Text className="text-white">Settings</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    props.navigation.closeDrawer();
                    router.push("/cart");
                  }}
                  className=" flex flex-row gap-[10px] items-center h-[48px]"
                >
                  <MaterialCommunityIcons
                    name="help-box-outline"
                    size={24}
                    color="white"
                  />
                  <Text className="text-white">Help Center</Text>
                </Pressable>
              </View>
              <Pressable
                className=" bg-white  rounded-tr-[8px] rounded-br-[8px] h-[48px] flex flex-row items-center mr-[24px] pl-[24px] gap-[10px]"
                onPress={logout}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={24}
                  color="#FF0000"
                />
                <Text className="text-center text-pink-600 font-semibold">
                  Sign Out
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
