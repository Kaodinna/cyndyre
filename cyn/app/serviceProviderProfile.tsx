import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type OperatingHours = {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
};

export type ProfileData = {
  coverImage: string;
  businessName: string;
  ownerName: string;
  location: string; // e.g "Los Angeles, CA"
  status: "Active" | "Inactive";

  email: string;
  phone: string;
  address: string;
  website: string;

  about: string;
  hours: OperatingHours;
};

type Props = {
  // optional if you want to pass from parent / server
  initialProfile?: ProfileData;

  // optional: your save handler (API call)
  onSave?: (updated: ProfileData) => Promise<void> | void;
};

export default function MyProfileScreen() {
  const router = useRouter();
  const [initialProfile, setInitialProfile] = useState<ProfileData | null>(
    null,
  );

  const defaultProfile: ProfileData = useMemo(
    () =>
      initialProfile ?? {
        coverImage:
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200",
        businessName: "Glam Studio by Sarah",
        ownerName: "Sarah Johnson",
        location: "Los Angeles, CA",
        status: "Active",
        email: "sarah@glamstudio.com",
        phone: "+1 (555) 123-4567",
        address: "123 Beauty Lane, Los Angeles, CA 90028",
        website: "www.glamstudio.com",
        about:
          "Professional beauty services with over 10 years of experience. Specializing in hair styling, makeup, and nail art.",
        hours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "10:00 AM - 4:00 PM",
          sunday: "Closed",
        },
      },
    [initialProfile],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // “Saved” data
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  // Draft while editing
  const [draft, setDraft] = useState<ProfileData>(defaultProfile);

  const startEdit = () => {
    setDraft(profile); // reset draft to current saved
    setIsEditing(true);
  };
  const onSave = async (updated: ProfileData) => {};
  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // light validation
    if (!draft.businessName.trim()) {
      Alert.alert("Missing info", "Business name is required.");
      return;
    }
    if (!draft.email.trim()) {
      Alert.alert("Missing info", "Email is required.");
      return;
    }

    try {
      setSaving(true);
      await onSave?.(draft); // call your API here
      setProfile(draft); // persist locally
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF]">
      {/* Top bar */}
      <View className="px-4 pt-4 pb-3 flex flex-row items-center justify-between border-b border-[#EAECF0]">
        <View className="flex flex-row items-center gap-[10px]">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color="#101828" />
          </Pressable>
          <Text
            className="text-[14px] text-[#101828]"
            style={{ fontFamily: "Manrope_700Bold" }}
          >
            My Profile
          </Text>
        </View>

        {/* Right button */}
        {!isEditing ? (
          <Pressable
            onPress={startEdit}
            className="h-[32px] px-[12px] rounded-[10px] bg-[#F6339A] flex flex-row items-center gap-[6px] justify-center"
          >
            <Ionicons name="pencil" size={14} color="#FFFFFF" />
            <Text
              className="text-[12px] text-[#FFFFFF]"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              Edit
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className={`h-[32px] px-[12px] rounded-[10px] flex flex-row items-center gap-[6px] justify-center ${
              saving ? "bg-[#FAD1E8]" : "bg-[#F6339A]"
            }`}
          >
            <Ionicons name="save-outline" size={14} color="#FFFFFF" />
            <Text
              className="text-[12px] text-[#FFFFFF]"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              {saving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-4 py-4 gap-[12px]">
            {/* Cover + basic info card */}
            <View className="border border-[#EAECF0] rounded-[14px] overflow-hidden bg-[#FFFFFF]">
              <Image
                source={{ uri: (isEditing ? draft : profile)?.coverImage }}
                style={{ width: "100%", height: 150 }}
                resizeMode="cover"
              />

              <View className="p-[12px] gap-[10px]">
                {/* Business name (editable) */}
                {isEditing ? (
                  <InputField
                    value={draft.businessName}
                    onChangeText={(v) =>
                      setDraft((p) => ({ ...p, businessName: v }))
                    }
                    placeholder="Business name"
                  />
                ) : (
                  <Text
                    className="text-[14px] text-[#101828]"
                    style={{ fontFamily: "Manrope_700Bold" }}
                  >
                    {profile.businessName}
                  </Text>
                )}

                {/* Owner + location + status */}
                <View className="flex flex-row items-center justify-between">
                  <View className="gap-[6px]">
                    {isEditing ? (
                      <>
                        <InputField
                          value={draft.ownerName}
                          onChangeText={(v) =>
                            setDraft((p) => ({ ...p, ownerName: v }))
                          }
                          placeholder="Owner name"
                        />
                        <View className="flex flex-row items-center gap-[6px] mt-[2px]">
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#667085"
                          />
                          <TextInput
                            value={draft.location}
                            onChangeText={(v) =>
                              setDraft((p) => ({ ...p, location: v }))
                            }
                            placeholder="Location"
                            placeholderTextColor="#98A2B3"
                            className="text-[12px] text-[#667085] flex-1"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <Text
                          className="text-[12px] text-[#667085]"
                          style={{ fontFamily: "Manrope_400Regular" }}
                        >
                          {profile.ownerName}
                        </Text>
                        <View className="flex flex-row items-center gap-[6px]">
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#667085"
                          />
                          <Text
                            className="text-[12px] text-[#667085]"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          >
                            {profile.location}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>

                  <StatusPill status={(isEditing ? draft : profile).status} />
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <Card title="Contact Information">
              <InfoRow
                icon="mail-outline"
                label="Email"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).email}
                onChange={(v) => setDraft((p) => ({ ...p, email: v }))}
              />
              <Divider />
              <InfoRow
                icon="call-outline"
                label="Phone"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).phone}
                onChange={(v) => setDraft((p) => ({ ...p, phone: v }))}
              />
              <Divider />
              <InfoRow
                icon="location-outline"
                label="Address"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).address}
                onChange={(v) => setDraft((p) => ({ ...p, address: v }))}
              />
              <Divider />
              <InfoRow
                icon="globe-outline"
                label="Website"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).website}
                onChange={(v) => setDraft((p) => ({ ...p, website: v }))}
              />
            </Card>

            {/* About */}
            <Card title="About">
              {isEditing ? (
                <TextInput
                  value={draft.about}
                  onChangeText={(v) => setDraft((p) => ({ ...p, about: v }))}
                  placeholder="Write something about your business..."
                  placeholderTextColor="#98A2B3"
                  multiline
                  textAlignVertical="top"
                  className="min-h-[90px] rounded-[12px] border border-[#EAECF0] bg-[#FFFFFF] px-[12px] py-[10px] text-[13px] text-[#101828]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                />
              ) : (
                <Text
                  className="text-[13px] text-[#667085]"
                  style={{ fontFamily: "Manrope_400Regular", lineHeight: 18 }}
                >
                  {profile.about}
                </Text>
              )}
            </Card>

            {/* Operating Hours */}
            <Card title="Operating Hours">
              <HoursRow
                day="Monday"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).hours.monday}
                onChange={(v) =>
                  setDraft((p) => ({ ...p, hours: { ...p.hours, monday: v } }))
                }
              />
              <HoursRow
                day="Tuesday"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).hours.tuesday}
                onChange={(v) =>
                  setDraft((p) => ({ ...p, hours: { ...p.hours, tuesday: v } }))
                }
              />
              <HoursRow
                day="Wednesday"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).hours.wednesday}
                onChange={(v) =>
                  setDraft((p) => ({
                    ...p,
                    hours: { ...p.hours, wednesday: v },
                  }))
                }
              />
              <HoursRow
                day="Thursday"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).hours.thursday}
                onChange={(v) =>
                  setDraft((p) => ({
                    ...p,
                    hours: { ...p.hours, thursday: v },
                  }))
                }
              />
              <HoursRow
                day="Friday"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).hours.friday}
                onChange={(v) =>
                  setDraft((p) => ({ ...p, hours: { ...p.hours, friday: v } }))
                }
              />
              <HoursRow
                day="Saturday"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).hours.saturday}
                onChange={(v) =>
                  setDraft((p) => ({
                    ...p,
                    hours: { ...p.hours, saturday: v },
                  }))
                }
              />
              <HoursRow
                day="Sunday"
                isEditing={isEditing}
                value={(isEditing ? draft : profile).hours.sunday}
                onChange={(v) =>
                  setDraft((p) => ({ ...p, hours: { ...p.hours, sunday: v } }))
                }
              />
            </Card>

            {/* Cancel button only in edit mode (nice UX) */}
            {isEditing ? (
              <Pressable
                onPress={cancelEdit}
                className="h-[44px] rounded-[12px] border border-[#D0D5DD] bg-[#FFFFFF] items-center justify-center"
              >
                <Text
                  className="text-[13px] text-[#344054]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  Cancel Editing
                </Text>
              </Pressable>
            ) : null}

            <View className="h-[24px]" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- UI helpers ---------- */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="border border-[#EAECF0] rounded-[14px] bg-[#FFFFFF] p-[12px] gap-[10px]">
      <Text
        className="text-[12px] text-[#101828]"
        style={{ fontFamily: "Manrope_700Bold" }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Divider() {
  return <View className="h-[1px] bg-[#EAECF0]" />;
}

function StatusPill({ status }: { status: "Active" | "Inactive" }) {
  const active = status === "Active";
  return (
    <View
      className={`h-[22px] px-[10px] rounded-full items-center justify-center ${
        active ? "bg-[#ECFDF3]" : "bg-[#FEE4E2]"
      }`}
    >
      <Text
        className={`text-[11px] ${active ? "text-[#12B76A]" : "text-[#F04438]"}`}
        style={{ fontFamily: "Manrope_600SemiBold" }}
      >
        {status}
      </Text>
    </View>
  );
}

function InputField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#98A2B3"
      className="h-[44px] rounded-[12px] border border-[#EAECF0] bg-[#FFFFFF] px-[12px] text-[14px] text-[#101828]"
      style={{ fontFamily: "Manrope_400Regular" }}
    />
  );
}

