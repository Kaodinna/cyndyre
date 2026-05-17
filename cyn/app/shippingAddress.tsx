import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getShippingAddress } from "@/services/api/request";
import {
  CustomDropdown,
  CustomTextInput,
  EmptyList,
  ToggleButton,
} from "@/components/reusables";
import BottomSheet from "@/components/bottomSheet";

export default function ShippingAddressScreen() {
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [address, setAddress] = useState<any>();
  const [isEnabled, setIsEnabled] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    country: "",
    address: "",
    townOrCity: "",
    state: "",
    postalCode: "",
  });
  type FormData = {
    country: string;
    address: string;
    townOrCity: string;
    state: string;
    postalCode: string;
  };
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await getShippingAddress("67367ece6cec8afc58094a1e");
        console.log("response", response);
        setAddress(response.data);
      } catch (error: any) {
        setError(error);
      }
    };

    fetchAddress();
  }, []);
  const countries = [
    { label: "Nigeria", value: "Nigeria" },
    { label: "Ghana", value: "Ghana" },
    { label: "United States", value: "United States" },
    { label: "United Kingdom", value: "United Kingdom" },
    { label: "Canada", value: "Canada" },
  ];
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  type ItemProps = { address: string };
  type FormErrors = Partial<Record<keyof FormData, string>>;

  const validateForm = (data: FormData): FormErrors => {
    const errors: FormErrors = {};

    if (!data.country.trim()) {
      errors.country = "Country is required";
    }

    if (!data.address.trim()) {
      errors.address = "Address is required";
    }

    if (!data.postalCode.trim()) {
      errors.postalCode = "Postal Code is required";
    }

    if (data.state.trim()) {
      errors.state = "State is required";
    }

    if (data.townOrCity.trim()) {
      errors.townOrCity = "Town Or City is required";
    }

    return errors;
  };
  const Item = ({ address }: ItemProps) => (
    <View
      className="rounded-[8px] border-[0.25px] border-[rgb(230,230,230)] bg-white p-4 mb-3 mx-4"
      style={styles.card}
    >
      <View className="flex flex-row justify-between items-center">
        <View className="w-[90%]">
          <Text
            className="text-[12px] "
            style={{ fontFamily: "Manrope_600SemiBold" }}
          >
            {address}
          </Text>
        </View>

        <View className="flex flex-row w-[10%] items-end">
          <Feather name="edit" size={16} color="black" className="mr-[6px]" />
          <Ionicons name="trash-outline" size={16} color="black" />
        </View>
      </View>
    </View>
  );
  return (
    <SafeAreaView className="flex-1 bg-[#F8F8FF] " edges={["bottom"]}>
      <View className="flex-1 ">
        <FlatList
          className="pt-4"
          data={address}
          renderItem={({ item }) => <Item address={item.address} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyList message="You have no Shipping Address" />
          }
        />
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
        onClose={() => setSheetVisible(false)}
        title={"Add New Shipping Address"}
        maxHeight={0.94} // 60% of screen height
        footer={
          <Pressable
            className="flex-1 h-[48px] rounded-[4px] bg-[#FF6EC7]
                       flex flex-row justify-center items-center gap-[8px]"
          >
            <Text className="text-white text-[16px]">Save</Text>
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
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 14,
  },
});
