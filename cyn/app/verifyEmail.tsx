import {
  Text,
  View,
  Image,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import CustomStatusBar from "@/components/statusbar";
import React from "react";

export default function VerifyEmailScreen() {
  const logo = require("../assets/images/logo.png");
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
                    Verify Email
                  </Text>
                  <Text
                    className=" text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    We have sent a verification email to
                  </Text>
                  <Text
                    className="text-[16px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    edwin***h@a*y.com
                  </Text>
                </View>
                <Text
                  className=" text-[16px]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  Didn’t receive the email? Check spam folder or enter email
                  address again
                </Text>
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
                <Link href={"/login"} asChild>
                  <Pressable className="bg-[#FF6EC7] h-[48px] rounded-[4px] justify-center">
                    <Text
                      className=" text-[16px] text-[#FFFFFF] text-center"
                      style={{ fontFamily: "Manrope_500Medium" }}
                    >
                      Resend Email
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
