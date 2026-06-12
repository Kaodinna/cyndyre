import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/components/AuthContext";
import { getPeriodTrackerData, savePeriodTrackerData } from "@/services/api/request";

const PINK = "#F062B0";
const PINK_DARK = "#E94AA6";
const BG = "#F6F7FB";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const CARD = "#FFFFFF";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatPretty(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function buildMarkedDates(savedDate: string | null, periodLength: number, cycleLength: number) {
  if (!savedDate) return {};
  const marks: Record<string, any> = {};

  // Mark the current period window (pink)
  for (let i = 0; i < periodLength; i++) {
    const d = addDays(savedDate, i);
    marks[d] = {
      startingDay: i === 0,
      endingDay: i === periodLength - 1,
      color: PINK,
      textColor: "#fff",
    };
  }

  // Mark ovulation day (purple)
  const ovulationDay = addDays(savedDate, cycleLength - 14);
  marks[ovulationDay] = {
    selected: true,
    selectedColor: "#8B5CF6",
    marked: true,
  };

  // Mark predicted next period start (lighter pink)
  const nextPeriod = addDays(savedDate, cycleLength);
  marks[nextPeriod] = {
    selected: true,
    selectedColor: "#FBBF24",
    marked: true,
  };

  return marks;
}

export default function PeriodTrackerScreen() {
  const { user } = useAuth();

  const [draftDate, setDraftDate] = useState<string | null>(null);
  const [savedDate, setSavedDate] = useState<string | null>(null);
  const [periodLength, setPeriodLength] = useState<number>(4);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [showOverlay, setShowOverlay] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);
      const data = await getPeriodTrackerData();
      if (data) {
        if (data.lastPeriodDate) setSavedDate(data.lastPeriodDate);
        if (data.periodLength) setPeriodLength(data.periodLength);
        if (data.cycleLength) setCycleLength(data.cycleLength);
        setShowOverlay(!data.lastPeriodDate);
      }
    } catch {
      // no existing data — keep defaults
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const predictions = useMemo(() => {
    if (!savedDate) return null;
    const nextPeriod = addDays(savedDate, cycleLength);
    const ovulation = addDays(savedDate, cycleLength - 14);
    const fertileStart = addDays(savedDate, cycleLength - 19);
    const fertileEnd = addDays(savedDate, cycleLength - 10);
    return { nextPeriod, ovulation, fertileStart, fertileEnd };
  }, [savedDate, cycleLength]);

  const markedDates = useMemo(() => {
    if (draftDate && !savedDate) {
      return {
        [draftDate]: { selected: true, selectedColor: PINK, selectedTextColor: "#FFF" },
      };
    }
    return buildMarkedDates(savedDate, periodLength, cycleLength);
  }, [draftDate, savedDate, periodLength, cycleLength]);

  const canSelect = Boolean(draftDate);

  const handleSelect = () => {
    if (!draftDate) return;
    setSavedDate(draftDate);
    setShowOverlay(false);
  };

  const handleSave = async () => {
    if (!savedDate) return;
    try {
      setSaving(true);
      await savePeriodTrackerData({ lastPeriodDate: savedDate, periodLength, cycleLength });
      Alert.alert(
        "Saved",
        "Your period tracker data has been saved.\nYou'll receive email and app reminders 3 days and 1 day before your next period and ovulation.",
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ?? "Failed to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={PINK} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <View style={styles.avatar} />
          <View style={styles.topTextWrap}>
            <Text style={styles.greeting}>Hi, {user?.fullName ?? "there"}</Text>
          </View>
          <Text style={styles.title}>Period Tracker</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={styles.helper}>
          Tap the calendar to set or update your last period start date.
        </Text>

        {/* Legend */}
        <View style={styles.legend}>
          <LegendDot color={PINK} label="Period days" />
          <LegendDot color="#8B5CF6" label="Ovulation" />
          <LegendDot color="#FBBF24" label="Next period" />
        </View>

        {/* Calendar card */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => setShowOverlay(true)}>
          <View style={styles.calendarCard}>
            <Calendar
              current={draftDate ?? savedDate ?? undefined}
              onDayPress={(day) => setDraftDate(day.dateString)}
              markedDates={markedDates}
              markingType={savedDate ? "period" : "simple"}
              theme={{
                arrowColor: PINK,
                todayTextColor: PINK_DARK,
                textSectionTitleColor: MUTED,
                monthTextColor: TEXT,
              }}
              style={{ borderRadius: 16 }}
            />

            {showOverlay && (
              <View style={styles.overlayCard}>
                <Text style={styles.overlayQuestion}>
                  When did your last period start?
                </Text>
                {draftDate && (
                  <Text style={styles.overlaySelected}>
                    Selected: {formatPretty(draftDate)}
                  </Text>
                )}
                <View style={styles.overlayBtns}>
                  <TouchableOpacity
                    onPress={() => setShowOverlay(false)}
                    style={styles.overlayBtnGhost}
                  >
                    <Text style={styles.overlayBtnGhostText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSelect}
                    disabled={!canSelect}
                    style={[
                      styles.overlayBtnSolid,
                      !canSelect && styles.overlayBtnSolidDisabled,
                    ]}
                  >
                    <Text style={styles.overlayBtnSolidText}>Select</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Cycle settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cycle Settings</Text>
          <StepperRow
            label="Period length"
            sublabel="How many days does your period last?"
            value={periodLength}
            min={1}
            max={10}
            unit="days"
            onChange={setPeriodLength}
          />
          <View style={styles.divider} />
          <StepperRow
            label="Cycle length"
            sublabel="Days from one period start to the next"
            value={cycleLength}
            min={21}
            max={45}
            unit="days"
            onChange={setCycleLength}
          />
        </View>

        {/* Last Menstrual Period section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Last Menstrual Period</Text>
          <Row
            label="Period start date"
            value={savedDate ? formatPretty(savedDate) : "Not selected"}
            active={Boolean(savedDate)}
            icon="calendar-outline"
            color={PINK}
          />
          <Row
            label="Period length"
            value={`${periodLength} days`}
            active={true}
            icon="time-outline"
            color={PINK}
          />
          <Row
            label="Cycle length"
            value={`${cycleLength} days`}
            active={true}
            icon="refresh-outline"
            color={PINK}
          />
        </View>

        {/* Predictions section */}
        {predictions && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Predictions</Text>
            <Row
              label="Next period"
              value={formatPretty(predictions.nextPeriod)}
              active={true}
              icon="calendar-outline"
              color="#FBBF24"
            />
            <Row
              label="Ovulation day"
              value={formatPretty(predictions.ovulation)}
              active={true}
              icon="flower-outline"
              color="#8B5CF6"
            />
            <Row
              label="Fertile window"
              value={`${formatPretty(predictions.fertileStart)} – ${formatPretty(predictions.fertileEnd)}`}
              active={true}
              icon="heart-outline"
              color="#10B981"
            />
          </View>
        )}

        {/* Reminder info */}
        <View style={styles.reminderInfo}>
          <Ionicons name="notifications-outline" size={16} color="#8B5CF6" />
          <Text style={styles.reminderText}>
            You'll get email & in-app reminders 3 days and 1 day before your period and ovulation.
          </Text>
        </View>

        {/* Save CTA */}
        <TouchableOpacity
          disabled={!savedDate || saving}
          onPress={handleSave}
          style={[styles.cta, (!savedDate || saving) && styles.ctaDisabled]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.ctaText}>Save & Enable Reminders</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ color: MUTED, fontSize: 11 }}>{label}</Text>
    </View>
  );
}

function StepperRow({
  label,
  sublabel,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepperLabel}>{label}</Text>
        <Text style={styles.stepperSublabel}>{sublabel}</Text>
      </View>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(min, value - 1))}
          style={[styles.stepBtn, value <= min && styles.stepBtnDisabled]}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={16} color={value <= min ? "#D1D5DB" : PINK} />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>
          {value} <Text style={styles.stepperUnit}>{unit}</Text>
        </Text>
        <TouchableOpacity
          onPress={() => onChange(Math.min(max, value + 1))}
          style={[styles.stepBtn, value >= max && styles.stepBtnDisabled]}
          disabled={value >= max}
        >
          <Ionicons name="add" size={16} color={value >= max ? "#D1D5DB" : PINK} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  active,
  icon,
  color,
}: {
  label: string;
  value: string;
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, !active && { color: MUTED }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16, paddingBottom: 40 },
  topBar: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#E5E7EB" },
  topTextWrap: { marginLeft: 10, flex: 1 },
  greeting: { color: MUTED, fontSize: 12 },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
  },
  helper: { color: PINK_DARK, marginTop: 6, marginBottom: 8, fontSize: 12 },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  calendarCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    overflow: "hidden",
  },
  overlayCard: {
    position: "absolute",
    left: 12,
    right: 12,
    top: "48%",
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  overlayQuestion: { color: TEXT, fontSize: 12, fontWeight: "600", marginBottom: 6 },
  overlaySelected: { color: PINK, fontSize: 12, marginBottom: 8, fontWeight: "700" },
  overlayBtns: { flexDirection: "row", justifyContent: "center", gap: 10 },
  overlayBtnGhost: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  overlayBtnGhostText: { color: MUTED, fontWeight: "600", fontSize: 12 },
  overlayBtnSolid: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: PINK,
  },
  overlayBtnSolidDisabled: { backgroundColor: "#F3C1DD" },
  overlayBtnSolidText: { color: "#FFF", fontWeight: "700", fontSize: 12 },
  sectionCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    marginTop: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionTitle: { color: TEXT, fontWeight: "700", marginBottom: 10, fontSize: 13 },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 4 },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  stepperLabel: { color: TEXT, fontSize: 13, fontWeight: "600" },
  stepperSublabel: { color: MUTED, fontSize: 11, marginTop: 2 },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFB5E0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5FB",
  },
  stepBtnDisabled: { borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
  stepperValue: { fontSize: 16, fontWeight: "700", color: TEXT, minWidth: 52, textAlign: "center" },
  stepperUnit: { fontSize: 11, fontWeight: "400", color: MUTED },
  row: { flexDirection: "row", gap: 10, paddingVertical: 10, alignItems: "center" },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { color: MUTED, fontSize: 11 },
  rowValue: { color: TEXT, fontSize: 13, fontWeight: "600", marginTop: 2 },
  reminderInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F5F3FF",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  reminderText: { color: "#5B21B6", fontSize: 12, flex: 1, lineHeight: 18 },
  cta: {
    marginTop: 16,
    backgroundColor: PINK,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaDisabled: { backgroundColor: "#F3C1DD" },
  ctaText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
});
