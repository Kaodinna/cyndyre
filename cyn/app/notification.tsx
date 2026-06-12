import {
  Text,
  Pressable,
  View,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/api/request";

const TYPE_CONFIG: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  period_reminder: { color: "#F062B0", icon: "calendar-outline" },
  ovulation_reminder: { color: "#8B5CF6", icon: "flower-outline" },
  general: { color: "#3B82F6", icon: "notifications-outline" },
};

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await markNotificationRead(id).catch(() => {});
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F8FF]"
      style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#F3F3F3]">
        <Pressable onPress={() => router.back()} className="w-8 h-8 items-center justify-center">
          <Ionicons name="arrow-back" size={22} color="#050404" />
        </Pressable>
        <Text className="text-[17px] text-[#050404]" style={{ fontFamily: "Manrope_700Bold" }}>
          Notifications
        </Text>
        {unreadCount > 0 ? (
          <Pressable onPress={handleMarkAllRead} disabled={markingAll}>
            <Text
              className="text-[12px] text-[#FF6EC7]"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              {markingAll ? "…" : "Mark all read"}
            </Text>
          </Pressable>
        ) : (
          <View className="w-20" />
        )}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6EC7" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
          <Text
            className="text-[15px] text-[#9CA3AF] mt-4 text-center"
            style={{ fontFamily: "Manrope_500Medium" }}
          >
            No notifications yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id ?? item._id}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => {
            const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.general;
            return (
              <Pressable
                onPress={() => handleMarkRead(item.id ?? item._id)}
                className={`flex-row gap-3 px-4 py-4 border-b border-[#F3F3F3] ${!item.read ? "bg-[#FFF5FB]" : "bg-white"}`}
              >
                {/* Icon dot */}
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mt-[2px] flex-shrink-0"
                  style={{ backgroundColor: config.color + "20" }}
                >
                  <Ionicons name={config.icon} size={20} color={config.color} />
                </View>

                <View className="flex-1">
                  <View className="flex-row justify-between items-center">
                    <Text
                      className="text-[14px] text-[#050404] flex-1 mr-2"
                      style={{ fontFamily: "Manrope_600SemiBold" }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="text-[11px] text-[#9CA3AF]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      {item.createdAt ? timeAgo(item.createdAt) : ""}
                    </Text>
                  </View>
                  <Text
                    className="text-[13px] text-[#585757] mt-[4px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                    numberOfLines={3}
                  >
                    {item.body}
                  </Text>
                </View>

                {!item.read && (
                  <View className="w-2 h-2 rounded-full bg-[#FF6EC7] mt-[6px] flex-shrink-0" />
                )}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
