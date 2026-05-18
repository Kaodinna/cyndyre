import {
  Text,
  View,
  Image,
  Pressable,
  Platform,
  UIManager,
  Animated,
  LayoutAnimation,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import CustomStatusBar from "@/components/statusbar";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { clientRegisterSchema } from "@/helpers/schema";
import React, { useState, useEffect, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import axios from "axios";
import { router } from "expo-router";
import {
  CategorySelector,
  CustomDropdown,
  CustomTextArea,
  CustomTextInput,
  CustomTextInputWithIcon,
  MultiPhotoUploader,
  ProgressBar,
  ToggleButton,
} from "@/components/reusables";
import * as Location from "expo-location";
import {
  getServiceCategories,
  signUpServiceProvider,
  signUpRider,
} from "@/services/api/request";
import { Category } from "@/types/type";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRepeatPasswordVisible, setIsRepeatPasswordVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("customer");
  const [error, setErrors] = useState<FormErrors>({});
  const [isEnabled, setIsEnabled] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [state, setState] = useState(1);
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  type RiderFormData = {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    vehicleType: string;
    vehiclePlate: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  const [riderFormData, setRiderFormData] = useState<RiderFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    vehicleType: "",
    vehiclePlate: "",
    address: "",
    city: "",
    state: "",
    latitude: 0,
    longitude: 0,
  });
  const [riderStep, setRiderStep] = useState(1);
  type RiderFormErrors = Partial<Record<keyof RiderFormData, string>>;
  const [riderErrors, setRiderErrors] = useState<RiderFormErrors>({});
  const [riderApiError, setRiderApiError] = useState<string | null>(null);
  type FormErrors = Partial<Record<keyof FormData, string>>;
  type FormData = {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    businessName: string;
    businessDescription: string;

    businessEmail: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
    offersHomeService: boolean;
    categories: string[];
    images: string[];
  };
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    businessName: "",
    businessDescription: "",

    businessEmail: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nigeria",
    latitude: 0,
    longitude: 0,
    offersHomeService: false,
    categories: [],
    images: [],
  });

  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(clientRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      gender: "",

      repeatPassword: "",
      agreeToTerms: false,
    },
  });
  const watchedValues = watch();
  const formScrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (formScrollRef.current) {
      formScrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [state]);
  useEffect(() => {
    const fieldsFilled = Object.values(watchedValues).every(
      (value) => value !== "" && value !== false,
    );
    setAllFieldsFilled(fieldsFilled);
  }, [watchedValues, isChecked]);
  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300, // Adjust the duration as needed
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300, // Adjust the duration as needed
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (
      errors.fullName ||
      errors.email ||
      errors.gender ||
      errors.password ||
      errors.repeatPassword ||
      errors.agreeToTerms
    ) {
      fadeIn();
    } else {
      fadeOut();
    }
  }, [
    errors.fullName,
    errors.email,
    errors.gender,

    errors.password,
    errors.repeatPassword,
    errors.agreeToTerms,
  ]);

  const google = require("../assets/images/Google - Original.jpg");
  const apple = require("../assets/images/Apple - Original-2.jpg");
  const logo = require("../assets/images/logo.png");
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setErrors((prev) => ({
        ...prev,
        location: "Location permission denied",
      }));
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    setFormData((prev) => ({
      ...prev,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }));
  };
  useEffect(() => {
    getLocation();
  }, []);

  const handleSignUp = async (formData: any) => {
    const { repeatPassword, agreeToTerms, ...data } = formData;
    const rest = {
      ...data,
      role: "customer",
      userType: "user",
    };
    try {
      setLoading(true);
      const response = await axios.post(
        // "https://users-piolifeng-be-staging.onrender.com/api/v1/auth/register",
        "https://cynderallabackend-production-ab60.up.railway.app/api/v1/auth/register",
        rest,
      );

      if (response.status === 201) {
        Alert.alert("Success!", "Signup successful.  You can now login.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        Alert.alert(
          "Error!",
          "An unexpected error occurred. Please try again.",
        );
        console.log("response", response);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      Alert.alert("Error!", errorMessage);
      console.log("errorMessage", error);
    } finally {
      setLoading(false);
    }
  };
  const removeEmptyFields = <T extends Record<string, any>>(
    obj: T,
  ): Partial<T> => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => {
        if (value === "" || value === null || value === undefined) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      }),
    ) as Partial<T>;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRiderInputChange = (field: string, value: any) => {
    setRiderFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateRiderStep = (step: number): boolean => {
    let valid = true;
    const newErrors: RiderFormErrors = { ...riderErrors };

    if (step === 1) {
      if (!riderFormData.fullName.trim()) {
        newErrors.fullName = "Full Name is required";
        valid = false;
      } else newErrors.fullName = "";

      if (!riderFormData.email.trim()) {
        newErrors.email = "Email is required";
        valid = false;
      } else newErrors.email = "";

      if (!riderFormData.password.trim()) {
        newErrors.password = "Password is required";
        valid = false;
      } else newErrors.password = "";

      if (!riderFormData.confirmPassword.trim()) {
        newErrors.confirmPassword = "Confirm Password is required";
        valid = false;
      } else if (riderFormData.confirmPassword !== riderFormData.password) {
        newErrors.confirmPassword = "Passwords do not match";
        valid = false;
      } else newErrors.confirmPassword = "";

      if (!riderFormData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
        valid = false;
      } else newErrors.phoneNumber = "";
    }

    if (step === 2) {
      if (!riderFormData.vehicleType.trim()) {
        newErrors.vehicleType = "Vehicle type is required";
        valid = false;
      } else newErrors.vehicleType = "";

      if (!riderFormData.vehiclePlate.trim()) {
        newErrors.vehiclePlate = "Vehicle plate is required";
        valid = false;
      } else newErrors.vehiclePlate = "";

      if (!riderFormData.address.trim()) {
        newErrors.address = "Address is required";
        valid = false;
      } else newErrors.address = "";

      if (!riderFormData.city.trim()) {
        newErrors.city = "City is required";
        valid = false;
      } else newErrors.city = "";

      if (!riderFormData.state.trim()) {
        newErrors.state = "State is required";
        valid = false;
      } else newErrors.state = "";
    }

    setRiderErrors(newErrors);
    return valid;
  };

  const handleRiderSignup = async () => {
    if (!validateRiderStep(riderStep)) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = riderFormData;
      const response = await signUpRider(payload);
      if (response.success) {
        router.push("/login");
      } else {
        setRiderApiError(response.message || "Failed to sign up. Please try again.");
      }
    } catch (err: any) {
      setRiderApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        setLoading(true);
        const [servCatRes] = await Promise.all([getServiceCategories()]);

        setServiceCategories(servCatRes);
      } catch (err: any) {
        // setError(err?.message);
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
  const nigeriaStates = [
    { label: "Abia", value: "Abia" },
    { label: "Adamawa", value: "Adamawa" },
    { label: "Akwa Ibom", value: "Akwa Ibom" },
    { label: "Anambra", value: "Anambra" },
    { label: "Bauchi", value: "Bauchi" },
    { label: "Bayelsa", value: "Bayelsa" },
    { label: "Benue", value: "Benue" },
    { label: "Borno", value: "Borno" },
    { label: "Cross River", value: "Cross River" },
    { label: "Delta", value: "Delta" },
    { label: "Ebonyi", value: "Ebonyi" },
    { label: "Edo", value: "Edo" },
    { label: "Ekiti", value: "Ekiti" },
    { label: "Enugu", value: "Enugu" },
    { label: "Gombe", value: "Gombe" },
    { label: "Imo", value: "Imo" },
    { label: "Jigawa", value: "Jigawa" },
    { label: "Kaduna", value: "Kaduna" },
    { label: "Kano", value: "Kano" },
    { label: "Katsina", value: "Katsina" },
    { label: "Kebbi", value: "Kebbi" },
    { label: "Kogi", value: "Kogi" },
    { label: "Kwara", value: "Kwara" },
    { label: "Lagos", value: "Lagos" },
    { label: "Nasarawa", value: "Nasarawa" },
    { label: "Niger", value: "Niger" },
    { label: "Ogun", value: "Ogun" },
    { label: "Ondo", value: "Ondo" },
    { label: "Osun", value: "Osun" },
    { label: "Oyo", value: "Oyo" },
    { label: "Plateau", value: "Plateau" },
    { label: "Rivers", value: "Rivers" },
    { label: "Sokoto", value: "Sokoto" },
    { label: "Taraba", value: "Taraba" },
    { label: "Yobe", value: "Yobe" },
    { label: "Zamfara", value: "Zamfara" },
    { label: "Federal Capital Territory", value: "FCT" },
  ];
  const validateStep = (currentStep: number): boolean => {
    let valid = true;
    const newError: typeof error = { ...error }; // copy current error state

    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) {
          newError.fullName = "Full Name is required";
          valid = false;
        } else newError.fullName = "";

        if (!formData.email.trim()) {
          newError.email = "Email is required";
          valid = false;
        } else newError.email = "";

        if (!formData.password.trim()) {
          newError.password = "Password is required";
          valid = false;
        } else newError.password = "";

        if (!formData.confirmPassword.trim()) {
          newError.confirmPassword = "Confirm Password is required";
          valid = false;
        } else if (formData.confirmPassword !== formData.password) {
          newError.confirmPassword = "Passwords do not match";
          valid = false;
        } else newError.confirmPassword = "";

        if (!formData.phoneNumber.trim()) {
          newError.phoneNumber = "Phone number is required";
          valid = false;
        } else newError.phoneNumber = "";
        break;

      case 2:
        if (!formData.businessName.trim()) {
          newError.businessName = "Business Name is required";
          valid = false;
        } else newError.businessName = "";

        if (!formData.businessDescription.trim()) {
          newError.businessDescription = "Description is required";
          valid = false;
        } else newError.businessDescription = "";

        if (formData.categories.length === 0) {
          newError.categories = "Select at least one category";
          valid = false;
        } else newError.categories = "";
        break;

      case 3:
        if (!formData.address.trim()) {
          newError.address = "Address is required";
          valid = false;
        } else newError.address = "";

        if (!formData.city.trim()) {
          newError.city = "City is required";
          valid = false;
        } else newError.city = "";

        if (!formData.state.trim()) {
          newError.state = "State is required";
          valid = false;
        } else newError.state = "";

        break;

      case 4:
        if (formData.images.length === 0) {
          newError.images = "Upload at least one image";
          valid = false;
        } else newError.images = "";
        break;

      default:
        break;
    }

    setErrors(newError); // update error state
    return valid;
  };
  const handleSignup = async () => {
    const isValid = validateStep(state);

    if (!isValid) {
      return; // ❌ stop submission
    }
    setLoading(true);

    try {
      // 3️⃣ Call your API
      const { confirmPassword, ...payload } = formData;
      const cleanedData = removeEmptyFields(payload);
      console.log("cleanedData", cleanedData);

      const response = await signUpServiceProvider(cleanedData);

      // 4️⃣ Check for API-level success
      if (response.success) {
        // ✅ Navigate to another page (e.g., service listings)
        router.push("/login");
      } else {
        // ❌ API returned an error
        setApiError(
          response.message || "Failed to add service. Please try again.",
        );
      }
    } catch (error: any) {
      // 5️⃣ Network / unexpected errors
      console.error("Error submitting form:", error);
      setApiError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: "#ffffff" }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "white" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <>
          <View className="px-4 flex flex-col ">
            <Link href={"/"}>
              <Ionicons color={"#000000"} name="arrow-back-outline" size={24} />
            </Link>

            {/* <View className="flex justify-center items-center">
              <Image source={logo} />
            </View> */}
          </View>
          <View className="flex flex-row items-center gap-[8px] px-4 mt-4 pb-4">
            <Pressable
              onPress={() => setRole("customer")}
              className={`${role === "customer" ? "border-[#F6339A] bg-[#FDF2F8]" : "border-[#E5E7EB]"} h-[50px] border-[1.24px] flex-1 rounded-[10px] flex justify-center items-center`}
            >
              <Text
                style={{ fontFamily: "Manrope_400Regular" }}
                className={`text-[13px] ${role === "customer" ? "text-[#C6005C]" : "text-[#4A5565]"}`}
              >
                Customer
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setRole("businessOwner")}
              className={`${role === "businessOwner" ? "border-[#F6339A] bg-[#FDF2F8]" : "border-[#E5E7EB]"} h-[50px] border-[1px] flex-1 rounded-[10px] flex justify-center items-center`}
            >
              <Text
                className={`text-[13px] ${role === "businessOwner" ? "text-[#C6005C]" : "text-[#4A5565]"}`}
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Provider
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setRole("rider")}
              className={`${role === "rider" ? "border-[#F6339A] bg-[#FDF2F8]" : "border-[#E5E7EB]"} h-[50px] border-[1px] flex-1 rounded-[10px] flex justify-center items-center`}
            >
              <Text
                className={`text-[13px] ${role === "rider" ? "text-[#C6005C]" : "text-[#4A5565]"}`}
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Rider
              </Text>
            </Pressable>
          </View>
          {role === "businessOwner" && (
            <View className={`px-4 ${state > 1 ? "pb-4" : "pb-0"}`}>
              <ProgressBar step={state} total={4} />
            </View>
          )}
          {role === "rider" && (
            <View className="px-4 pb-4">
              <ProgressBar step={riderStep} total={2} />
            </View>
          )}
          {role === "customer" ||
            (role === "businessOwner" && state === 1 && (
              <View className="flex flex-col gap-[8px] px-4 mt-5 pb-4">
                <Text
                  style={{ fontFamily: "Manrope_700Bold" }}
                  className=" text-[24px] text-[#050404]"
                >
                  Create account
                </Text>
                <View className="flex flex-row items-center">
                  <Text
                    className="text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Already have an account?
                  </Text>
                  <Link href={"/login"} asChild>
                    <Pressable className="m-0 p-0">
                      <Text
                        className="text-[#312ECB] text-[16px] ml-1"
                        style={{ fontFamily: "Manrope_400Regular" }}
                      >
                        Login
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            ))}
          <ScrollView
            ref={formScrollRef}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {role === "customer" && (
              <View className="mb-36">
                <View className="flex flex-col gap-[8px] px-4 mt-5">
                  <Text
                    style={{ fontFamily: "Manrope_700Bold" }}
                    className=" text-[24px] text-[#050404]"
                  >
                    Create account
                  </Text>
                  <View className="flex flex-row items-center">
                    <Text
                      className="text-[16px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Already have an account?
                    </Text>
                    <Link href={"/login"} asChild>
                      <Pressable className="m-0 p-0">
                        <Text
                          className="text-[#312ECB] text-[16px] ml-1"
                          style={{ fontFamily: "Manrope_400Regular" }}
                        >
                          Login
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
                <View className="flex flex-col px-4 mt-10">
                  <View className="flex flex-col mb-[40px]">
                    <View className="flex flex-col mb-[40px]">
                      <View className="flex flex-col mb-[16px]">
                        <Text
                          style={{
                            fontFamily: "Manrope_400Regular",
                          }}
                          className="text-[16px] mb-[12px]"
                        >
                          Full Name
                        </Text>
                        <Controller
                          control={control}
                          rules={{
                            required: true,
                          }}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              placeholderTextColor={"#B2B1B1"}
                              onChangeText={onChange}
                              value={value}
                              placeholder="Input your first  name"
                              className={`rounded-[4px] border-[1px] px-[16px] py-[13px] ${
                                !value ? "border-[#B2B1B1]" : "border-[#050404]"
                              }`}
                            />
                          )}
                          name="fullName"
                        />
                        <Animated.View
                          style={{
                            opacity: fadeAnim,
                          }}
                        >
                          <Text
                            className="font-600 text-[10px] leading-[10px] text-[#FF0000] mt-2"
                            style={{
                              fontFamily: "Manrope_400Regular",
                            }}
                          >
                            {errors.fullName ? errors.fullName.message : "   "}
                          </Text>
                        </Animated.View>
                      </View>

                      <View className="flex flex-col mb-[16px]">
                        <Text
                          style={{
                            fontFamily: "Manrope_400Regular",
                          }}
                          className=" text-[16px] mb-[12px]"
                        >
                          Email Address
                        </Text>
                        <Controller
                          control={control}
                          rules={{
                            required: true,
                          }}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              placeholderTextColor={"#B2B1B1"}
                              keyboardType="email-address"
                              onChangeText={onChange}
                              value={value}
                              placeholder="Input your email address"
                              className={`rounded-[4px] border-[1px] px-[16px] py-[13px] ${
                                !value ? "border-[#B2B1B1]" : "border-[#050404]"
                              }`}
                            />
                          )}
                          name="email"
                        />
                        <Animated.View
                          style={{
                            opacity: fadeAnim,
                          }}
                        >
                          <Text
                            className="font-600 text-[10px] leading-[10px] text-[#FF0000] mt-2"
                            style={{
                              fontFamily: "Manrope_400Regular",
                            }}
                          >
                            {errors.email ? errors.email.message : "   "}
                          </Text>
                        </Animated.View>
                      </View>
                      <View className="flex flex-col mb-[16px]">
                        <Text
                          style={{ fontFamily: "Manrope_400Regular" }}
                          className="text-[16px] mb-[12px]"
                        >
                          Gender
                        </Text>

                        <Controller
                          control={control}
                          rules={{
                            required: true,
                          }}
                          name="gender"
                          render={({ field: { value, onChange } }) => (
                            <View className="flex flex-row gap-[12px]">
                              {["male", "female"].map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => onChange(option)}
                                  className={`flex-1 py-[12px] rounded-[4px]  items-center ${
                                    value === option
                                      ? " bg-[#FF6EC7] "
                                      : "border-[#B2B1B1] border-[1px]"
                                  }`}
                                >
                                  <Text
                                    className={`text-[14px] capitalize ${
                                      value === option
                                        ? "text-white "
                                        : "text-[#050404]  "
                                    }`}
                                    style={{ fontFamily: "Manrope_500Medium" }}
                                  >
                                    {option}
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                          )}
                        />

                        <Animated.View style={{ opacity: fadeAnim }}>
                          <Text
                            className="text-[10px] text-[#FF0000] mt-2"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          >
                            {errors.gender ? errors.gender.message : "   "}
                          </Text>
                        </Animated.View>
                      </View>

                      <View className="flex flex-col mb-[16px]">
                        <Text
                          style={{
                            fontFamily: "Manrope_400Regular",
                          }}
                          className=" text-[16px] mb-[12px]"
                        >
                          Password
                        </Text>
                        <Controller
                          control={control}
                          rules={{
                            required: true,
                          }}
                          render={({ field: { onChange, value } }) => (
                            <View
                              className={`rounded-[4px] border-[1px] px-[16px] py-[13px] flex flex-row items-center ${
                                !value ? "border-[#B2B1B1]" : "border-[#050404]"
                              }`}
                            >
                              <TextInput
                                style={{
                                  flex: 1,
                                }}
                                placeholderTextColor={"#B2B1B1"}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry={!isPasswordVisible}
                                placeholder="Input your password"
                              />
                              <Pressable
                                onPress={() =>
                                  setIsPasswordVisible(!isPasswordVisible)
                                }
                              >
                                <MaterialCommunityIcons
                                  name={isPasswordVisible ? "eye" : "eye-off"}
                                  size={20}
                                  color="#ADBED8"
                                />
                              </Pressable>
                            </View>
                          )}
                          name="password"
                        />
                        <Animated.View
                          style={{
                            opacity: fadeAnim,
                          }}
                        >
                          <Text
                            className="font-600 text-[10px] leading-[10px] text-[#FF0000] mt-2"
                            style={{
                              fontFamily: "Manrope_400Regular",
                            }}
                          >
                            {errors.password ? errors.password.message : "   "}
                          </Text>
                        </Animated.View>
                      </View>
                      <View className="flex flex-col mb-[16px]">
                        <Text
                          style={{
                            fontFamily: "Manrope_400Regular",
                          }}
                          className=" text-[16px] mb-[12px]"
                        >
                          Confirm Password
                        </Text>
                        <Controller
                          control={control}
                          rules={{
                            required: true,
                          }}
                          render={({ field: { onChange, value } }) => (
                            <View
                              className={`rounded-[4px] border-[1px] px-[16px] py-[13px] flex flex-row items-center ${
                                !value ? "border-[#B2B1B1]" : "border-[#050404]"
                              }`}
                            >
                              <TextInput
                                style={{
                                  flex: 1,
                                }}
                                placeholderTextColor={"#B2B1B1"}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry={!isRepeatPasswordVisible}
                                placeholder="Input your password for confirmation"
                              />
                              <Pressable
                                onPress={() =>
                                  setIsRepeatPasswordVisible(
                                    !isRepeatPasswordVisible,
                                  )
                                }
                              >
                                <MaterialCommunityIcons
                                  name={isPasswordVisible ? "eye" : "eye-off"}
                                  size={20}
                                  color="#ADBED8"
                                />
                              </Pressable>
                            </View>
                          )}
                          name="repeatPassword"
                        />
                        <Animated.View
                          style={{
                            opacity: fadeAnim,
                          }}
                        >
                          <Text
                            className="font-600 text-[10px] leading-[10px] text-[#FF0000] mt-2"
                            style={{
                              fontFamily: "Manrope_400Regular",
                            }}
                          >
                            {errors.repeatPassword
                              ? errors.repeatPassword.message
                              : "   "}
                          </Text>
                        </Animated.View>
                      </View>
                      <View className="flex flex-col gap-[4px]">
                        <Controller
                          control={control}
                          name="agreeToTerms"
                          render={({ field: { onChange, value } }) => (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Checkbox
                                value={value}
                                onValueChange={onChange}
                                color={value ? "#0E16FF" : undefined}
                              />
                              <Text
                                style={{ fontFamily: "Manrope_400Regular" }}
                                className=" text-[14px]"
                              >
                                I agree to Cynderalla
                                <Text
                                  className="text-[#312ECB]"
                                  style={{ fontFamily: "Manrope_400Regular" }}
                                >
                                  Terms of service
                                </Text>
                                and
                                <Text
                                  className="text-[#312ECB]"
                                  style={{ fontFamily: "Manrope_400Regular" }}
                                >
                                  Privacy policy
                                </Text>
                              </Text>
                            </View>
                          )}
                        />
                        <Animated.View
                          style={{
                            opacity: fadeAnim,
                          }}
                        >
                          <Text
                            className={`font-600 text-[10px] leading-[10px] text-[#FF0000] mt-2`}
                            style={{
                              fontFamily: "Manrope_400Regular",
                            }}
                          >
                            {errors.agreeToTerms
                              ? errors.agreeToTerms.message
                              : "   "}
                          </Text>
                        </Animated.View>
                      </View>
                    </View>
                    {/* <Link href={"/verifyEmail"} asChild> */}
                    <Pressable
                      // disabled={!allFieldsFilled}
                      onPress={handleSubmit(handleSignUp)}
                      className={` h-[48px] rounded-[4px] justify-center ${
                        allFieldsFilled ? " bg-[#FF6EC7]" : "bg-[#B2B1B1]"
                      }`}
                    >
                      <Text
                        className=" text-[16px] text-[#FFFFFF] text-center"
                        style={{ fontFamily: "Manrope_500Medium" }}
                      >
                        {loading ? "Loading..." : "Create Account"}
                      </Text>
                    </Pressable>
                    {/* </Link> */}
                  </View>
                  <View className="flex flex-row items-center justify-between mb-[30px]">
                    <View className="w-[45%] border-[#373636] border-t-[1px]"></View>
                    <Text
                      style={{ fontFamily: "Manrope_400Regular" }}
                      className="text-[16px]"
                    >
                      Or
                    </Text>
                    <View className="w-[45%] border-[#373636] border-t-[1px]"></View>
                  </View>
                  <View className="flex flex-col gap-[20px] mb-10">
                    <Pressable className="rounded-[4px] flex flex-row justify-center border-[#050404] border-[1px] py-[15px] px-[20px]">
                      <View className="flex flex-row items-center gap-3">
                        <Image source={google} className="h-[19px] w-[19px]" />
                        <Text
                          style={{ fontFamily: "Manrope_500Medium" }}
                          className="text-[16px]"
                        >
                          Continue with Google
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable className="rounded-[4px] flex flex-row justify-center border-[#050404] border-[1px] py-[15px] px-[20px]">
                      <View className="flex flex-row items-center gap-3">
                        <Image source={apple} className="h-[19px] w-[19px]" />
                        <Text
                          style={{ fontFamily: "Manrope_500Medium" }}
                          className="text-[16px]"
                        >
                          Continue with Apple
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
            {role === "businessOwner" && (
              <View className="flex-1">
                <View className=" px-4  flex-1">
                  {state === 1 && (
                    <View className=" py-[16px] flex flex-col gap-[24px] ">
                      <View
                        className={`rounded-[14px] p-[24px] bg-white flex flex-col gap-[16px]`}
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
                          Personal Information
                        </Text>
                        <CustomTextInput
                          label="Fullname"
                          value={formData.fullName}
                          onChangeText={(text) =>
                            handleInputChange("fullName", text)
                          }
                          placeholder="Enter Fullname"
                          placeholderTextColor={"#0A0A0A80"}
                          errorMessage={error.fullName}
                        />
                        <CustomTextInput
                          label="Email"
                          value={formData.email}
                          onChangeText={(text) =>
                            handleInputChange("email", text)
                          }
                          placeholder="Enter email"
                          placeholderTextColor={"#0A0A0A80"}
                          errorMessage={error.email}
                        />
                        <CustomTextInput
                          secureTextEntry
                          label="Password"
                          value={formData.password}
                          onChangeText={(text) =>
                            handleInputChange("password", text)
                          }
                          placeholder="Enter password"
                          placeholderTextColor={"#0A0A0A80"}
                          errorMessage={error.password}
                        />
                        <CustomTextInput
                          secureTextEntry
                          label="Confirm Password"
                          value={formData.confirmPassword}
                          onChangeText={(text) =>
                            handleInputChange("confirmPassword", text)
                          }
                          placeholder="Enter confirm password"
                          placeholderTextColor={"#0A0A0A80"}
                          errorMessage={error.confirmPassword}
                        />
                        <CustomTextInput
                          label="Personal/Business Phone number"
                          value={formData.phoneNumber}
                          onChangeText={(text) =>
                            handleInputChange("phoneNumber", text)
                          }
                          placeholder="081*******, 070******"
                          placeholderTextColor={"#0A0A0A80"}
                          errorMessage={error.phoneNumber}
                        />
                      </View>
                      <Pressable
                        className="bg-[#F6339A] h-[48px] rounded-[10px] flex flex-row justify-center items-center"
                        onPress={() => {
                          if (validateStep(state)) {
                            setState(state + 1); // move to next step only if validation passes
                            // optional: scroll to top on step change
                          }
                        }}
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
                    <View className=" py-[16px] flex flex-col gap-[24px]">
                      <View
                        className={`rounded-[14px] p-[24px] bg-white flex flex-col gap-[16px]`}
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
                          Business Information
                        </Text>
                        <CustomTextInput
                          label="Business Name"
                          value={formData.businessName}
                          onChangeText={(text) =>
                            handleInputChange("businessName", text)
                          }
                          placeholder="Enter Business Name"
                          placeholderTextColor={"#0A0A0A80"}
                          errorMessage={error.businessName}
                        />
                        <CustomTextArea
                          label="Description"
                          placeholder="Describe your service in detail..."
                          value={formData.businessDescription}
                          onChangeText={(text) =>
                            handleInputChange("businessDescription", text)
                          }
                          numberOfLines={4}
                          errorMessage={error.businessDescription}
                        />

                        <CustomTextInput
                          label="Business Email"
                          value={formData.businessEmail}
                          onChangeText={(text) =>
                            handleInputChange("businessEmail", text)
                          }
                          placeholder="Enter Business Email"
                          placeholderTextColor={"#0A0A0A80"}
                          errorMessage={error.businessEmail}
                        />
                        <CategorySelector
                          label="Service Categories"
                          options={categoryOptions}
                          value={formData.categories} // string[]
                          onChange={(selected: string[]) =>
                            setFormData((prev) => ({
                              ...prev,
                              categories: selected,
                            }))
                          }
                          errorMessage={error.categories}
                        />

                        <View className="flex flex-col gap-[8px]">
                          <Text
                            className=" text-[14px] text-[#373636]"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          >
                            Do You Offer Home Service?
                          </Text>
                          <ToggleButton
                            value={formData.offersHomeService}
                            onToggle={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                offersHomeService: value,
                              }))
                            }
                            trueLabel="Yes"
                            falseLabel="No"
                            size="medium"
                            errorMessage={error.offersHomeService}
                          />
                        </View>
                      </View>
                      <View className="flex flex-row items-center gap-[16px] w-full">
                        <Pressable
                          className="border-[#F6339A] border-[1px] h-[48px] rounded-[10px] flex flex-row justify-center items-center flex-1 w-[48%]"
                          onPress={() => setState(state - 1)}
                        >
                          <Text
                            className="text-[#F6339A] text-[16px]"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          >
                            Previous
                          </Text>
                        </Pressable>
                        <Pressable
                          className="bg-[#F6339A] h-[48px] rounded-[10px] flex flex-row justify-center items-center flex-1 w-[48%]"
                          onPress={() => {
                            if (validateStep(state)) {
                              setState(state + 1);
                            }
                          }}
                        >
                          <Text
                            className="text-[#ffffff] text-[16px]"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          >
                            Next
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                  {state === 3 && (
                    <View className=" py-[16px] flex flex-col gap-[24px]">
                      <View
                        className={`rounded-[14px] p-[24px] bg-white flex flex-col gap-[16px]`}
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
                          Location Details
                        </Text>
                        <CustomTextInput
                          label="Address"
                          value={formData.address}
                          onChangeText={(text) =>
                            handleInputChange("address", text)
                          }
                          placeholder="Enter Business Name"
                          placeholderTextColor={"#0A0A0A80"}
                          errorMessage={error.address}
                        />
                        <CustomTextInput
                          label="City"
                          value={formData.city}
                          onChangeText={(text) =>
                            handleInputChange("city", text)
                          }
                          placeholder="Enter City"
                          placeholderTextColor={"#0A0A0A80"}
                          errorMessage={error.city}
                        />
                        <CustomDropdown
                          label="State"
                          placeholder="Select State"
                          value={formData.state}
                          onSelect={(text) => handleInputChange("state", text)}
                          options={nigeriaStates}
                          errorMessage={error.state}
                        />
                        <CustomTextInput
                          label="Zip Code"
                          value={formData.zipCode}
                          onChangeText={(text) =>
                            handleInputChange("zipCode", text)
                          }
                          placeholder="Enter Zip Code"
                          placeholderTextColor={"#0A0A0A80"}
                          errorMessage={error.zipCode}
                        />
                      </View>
                      <View className="flex flex-row items-center gap-[16px] w-full">
                        <Pressable
                          className="border-[#F6339A] border-[1px] h-[48px] rounded-[10px] flex flex-row justify-center items-center flex-1 w-[48%]"
                          onPress={() => setState(state - 1)}
                        >
                          <Text
                            className="text-[#F6339A] text-[16px]"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          >
                            Previous
                          </Text>
                        </Pressable>
                        <Pressable
                          className="bg-[#F6339A] h-[48px] rounded-[10px] flex flex-row justify-center items-center flex-1 w-[48%]"
                          onPress={() => {
                            if (validateStep(state)) {
                              setState(state + 1);
                            }
                          }}
                        >
                          <Text
                            className="text-[#ffffff] text-[16px]"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          >
                            Next
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                  {state === 4 && (
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
                          images={formData.images ? formData.images : []} // show current image
                          onChange={(urls) =>
                            setFormData((prev) => ({
                              ...prev,
                              images: urls, // ensure images is always a string array
                            }))
                          }
                          maxImages={5}
                          tipText="Tip: High-quality photos get more bookings! Make sure your photos are well-lit and showcase your work."
                          errorMessage={error.images}
                        />
                      </View>
                      <View className="flex flex-row gap-[16px] w-full">
                        <Pressable
                          className="border-[#F6339A] border-[1px] h-[48px] rounded-[10px] flex flex-row justify-center items-center flex-1 w-[48%]"
                          onPress={() => setState(state - 1)}
                        >
                          <Text
                            className="text-[#F6339A] text-[16px]"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          >
                            Previous
                          </Text>
                        </Pressable>
                        <Pressable
                          className="bg-[#F6339A]  w-[48%] h-[48px] rounded-[10px] flex flex-row justify-center items-center"
                          onPress={() => {
                            if (validateStep(state)) {
                              handleSignup();
                            }
                          }}
                        >
                          <Text
                            className="text-[#ffffff] text-[16px]"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          >
                            Create Account
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
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
