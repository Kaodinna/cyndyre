import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Text } from "react-native";
import { Octicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { use, useState } from "react";
import { useAuth } from "@/components/AuthContext";
export default function TabLayout() {
  const { user, isAuthenticated, logout } = useAuth();

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
            user?.role === "businessOwner" ? (
              <MaterialCommunityIcons
                name="view-dashboard-outline"
                size={24}
                color={color}
              />
            ) : (
              <Octicons name="home" size={24} color={color} />
            ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel
              focused={focused}
              title={user?.role === "businessOwner" ? "Dasboard" : "Home"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) =>
            user?.role === "businessOwner" ? (
              <Octicons name="calendar" size={24} color={color} />
            ) : (
              <MaterialIcons name="category" size={24} color={color} />
            ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel
              focused={focused}
              title={user?.role === "businessOwner" ? "Listings" : "Category"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) =>
            user?.role === "businessOwner" ? (
              <MaterialIcons name="payment" size={24} color={color} />
            ) : (
              <Feather name="scissors" size={24} color={color} />
            ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel
              focused={focused}
              title={user?.role === "businessOwner" ? "Payments" : "Services"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) =>
            user?.role === "businessOwner" ? (
              <MaterialIcons
                name="chat-bubble-outline"
                size={24}
                color={color}
              />
            ) : (
              <FontAwesome size={28} name="shopping-cart" color={color} />
            ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel
              focused={focused}
              title={user?.role === "businessOwner" ? "Chat" : "Cart"}
            />
          ),
        }}
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
