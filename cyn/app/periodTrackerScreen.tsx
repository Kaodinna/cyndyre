import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

const PINK = "#F062B0";
const PINK_DARK = "#E94AA6";
const BG = "#F6F7FB";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const CARD = "#FFFFFF";

function formatPretty(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function PeriodTrackerScreen() {
  // “draftDate” = date picked in calendar, “savedDate” = date confirmed by Select button
  const [draftDate, setDraftDate] = useState<string | null>(null);
  const [savedDate, setSavedDate] = useState<string | null>(null);

  // These can come from user profile later
  const [periodLength] = useState<number>(4);
  const [cycleLength] = useState<number>(28);

  // Overlay card visible in your screenshot
  const [showOverlay, setShowOverlay] = useState(true);

  const markedDates = useMemo(() => {
    if (!draftDate) return {};
    return {
      [draftDate]: {
        selected: true,
        selectedColor: PINK,
        selectedTextColor: "#FFF",
      },
    };
  }, [draftDate]);

  const canSelect = Boolean(draftDate);

  const handleClose = () => {
    // close overlay without saving
    setShowOverlay(false);
  };

  const handleSelect = () => {
    if (!draftDate) return;
    setSavedDate(draftDate);
    setShowOverlay(false);
  };

  const handleOpenOverlay = () => {
    // allow user reopen overlay by tapping calendar area
    setShowOverlay(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top area */}
        <View style={styles.topBar}>
          <View style={styles.avatar} />
          <View style={styles.topTextWrap}>
            <Text style={styles.greeting}>Hi, Kaodinna</Text>
          </View>
          <Text style={styles.title}>Period Tracker</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Helper line (pink) */}
        <Text style={styles.helper}>
          You need to provide a menstrual date for the tracker to work.
        </Text>

        {/* Calendar card */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleOpenOverlay}>
          <View style={styles.calendarCard}>
            <Calendar
              current={draftDate ?? undefined}
              onDayPress={(day) => setDraftDate(day.dateString)}
              markedDates={markedDates}
              theme={{
                arrowColor: PINK,
                todayTextColor: PINK_DARK,
                textSectionTitleColor: MUTED,
                monthTextColor: TEXT,
              }}
              style={{ borderRadius: 16 }}
            />

            {/* Overlay question card (this matches your screenshot layout) */}
            {showOverlay && (
              <View style={styles.overlayCard}>
                <Text style={styles.overlayQuestion}>
                  When was the date for your last period?
                </Text>

                <View style={styles.overlayBtns}>
                  <TouchableOpacity
                    onPress={handleClose}
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
                    <Text
                      style={[
                        styles.overlayBtnSolidText,
                        !canSelect && styles.overlayBtnSolidTextDisabled,
                      ]}
                    >
                      Select
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Last Menstrual Period section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Last Menstrual Period</Text>

          <Row
            label="Period date"
            value={savedDate ? formatPretty(savedDate) : "Not selected"}
            active={Boolean(savedDate)}
          />
          <Row
            label="Period length"
            value={`${periodLength} days`}
            active={true}
          />
          <Row
            label="Cycle length"
            value={`${cycleLength} days`}
            active={true}
          />
        </View>

        {/* Bottom CTA */}
        <TouchableOpacity
          disabled={!savedDate}
          style={[styles.cta, !savedDate && styles.ctaDisabled]}
        >
          <Text style={[styles.ctaText, !savedDate && styles.ctaTextDisabled]}>
            Save & Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, active ? styles.dotActive : styles.dotMuted]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, !active && { color: MUTED }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16, paddingBottom: 30 },
  topBar: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
  },
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
  helper: {
    color: PINK_DARK,
    marginTop: 6,
    marginBottom: 12,
    fontSize: 12,
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
  overlayQuestion: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },
  overlayBtns: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
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
  overlayBtnSolidTextDisabled: { color: "#FFF" },

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
  sectionTitle: { color: TEXT, fontWeight: "700", marginBottom: 10 },

  row: { flexDirection: "row", gap: 10, paddingVertical: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  dotActive: { backgroundColor: PINK },
  dotMuted: { backgroundColor: "#D1D5DB" },
  rowLabel: { color: MUTED, fontSize: 11 },
  rowValue: { color: TEXT, fontSize: 13, fontWeight: "600", marginTop: 2 },

  cta: {
    marginTop: 16,
    backgroundColor: PINK,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaDisabled: { backgroundColor: "#F3C1DD" },
  ctaText: { color: "#FFF", fontWeight: "800" },
  ctaTextDisabled: { color: "#FFF" },
});
