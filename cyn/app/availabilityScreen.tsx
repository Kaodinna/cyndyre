import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  InfoAlert,
  WorkingHourRow,
  UnavailableDateRow,
} from "@/components/reusables";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AvailabilityScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F8FF]"
      style={{ paddingTop: Platform.OS === "android" ? 40 : 0 }}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.push("/(drawer)/(tabs)")}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-gray-900">
          Availability Management
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Cancellation Policy */}
        <InfoAlert
          title="Cancellation Policy"
          description="If you cancel a confirmed appointment less than 48 hours before the booking time, you must provide a full refund to the customer and will forfeit the platform service charge."
        />

        {/* Working Hours */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-[14px] font-semibold text-gray-900 mb-3">
            Regular Working Hours
          </Text>

          {DAYS.map((day) => (
            <WorkingHourRow key={day} day={day} />
          ))}

          <TouchableOpacity className="mt-4 bg-pink-500 rounded-full py-3">
            <Text className="text-center text-white font-semibold">
              Save Working Hours
            </Text>
          </TouchableOpacity>
        </View>

        {/* Unavailable Dates */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[14px] font-semibold text-gray-900">
              Unavailable Dates
            </Text>

            <TouchableOpacity className="bg-pink-100 px-3 py-1 rounded-full">
              <Text className="text-pink-600 text-[12px] font-medium">
                + Add Date
              </Text>
            </TouchableOpacity>
          </View>

          <UnavailableDateRow date="Dec 5, 2025" />
          <UnavailableDateRow date="Dec 12, 2025" />
          <UnavailableDateRow date="Dec 25, 2025" />
        </View>

        {/* Emergency Guidelines */}
        <InfoAlert
          title="Emergency & Rescheduling Guidelines"
          description="For unforeseen emergencies (rarely happens), contact Cynderalla support immediately. The platform will help you reschedule the appointment or manage compensation. All changes must be communicated through the platform."
          variant="danger"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
