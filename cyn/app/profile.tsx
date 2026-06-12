import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { getUser } from "@/services/api/request";

const ROLE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  customer: { label: "Customer", color: "#7C3AED", bg: "#EDE9FE" },
  businessOwner: { label: "Business Owner", color: "#D97706", bg: "#FEF3C7" },
  rider: { label: "Rider", color: "#065F46", bg: "#D1FAE5" },
  admin: { label: "Admin", color: "#9D174D", bg: "#FCE7F3" },
};

export default function ProfileScreen() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getUser();
        setProfile((res as any).data ?? res);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const displayName = profile?.fullName ?? authUser?.fullName ?? "—";
  const displayEmail = profile?.email ?? authUser?.email ?? "—";
  const displayRole = profile?.role ?? authUser?.role ?? "customer";
  const avatarURL = profile?.avatarURL;
  const roleInfo = ROLE_LABEL[displayRole] ?? { label: displayRole, color: "#374151", bg: "#F3F4F6" };

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F8FF]"
      edges={["top"]}
      style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}>
        {/* Avatar + name card */}
        <View className="mx-4 mt-4 bg-white rounded-[16px] items-center py-8 px-6" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 }}>
          {avatarURL ? (
            <Image
              source={{ uri: avatarURL }}
              className="w-[88px] h-[88px] rounded-full border-[3px] border-[#FFD2EE]"
            />
          ) : (
            <View className="w-[88px] h-[88px] rounded-full bg-[#FF6EC7] items-center justify-center border-[3px] border-[#FFD2EE]">
              <Text className="text-white text-[28px]" style={{ fontFamily: "Manrope_700Bold" }}>
                {initials}
              </Text>
            </View>
          )}

          <Text className="text-[20px] text-[#050404] mt-4" style={{ fontFamily: "Manrope_700Bold" }}>
            {displayName}
          </Text>
          <Text className="text-[13px] text-[#585757] mt-1" style={{ fontFamily: "Manrope_400Regular" }}>
            {displayEmail}
          </Text>

          {/* Role badge */}
          <View className="mt-3 px-4 py-[4px] rounded-full" style={{ backgroundColor: roleInfo.bg }}>
            <Text className="text-[12px]" style={{ color: roleInfo.color, fontFamily: "Manrope_600SemiBold" }}>
              {roleInfo.label}
            </Text>
          </View>
        </View>

        {/* Info rows */}
        <View className="mx-4 mt-4 bg-white rounded-[16px] overflow-hidden" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 }}>
          <InfoRow icon="person-outline" label="Full Name" value={displayName} />
          <InfoRow icon="mail-outline" label="Email" value={displayEmail} />
          {profile?.phoneNumber ? (
            <InfoRow icon="call-outline" label="Phone" value={profile.phoneNumber} />
          ) : null}
          {profile?.address ? (
            <InfoRow icon="location-outline" label="Address" value={profile.address} />
          ) : null}
          {(displayRole === "rider" && profile?.vehicleType) ? (
            <InfoRow icon="car-outline" label="Vehicle" value={`${profile.vehicleType}${profile.vehiclePlate ? " · " + profile.vehiclePlate : ""}`} />
          ) : null}
        </View>

        {/* Actions */}
        <View className="mx-4 mt-4 bg-white rounded-[16px] overflow-hidden" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 }}>
          <Pressable
            className="flex flex-row items-center justify-between px-4 py-[16px] border-b border-[rgba(55,54,54,0.08)]"
            onPress={() => Alert.alert("Coming soon", "Edit profile will be available soon.")}
          >
            <View className="flex flex-row items-center gap-3">
              <Ionicons name="create-outline" size={20} color="#FF6EC7" />
              <Text className="text-[15px] text-[#050404]" style={{ fontFamily: "Manrope_500Medium" }}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#B2B1B1" />
          </Pressable>
          <Pressable
            className="flex flex-row items-center justify-between px-4 py-[16px]"
            onPress={handleLogout}
          >
            <View className="flex flex-row items-center gap-3">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text className="text-[15px] text-[#EF4444]" style={{ fontFamily: "Manrope_500Medium" }}>Log Out</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View className="flex flex-row items-center gap-3 px-4 py-[14px] border-b border-[rgba(55,54,54,0.08)]">
      <Ionicons name={icon} size={18} color="#FF6EC7" />
      <View className="flex-1">
        <Text className="text-[11px] text-[#9CA3AF]" style={{ fontFamily: "Manrope_400Regular" }}>{label}</Text>
        <Text className="text-[14px] text-[#050404] mt-[2px]" style={{ fontFamily: "Manrope_500Medium" }}>{value}</Text>
      </View>
    </View>
  );
}
