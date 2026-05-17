import {
  Text,
  View,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ImageBackground,
  Pressable,
  Platform,
  UIManager,
  Animated,
  LayoutAnimation,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import CustomStatusBar from "@/components/statusbar";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { clientRegisterSchema } from "@/helpers/schema";
import React, { useState, useEffect, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRepeatPasswordVisible, setIsRepeatPasswordVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [focusStates, setFocusStates] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    repeatPassword: false,
    referralCode: false,
  });
  const handleCheckboxChange = (value: any) => {
    setChecked(value);
    // setValue("", value);
  };
  const {
    setValue,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(clientRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      repeatPassword: "",
    },
  });
  const handleFocus = (inputName: string) => {
    setFocusStates((prevState) => ({
      ...prevState,
      [inputName]: true,
    }));
  };

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
      errors.firstName ||
      errors.lastName ||
      errors.email ||
      errors.password ||
      errors.repeatPassword
    ) {
      fadeIn();
    } else {
      fadeOut();
    }
  }, [
    errors.firstName,
    errors.email,
    errors.lastName,
    errors.password,
    errors.repeatPassword,
  ]);

  const handleBlur = (inputName: string) => {
    setFocusStates((prevState) => ({
      ...prevState,
      [inputName]: false,
    }));
  };
  // const styles = StyleSheet.create({});
  // const fashionShop = require("../assets/images/unsplash_fouVDmGXoPI.png");
  // const google = require("../assets/images/Google - Original.jpg");
  // const apple = require("../assets/images/Apple - Original-2.jpg");
  const logo = require("@/assets/images/logo.png");
  return (
    <CustomStatusBar>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "white" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="" alwaysBounceVertical={false}>
          <View className="">
            <View className="px-4 flex flex-col bg-[#FF6EC7]">
              <Link href={"/"}>
                <Ionicons
                  name="arrow-back-outline"
                  size={24}
                  color={"#FFFFFF"}
                />
              </Link>
              <View className="flex justify-center items-center">
                <Image source={logo} />
              </View>
            </View>

            <View className="flex flex-col  px-4 mt-5">
              <View className="flex flex-col mb-[48px]">
                <View className="flex flex-col mb-[24px]">
                  <Text
                    style={{ fontFamily: "Manrope_700Bold" }}
                    className=" text-[24px] text-[#050404] mb-[8px]"
                  >
                    Forgot Password
                  </Text>
                  <Text
                    className=" text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Enter the email you used to create your account so we can
                    send you instructions on how to reset your password.
                  </Text>
                </View>
              </View>
              <View>
                <View className="mb-[40px]">
                  <Text
                    className=" text-[16px] mb-[12px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Email Address
                  </Text>
                  <View className="h-[48px] rounded-[4px] py-[13px] px-[16px] border-[#050404] border-[1px]">
                    <Text
                      style={{ fontFamily: "Manrope_400Regular" }}
                      className=" text-[16px] "
                    >
                      edwinamah@azy.com
                    </Text>
                  </View>
                </View>
                <Link href={"/"} asChild>
                  <Pressable className="bg-[#FF6EC7] h-[48px] rounded-[4px] justify-center">
                    <Text
                      className=" text-[16px] text-[#FFFFFF] text-center"
                      style={{ fontFamily: "Manrope_500Medium" }}
                    >
                      Send Email
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </CustomStatusBar>
  );
}