function InfoRow({
  icon,
  label,
  value,
  isEditing,
  onChange,
}: {
  icon: any;
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <View className="flex flex-row items-center gap-[10px]">
      <Ionicons name={icon} size={16} color="#667085" />
      <View className="flex-1">
        <Text
          className="text-[12px] text-[#667085]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {label}
        </Text>

        {isEditing ? (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={label}
            placeholderTextColor="#98A2B3"
            className="h-[40px] rounded-[12px] border border-[#EAECF0] bg-[#FFFFFF] px-[10px] text-[13px] text-[#101828] mt-[6px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          />
        ) : (
          <Text
            className="text-[13px] text-[#101828] mt-[2px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

function HoursRow({
  day,
  value,
  isEditing,
  onChange,
}: {
  day: string;
  value: string;
  isEditing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <View className="flex flex-row items-center justify-between">
      <Text
        className="text-[12px] text-[#667085]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {day}
      </Text>

      {isEditing ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="e.g 9:00 AM - 6:00 PM"
          placeholderTextColor="#98A2B3"
          className="h-[34px] w-[150px] rounded-[10px] border border-[#EAECF0] bg-[#FFFFFF] px-[10px] text-[12px] text-[#101828] text-right"
          style={{ fontFamily: "Manrope_400Regular" }}
        />
      ) : (
        <Text
          className="text-[12px] text-[#101828]"
          style={{ fontFamily: "Manrope_600SemiBold" }}
        >
          {value}
        </Text>
      )}
    </View>
  );
}
