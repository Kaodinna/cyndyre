import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Octicons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/components/AuthContext";

export default function TabLayout() {
  const { user } = useAuth();
  const isRider = user?.role === "rider";
  const isVendor = user?.role === "businessOwner";

  const TabBarLabel = ({ focused, title }: any) => {
    if (!focused) return null;
    return (
      <Text
        style={{ fontFamily: "Manrope" }}
        className="font-[600] text-[12px] text-[#FF6EC7] leading-[16.39px]"
      >
        {title}
      </Text>
    );
  };

  const hiddenTab = { tabBarButton: () => null, headerShown: false } as any;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF6EC7",
        tabBarInactiveTintColor: "#8C8C8C",
        tabBarStyle: {
          borderTopRightRadius: 16,
          borderTopLeftRadius: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) =>
            isRider ? (
              <MaterialCommunityIcons name="truck-delivery-outline" size={24} color={color} />
            ) : isVendor ? (
              <MaterialCommunityIcons name="view-dashboard-outline" size={24} color={color} />
            ) : (
              <Octicons name="home" size={24} color={color} />
            ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel
              focused={focused}
              title={isRider ? "Deliveries" : isVendor ? "Dashboard" : "Home"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) =>
            isRider ? (
              <MaterialCommunityIcons name="package-variant-closed" size={24} color={color} />
            ) : isVendor ? (
              <Octicons name="calendar" size={24} color={color} />
            ) : (
              <MaterialIcons name="category" size={24} color={color} />
            ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel
              focused={focused}
              title={isRider ? "Available" : isVendor ? "Listings" : "Category"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={
          isRider
            ? hiddenTab
            : {
                headerShown: false,
                tabBarIcon: ({ color }) =>
                  isVendor ? (
                    <MaterialIcons name="payment" size={24} color={color} />
                  ) : (
                    <Feather name="scissors" size={24} color={color} />
                  ),
                tabBarLabel: ({ focused }) => (
                  <TabBarLabel
                    focused={focused}
                    title={isVendor ? "Payments" : "Services"}
                  />
                ),
              }
        }
      />
      <Tabs.Screen
        name="cart"
        options={
          isRider
            ? hiddenTab
            : {
                headerShown: false,
                tabBarIcon: ({ color }) =>
                  isVendor ? (
                    <MaterialIcons name="chat-bubble-outline" size={24} color={color} />
                  ) : (
                    <FontAwesome size={28} name="shopping-cart" color={color} />
                  ),
                tabBarLabel: ({ focused }) => (
                  <TabBarLabel
                    focused={focused}
                    title={isVendor ? "Chat" : "Cart"}
                  />
                ),
              }
        }
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="settings-outline" color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel focused={focused} title="Settings" />
          ),
        }}
      />
    </Tabs>
  );
}
