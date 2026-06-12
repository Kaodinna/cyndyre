import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Pressable,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  InfoAlert,
  WorkingHourRow,
  UnavailableDateRow,
} from "@/components/reusables";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  getServiceProvider,
  getProviderAvailability,
  createProviderAvailability,
  updateProviderAvailability,
  deleteProviderAvailability,
} from "@/services/api/request";

const DAYS = [
  { label: "Mon", dayOfWeek: 1 },
  { label: "Tue", dayOfWeek: 2 },
  { label: "Wed", dayOfWeek: 3 },
  { label: "Thu", dayOfWeek: 4 },
  { label: "Fri", dayOfWeek: 5 },
  { label: "Sat", dayOfWeek: 6 },
  { label: "Sun", dayOfWeek: 0 },
];

type DaySlot = {
  id?: string;
  enabled: boolean;
  startTime: Date;
  endTime: Date;
};

type UnavailableDate = {
  id: string;
  date: string;
  displayDate: string;
};

const toHHmm = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

const fromHHmm = (hhmm: string): Date => {
  const [h, m] = (hhmm ?? "09:00").split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const makeDefault9to5 = (): { start: Date; end: Date } => {
  const s = new Date(); s.setHours(9, 0, 0, 0);
  const e = new Date(); e.setHours(17, 0, 0, 0);
  return { start: s, end: e };
};

const formatDisplayDate = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const buildDefaultSlots = (): Record<number, DaySlot> => {
  const result: Record<number, DaySlot> = {};
  for (const { dayOfWeek } of DAYS) {
    const { start, end } = makeDefault9to5();
    result[dayOfWeek] = { enabled: false, startTime: start, endTime: end };
  }
  return result;
};

export default function AvailabilityScreen() {
  const [providerId, setProviderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataKey, setDataKey] = useState(0);

  const [daySlots, setDaySlots] = useState<Record<number, DaySlot>>(buildDefaultSlots);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickedDate, setPickedDate] = useState(new Date());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const provider = await getServiceProvider();
      const pid: string = provider?._id ?? provider?.id ?? "";
      if (!pid) return;
      setProviderId(pid);

      const slots: any[] = await getProviderAvailability(pid);
      const newSlots = buildDefaultSlots();
      const newUnavailable: UnavailableDate[] = [];

      for (const slot of slots) {
        if (slot.specificDate) {
          if (slot.isAvailable === false) {
            const raw = typeof slot.specificDate === "string"
              ? slot.specificDate
              : new Date(slot.specificDate).toISOString();
            const dateStr = raw.slice(0, 10);
            newUnavailable.push({
              id: slot._id ?? slot.id,
              date: dateStr,
              displayDate: formatDisplayDate(dateStr),
            });
          }
        } else if (slot.isAvailable !== false) {
          const dow: number = slot.dayOfWeek;
          newSlots[dow] = {
            id: slot._id ?? slot.id,
            enabled: true,
            startTime: fromHHmm(slot.startTime),
            endTime: fromHHmm(slot.endTime),
          };
        }
      }

      setDaySlots(newSlots);
      setUnavailableDates(newUnavailable);
      setDataKey((k) => k + 1);
    } catch (e) {
      console.error("loadData error:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateDaySlot = useCallback(
    (dayOfWeek: number, enabled: boolean, startTime: Date, endTime: Date) => {
      setDaySlots((prev) => ({
        ...prev,
        [dayOfWeek]: { ...prev[dayOfWeek], enabled, startTime, endTime },
      }));
    },
    [],
  );

  const saveWorkingHours = async () => {
    if (!providerId) return;
    try {
      setSaving(true);
      for (const { dayOfWeek } of DAYS) {
        const slot = daySlots[dayOfWeek];
        const startStr = toHHmm(slot.startTime);
        const endStr = toHHmm(slot.endTime);

        if (slot.enabled) {
          if (slot.id) {
            await updateProviderAvailability(slot.id, { startTime: startStr, endTime: endStr });
          } else {
            const result = await createProviderAvailability({
              dayOfWeek,
              startTime: startStr,
              endTime: endStr,
              isAvailable: true,
            });
            const newId = result?.data?._id ?? result?.data?.id ?? result?._id ?? result?.id;
            if (newId) {
              setDaySlots((prev) => ({
                ...prev,
                [dayOfWeek]: { ...prev[dayOfWeek], id: newId },
              }));
            }
          }
        } else if (slot.id) {
          await deleteProviderAvailability(slot.id);
          setDaySlots((prev) => ({
            ...prev,
            [dayOfWeek]: { ...prev[dayOfWeek], id: undefined },
          }));
        }
      }
      Alert.alert("Saved", "Working hours updated successfully.");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addUnavailableDate = async (date: Date) => {
    if (!providerId) return;
    const dateStr = date.toISOString().slice(0, 10);
    if (unavailableDates.find((d) => d.date === dateStr)) return;
    try {
      const result = await createProviderAvailability({
        dayOfWeek: date.getDay(),
        startTime: "00:00",
        endTime: "23:59",
        isAvailable: false,
        specificDate: dateStr,
      });
      const id = result?.data?._id ?? result?.data?.id ?? result?._id ?? result?.id;
      if (id) {
        setUnavailableDates((prev) => [
          ...prev,
          { id, date: dateStr, displayDate: formatDisplayDate(dateStr) },
        ]);
      }
    } catch {
      Alert.alert("Error", "Could not add unavailable date.");
    }
  };

  const removeUnavailableDate = async (id: string) => {
    try {
      await deleteProviderAvailability(id);
      setUnavailableDates((prev) => prev.filter((d) => d.id !== id));
    } catch {
      Alert.alert("Error", "Could not remove date.");
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F8FF]"
      style={{ paddingTop: Platform.OS === "android" ? 40 : 0 }}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
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
        <InfoAlert
          title="Cancellation Policy"
          description="If you cancel a confirmed appointment less than 48 hours before the booking time, you must provide a full refund to the customer and will forfeit the platform service charge."
        />

        {/* Working Hours */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-[14px] font-semibold text-gray-900 mb-3">
            Regular Working Hours
          </Text>

          {loading ? (
            <Text className="text-[13px] text-gray-400 text-center py-4">
              Loading availability...
            </Text>
          ) : (
            DAYS.map(({ label, dayOfWeek }) => (
              <WorkingHourRow
                key={`${dayOfWeek}_${dataKey}`}
                day={label}
                initialEnabled={daySlots[dayOfWeek]?.enabled ?? false}
                initialStartTime={daySlots[dayOfWeek]?.startTime}
                initialEndTime={daySlots[dayOfWeek]?.endTime}
                onChange={(enabled, start, end) =>
                  updateDaySlot(dayOfWeek, enabled, start, end)
                }
              />
            ))
          )}

          <TouchableOpacity
            className={`mt-4 rounded-full py-3 ${saving || loading ? "bg-pink-300" : "bg-pink-500"}`}
            onPress={saveWorkingHours}
            disabled={saving || loading}
          >
            <Text className="text-center text-white font-semibold">
              {saving ? "Saving..." : "Save Working Hours"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Unavailable Dates */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[14px] font-semibold text-gray-900">
              Unavailable Dates
            </Text>
            <TouchableOpacity
              className="bg-pink-100 px-3 py-1 rounded-full"
              onPress={() => setShowDatePicker(true)}
            >
              <Text className="text-pink-600 text-[12px] font-medium">+ Add Date</Text>
            </TouchableOpacity>
          </View>

          {unavailableDates.length === 0 ? (
            <Text className="text-[12px] text-gray-400 text-center py-2">
              No unavailable dates set
            </Text>
          ) : (
            unavailableDates.map((item) => (
              <UnavailableDateRow
                key={item.id}
                date={item.displayDate}
                onDelete={() => removeUnavailableDate(item.id)}
              />
            ))
          )}
        </View>

        <InfoAlert
          title="Emergency & Rescheduling Guidelines"
          description="For unforeseen emergencies, contact Cynderalla support immediately. The platform will help you reschedule the appointment or manage compensation. All changes must be communicated through the platform."
          variant="danger"
        />
      </ScrollView>

      {/* Android date picker */}
      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={pickedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) addUnavailableDate(date);
          }}
        />
      )}

      {/* iOS date picker modal */}
      {Platform.OS === "ios" && (
        <Modal transparent visible={showDatePicker} animationType="slide">
          <View className="flex-1 justify-end bg-black/30">
            <View className="bg-white p-4 rounded-t-2xl">
              <DateTimePicker
                value={pickedDate}
                mode="date"
                display="spinner"
                textColor="#111827"
                themeVariant="light"
                minimumDate={new Date()}
                onChange={(_, date) => date && setPickedDate(date)}
              />
              <View className="flex-row gap-3 mt-4">
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-lg items-center"
                >
                  <Text className="text-gray-700">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setShowDatePicker(false);
                    addUnavailableDate(pickedDate);
                  }}
                  className="flex-1 py-3 bg-pink-500 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold">Add Date</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
