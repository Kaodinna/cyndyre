import {
  Text,
  Pressable,
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function onboardingThreeScreen() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8F8FF",
      paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    text: {
      fontSize: 25,
      fontWeight: "500",
    },
  });
  const fashionShop = require("../assets/images/shop online products raw.png");
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View className="p-4 flex justify-between flex-col flex-1">
        <View className="flex justify-between flex-row items-center">
          <Link href={"/onboardingTwo"} asChild>
            <Pressable>
              <Ionicons name="arrow-back-outline" size={24} />
            </Pressable>
          </Link>
          <Link asChild href={"/getStarted"}>
            <Pressable>
              <Text
                className="text-[#FF6EC7] text-[18px]"
                style={{ fontFamily: "Manrope_600SemiBold" }}
              >
                Skip
              </Text>
            </Pressable>
          </Link>
        </View>
        <View className="flex gap-[40px] items-center">
          <Image
            source={fashionShop}
            className="min-w-[350px] min-h-[311.23px]"
          />
          <View className="flex flex-col gap-[16px] items-center">
            <Text
              className=" text-[24px] text-[#050404]"
              style={{ fontFamily: "Manrope_700Bold" }}
            >
              We Deliver
            </Text>
            <Text
              className="text-center text-[14px] text-[#585757]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Once your order has been completed and payment has been fully
              made, we take charge and deliver at your doorstep
            </Text>
          </View>
        </View>
        <View className="">
          <View className="flex flex-row justify-end">
            <View className="w-[45%]"></View>
            <View className="w-[55%] flex flex-row justify-between items-center">
              <View className="flex flex-row gap-[4px]">
                <View className="w-[8px] h-[8px] bg-[#1F141440] rounded-full"></View>

                <View className="w-[8px] h-[8px] bg-[#1F141440] rounded-full"></View>
                <View className="w-[24px] h-[8px] bg-[#FF6EC7] rounded-[4px] "></View>
              </View>
              <Link
                className="font-600 text-[18px] text-[#050404]"
                href={"/getStarted"}
                asChild
              >
                <Pressable>
                  <Text
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                    className="text-[18px]"
                  >
                    Get Started
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
