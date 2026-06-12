import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect, useState } from "react";
import {
  addShippingAddress,
  deleteShippingAddress,
  getShippingAddress,
} from "@/services/api/request";
import {
  CustomDropdown,
  CustomTextInput,
  EmptyList,
  ToggleButton,
} from "@/components/reusables";
import BottomSheet from "@/components/bottomSheet";
import { useAuth } from "@/components/AuthContext";

type FormData = {
  country: string;
  address: string;
  townOrCity: string;
  state: string;
  postalCode: string;
};
type FormErrors = Partial<Record<keyof FormData, string>>;

const EMPTY_FORM: FormData = {
  country: "",
  address: "",
  townOrCity: "",
  state: "",
  postalCode: "",
};

const countries = [
  { label: "Nigeria", value: "Nigeria" },
  { label: "Ghana", value: "Ghana" },
  { label: "United States", value: "United States" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "Canada", value: "Canada" },
];

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.country.trim()) errors.country = "Country is required";
  if (!data.address.trim()) errors.address = "Address is required";
  if (!data.postalCode.trim()) errors.postalCode = "Postal Code is required";
  if (!data.state.trim()) errors.state = "State is required";
  if (!data.townOrCity.trim()) errors.townOrCity = "Town Or City is required";
  return errors;
}

export default function ShippingAddressScreen() {
  const { user } = useAuth();
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;
    try {
      setListLoading(true);
      const res = await getShippingAddress(user.id);
      setAddresses((res as any).data ?? []);
    } catch {
      setAddresses([]);
    } finally {
      setListLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      setSaving(true);
      await addShippingAddress({ ...formData, isDefault: isEnabled });
      setSheetVisible(false);
      setFormData(EMPTY_FORM);
      setIsEnabled(false);
      setErrors({});
      await fetchAddresses();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ?? "Failed to save address. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteShippingAddress(id);
            await fetchAddresses();
          } catch {
            Alert.alert("Error", "Failed to delete address. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F8FF]" edges={["bottom"]}>
      <View className="flex-1">
        {listLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF6EC7" />
          </View>
        ) : (
          <FlatList
            className="pt-4"
            data={addresses}
            renderItem={({ item }) => (
              <View
                className="rounded-[8px] border-[0.25px] border-[rgb(230,230,230)] bg-white p-4 mb-3 mx-4"
                style={styles.card}
              >
                <View className="flex flex-row justify-between items-center">
                  <View className="flex-1 mr-2">
                    <Text
                      className="text-[12px] text-[#050404]"
                      style={{ fontFamily: "Manrope_600SemiBold" }}
                    >
                      {[item.address, item.townOrCity, item.state]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                    {item.country || item.postalCode ? (
                      <Text
                        className="text-[11px] text-[#585757] mt-1"
                        style={{ fontFamily: "Manrope_400Regular" }}
                      >
                        {[item.country, item.postalCode].filter(Boolean).join(" · ")}
                      </Text>
                    ) : null}
                    {item.isDefault && (
                      <View className="mt-1 self-start bg-[#FFD2EE] px-2 py-[2px] rounded-full">
                        <Text
                          className="text-[10px] text-[#C6005C]"
                          style={{ fontFamily: "Manrope_600SemiBold" }}
                        >
                          Default
                        </Text>
                      </View>
                    )}
                  </View>
                  <Pressable onPress={() => handleDelete(item.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color="#FF4444" />
                  </Pressable>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyList message="You have no Shipping Address" />
            }
          />
        )}
        <Pressable
          className="bg-[#FF6EC7] py-[12px] rounded-[8px] mb-4 mx-4"
          onPress={() => setSheetVisible(true)}
        >
          <Text
            className="text-center text-[16px] text-white"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            Add New Address
          </Text>
        </Pressable>
      </View>

      <BottomSheet
        visible={isSheetVisible}
        onClose={() => {
          setSheetVisible(false);
          setErrors({});
          setFormData(EMPTY_FORM);
        }}
        title={"Add New Shipping Address"}
        maxHeight={0.94}
        footer={
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className="flex-1 h-[48px] rounded-[4px] bg-[#FF6EC7] flex flex-row justify-center items-center gap-[8px]"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-[16px]">Save</Text>
            )}
          </Pressable>
        }
      >
        <View className="flex flex-col gap-[12px] mb-4">
          <CustomDropdown
            label="Country"
            placeholder="Select Country"
            value={formData.country}
            onSelect={(text) => handleInputChange("country", text)}
            options={countries}
            errorMessage={errors.country}
          />
          <CustomTextInput
            label="Delivery Address"
            value={formData.address}
            onChangeText={(text) => handleInputChange("address", text)}
            placeholder="Delivery Address"
            placeholderTextColor={"#0A0A0A80"}
            errorMessage={errors.address}
          />
          <CustomTextInput
            label="Town/City"
            value={formData.townOrCity}
            onChangeText={(text) => handleInputChange("townOrCity", text)}
            placeholder="Town/City"
            placeholderTextColor={"#0A0A0A80"}
            errorMessage={errors.townOrCity}
          />
          <CustomTextInput
            label="State"
            value={formData.state}
            onChangeText={(text) => handleInputChange("state", text)}
            placeholder="State"
            placeholderTextColor={"#0A0A0A80"}
            errorMessage={errors.state}
          />
          <CustomTextInput
            label="Postal Code"
            value={formData.postalCode}
            onChangeText={(text) => handleInputChange("postalCode", text)}
            placeholder="Postal Code"
            placeholderTextColor={"#0A0A0A80"}
            errorMessage={errors.postalCode}
          />
          <View className="flex flex-row items-center justify-between">
            <Text
              className="text-center text-[16px] text-[#373636]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Set as default shipping address
            </Text>
            <ToggleButton
              value={isEnabled}
              onToggle={setIsEnabled}
              trueLabel="Yes"
              falseLabel="No"
              size="medium"
            />
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 14,
  },
});
