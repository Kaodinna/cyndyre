import {
  CustomDropdown,
  CustomTextArea,
  CustomTextInput,
  CustomTextInputWithIcon,
  MultiPhotoUploader,
} from "@/components/reusables";
import { Feather, MaterialIcons, Octicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  View,
  Text,
  KeyboardAvoidingView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  addServiceListing,
  getServiceCategories,
} from "@/services/api/request";
import { Category } from "@/types/type";

const CreateListing = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [state, setState] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    basePrice: 0,
    durationMinutes: 0,
    image: "",
  });
  type FormData = {
    name: string;
    description: string;
    categoryId: string;
    basePrice: number;
    durationMinutes: number;
    image: string;
  };

  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const payload = {
      ...formData,
      basePrice: Number(formData.basePrice),
      durationMinutes: Number(formData.durationMinutes),
    };

    try {
      const response = await addServiceListing(payload);

      if (response.success) {
        router.push("/(drawer)/(tabs)/category");
      } else {
        setApiError(
          response.message || "Failed to add service. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setApiError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  type FormErrors = Partial<Record<keyof FormData, string>>;

  const validateForm = (data: FormData): FormErrors => {
    const errors: FormErrors = {};

    if (!data.name.trim()) {
      errors.name = "Name is required";
    }

    if (!data.description.trim()) {
      errors.description = "Description is required";
    }

    if (!data.categoryId.trim()) {
      errors.categoryId = "Category is required";
    }

    if (data.basePrice <= 0) {
      errors.basePrice = "Base price must be greater than 0";
    }

    if (data.durationMinutes <= 0) {
      errors.durationMinutes = "Duration must be greater than 0";
    }

    if (!data.image.trim()) {
      errors.image = "Image is required";
    }

    return errors;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        setLoading(true);
        const [servCatRes] = await Promise.all([getServiceCategories()]);

        setServiceCategories(servCatRes);
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };

    loadVendorData();
  }, []);

  const categoryOptions = serviceCategories.map((category) => ({
    label: category.name ?? "",
    value: category._id ?? "", // or category.slug if you prefer
  }));
  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F8FF]"
      style={{ paddingTop: Platform.OS === "android" ? 40 : 0 }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View className="p-[16px] bg-white border-[#E5E7EB] border-b-[1.24px] flex flex-row justify-between">
          <Pressable
            className="flex flex-row justify-between items-center gap-[16px]"
            onPress={() => {
              router.back();
            }}
          >
            <Octicons name="arrow-left" size={20} color="black" />
            <Text
              className="text-[#101828] text-[16px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Create New Listing
            </Text>
          </Pressable>
          <Text
            className="text-[#4A5565] text-[14px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            Step {state} of 2
          </Text>
        </View>
        <View className="py-[16px] px-4 bg-white border-[#E5E7EB] border-b-[1.24px] flex flex-row gap-[8px] items-center">
          <View className="w-[32px] h-[32px] bg-[#F6339A] rounded-full flex flex-row items-center justify-center">
            <Text
              className="text-[#ffffff] text-[16px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              1
            </Text>
          </View>
          <View
            className={`h-[4px] w-[88px]  ${state === 1 ? "bg-[#E5E7EB]" : "bg-[#F6339A]"}`}
          ></View>
          <View
            className={`w-[32px] h-[32px] rounded-full flex flex-row items-center justify-center ${state === 1 ? "bg-[#E5E7EB]" : "bg-[#F6339A]"}`}
          >
            <Text
              className={` text-[16px] ${state === 1 ? "text-[#4A5565]" : "text-[#ffffff]"}`}
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              2
            </Text>
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="bg-[#F9FAFB]"
        >
          <View>
            {apiError && (
              <Text className="text-red-500 mb-2 text-center">{apiError}</Text>
            )}
            {state === 1 && (
              <View className="px-4 py-[16px] flex flex-col gap-[24px]">
                <View
                  className={`rounded-[14px] p-[24px] bg-white flex flex-col gap-[24px]`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5, // Android shadow
                  }}
                >
                  <Text
                    className="text-[#101828] text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Basic Information
                  </Text>
                  <CustomTextInput
                    label="Service Name"
                    value={formData.name}
                    onChangeText={(text) => handleInputChange("name", text)}
                    placeholder="e.g., Professional Hair Styling"
                    placeholderTextColor={"#0A0A0A80"}
                    errorMessage={errors.name}
                  />
                  <CustomDropdown
                    label="Category"
                    placeholder="Select category"
                    value={formData.categoryId}
                    onSelect={(text) => handleInputChange("categoryId", text)}
                    options={categoryOptions}
                    errorMessage={errors.categoryId}
                  />
                  <CustomTextArea
                    label="Description"
                    placeholder="Describe your service in detail..."
                    value={formData.description}
                    onChangeText={(text) =>
                      handleInputChange("description", text)
                    }
                    numberOfLines={5}
                    errorMessage={errors.description}
                  />

                  <View className="flex flex-row gap-[8px] w-full  justify-between">
                    <View className="flex-1">
                      <CustomTextInputWithIcon
                        label="Price"
                        value={formData.basePrice}
                        onChangeText={(text) =>
                          handleInputChange("basePrice", text)
                        }
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor={"#0A0A0A80"}
                        className="w-[48%]"
                        icon={
                          <Feather
                            name="dollar-sign"
                            size={20}
                            color="#99A1AF"
                          />
                        }
                        errorMessage={errors.basePrice}
                      />
                    </View>
                    <View className="flex-1">
                      <CustomTextInputWithIcon
                        label="Duration (minutes)"
                        value={formData.durationMinutes}
                        onChangeText={(text) =>
                          handleInputChange("durationMinutes", text)
                        }
                        keyboardType="numeric"
                        placeholder="60"
                        placeholderTextColor={"#0A0A0A80"}
                        className="w-[48%]"
                        icon={
                          <MaterialIcons
                            name="access-time"
                            size={20}
                            color="#99A1AF"
                          />
                        }
                        errorMessage={errors.durationMinutes}
                      />
                    </View>
                  </View>
                </View>
                <Pressable
                  className="bg-[#F6339A] h-[48px] rounded-[10px] flex flex-row justify-center items-center"
                  onPress={() => setState(2)}
                >
                  <Text
                    className="text-[#ffffff] text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Next
                  </Text>
                </Pressable>
              </View>
            )}
            {state === 2 && (
              <View className="px-4 py-[16px] flex flex-col gap-[24px]">
                <View
                  className={`rounded-[14px] p-[24px] bg-white flex flex-col gap-[19px]`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5, // Android shadow
                  }}
                >
                  <Text
                    className="text-[#101828] text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Add Photos
                  </Text>
                  <Text
                    className="text-[#4A5565] text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Add a photo to showcase your service
                  </Text>
                  <MultiPhotoUploader
                    images={formData.image ? [formData.image] : []} // show current image
                    onChange={(urls) =>
                      setFormData((prev) => ({
                        ...prev,
                        image: urls[0] || "", // take the first uploaded image
                      }))
                    }
                    maxImages={1}
                    tipText="Tip: High-quality photos get more bookings! Make sure your photos are well-lit and showcase your work."
                    errorMessage={errors.image}
                  />
                </View>
                <View className="flex flex-row gap-[16px] w-full">
                  <Pressable
                    className=" border-[#D1D5DC] border-[1.24px] w-[48%] h-[48px] rounded-[10px] flex flex-row justify-center items-center"
                    onPress={() => setState(1)}
                  >
                    <Text
                      className="text-[#364153] text-[16px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Previous
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSubmit}
                    className="bg-[#F6339A]  w-[48%] h-[48px] rounded-[10px] flex flex-row justify-center items-center"
                  >
                    <Text
                      className="text-[#ffffff] text-[16px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Create Listing
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateListing;
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 10,
  },
  hList: {
    marginTop: 10,
    backgroundColor: "white",
    paddingVertical: 10,
    borderRadius: 4,
  },
  sectionTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 16,
  },
  sectionAction: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: "#FF6EC7",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderColor: "#FF6EC7",
    borderWidth: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
