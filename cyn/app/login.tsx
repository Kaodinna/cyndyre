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
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import CustomStatusBar from "@/components/statusbar";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/helpers/schema";
import React, { useState, useEffect, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/components/AuthContext";
import Constants from "expo-constants";
export default function LoginScreen() {
  const hostIp =
    Constants.expoConfig && Constants.expoConfig.hostUri
      ? Constants.expoConfig.hostUri.split(":")[0]
      : "";
  const baseUrl = `http://${hostIp}:5000/api/v1`;
  // const baseUrl: string = "https://cynderallabackend.onrender.com/api/v1";

  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);
  const { login } = useAuth();
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const watchedValues = watch();

  useEffect(() => {
    const fieldsFilled = Object.values(watchedValues).every(
      (value) => value !== "",
    );
    setAllFieldsFilled(fieldsFilled);
  }, [watchedValues]);
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
    if (errors.email || errors.password) {
      fadeIn();
    } else {
      fadeOut();
    }
  }, [errors.email, errors.password]);

  const handleLogin = async (formData: any) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}/auth/login`,
        // "https://cynderallabackend-production-ab60.up.railway.app/api/v1/auth/login",
        formData,
      );

      if (response.status === 201) {
        await login({
          accessToken: response.data.data.accessToken,
          role: response.data.data.user.role,
          fullName: response.data.data.user.fullName,
          email: response.data.data.user.email,
          id: response.data.data.user.id,
        });
        router.push("/(drawer)/(tabs)");
      } else {
        Alert.alert(
          "Error!",
          "An unexpected error occurred. Please try again.",
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;

      Alert.alert("Error!", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const google = require("../assets/images/Google - Original.jpg");
  const apple = require("../assets/images/Apple - Original-2.jpg");
  const logo = require("../assets/images/logo.png");
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
      style={{ backgroundColor: "#FF6EC7" }}
    >
      <StatusBar style="dark" backgroundColor="#FF6EC7" />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "white" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="px-4 flex flex-col bg-[#FF6EC7]">
          <Link href={"/"}>
            <Ionicons name="arrow-back-outline" size={24} color={"#FFFFFF"} />
          </Link>
          <View className="flex justify-center items-center">
            <Image source={logo} />
          </View>
        </View>

        <ScrollView className="" alwaysBounceVertical={false}>
          <View>
            <View className="flex flex-col gap-[8px] px-4 mt-5">
              <Text
                style={{ fontFamily: "Manrope_700Bold" }}
                className="text-[24px] text-[#050404]"
              >
                Log into your account
              </Text>

              <View className="flex flex-row items-center">
                <Text
                  className=" text-[16px]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  Already have an account?
                </Text>

                <Pressable
                  className="m-0 p-0"
                  onPress={() => router.push("/signup")}
                >
                  <Text
                    className="text-[#312ECB]  text-[16px] ml-1"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Create Account
                  </Text>
                </Pressable>
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
                          textContentType="username" // iOS
                          autoComplete="email" // Android/modern RN
                          importantForAutofill="yes" // Android
                          keyboardType="email-address"
                          onChangeText={onChange}
                          value={value}
                          placeholder="Input your first  name"
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
                      <Text className="font-600 text-[10px] leading-[10px] text-[#FF0000]">
                        {errors.email ? errors.email.message : "   "}
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
                            onChangeText={onChange}
                            value={value}
                            secureTextEntry={!isPasswordVisible}
                            placeholder="Input your first  name"
                            textContentType="password" // iOS
                            autoComplete="password" // Android/modern RN
                            importantForAutofill="yes"
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
                      <Text className="font-600 text-[10px] leading-[10px] text-[#FF0000]">
                        {errors.password ? errors.password.message : "   "}
                      </Text>
                    </Animated.View>
                  </View>

                  <View className="flex flex-row gap-[4px]">
                    <Link href={"/forgotPassword"} asChild>
                      <Pressable>
                        <Text
                          style={{ fontFamily: "Manrope_400Regular" }}
                          className=" text-[14px] text-[#050404]"
                        >
                          Forgot Password
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
                {/* <Link href={"/verifyEmail"} asChild> */}
                <Pressable
                  onPress={handleSubmit(handleLogin)}
                  // disabled={!allFieldsFilled}
                  className={`${
                    allFieldsFilled ? " bg-[#FF6EC7]" : "bg-[#B2B1B1]"
                  } h-[48px] rounded-[4px] justify-center`}
                >
                  <Text
                    className=" text-[16px] text-[#FFFFFF] text-center"
                    style={{ fontFamily: "Manrope_500Medium" }}
                  >
                    Login
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
              <View className="flex flex-col gap-[20px] mb-32">
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
        </ScrollView>
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
