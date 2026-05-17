import {
  Text,
  View,
  StatusBar,
  StyleSheet,
  Image,
  Pressable,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Index() {
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
  const fashionShop = require("../assets/images/fashion shop-rafiki 1.png");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View className="p-4 flex justify-between flex-col flex-1">
        <View className="flex justify-end flex-row items-center ">
          <Link asChild href={"/getStarted"}>
            <Pressable>
              <Text
                className="text-[#FF6EC7] text-[18px] "
                style={{ fontFamily: "Manrope_600SemiBold" }}
              >
                Skip
              </Text>
            </Pressable>
          </Link>
        </View>
        <View className="flex gap-[40px] items-center">
          <Image source={fashionShop} className="min-w-[300px] min-h-[300px]" />
          <View className="flex flex-col gap-[16px] items-center">
            <Text
              className=" text-[24px] text-[#050404]"
              style={{ fontFamily: "Manrope_700Bold" }}
            >
              Choose Products
            </Text>
            <Text
              className="text-center text-[14px] text-[#585757]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Our product ranges from women to kids clothing and drifts, simply
              check through our collection, make your choice and maybe add to
              your cart
            </Text>
          </View>
        </View>
        <View className="">
          <View className="flex flex-row justify-end">
            <View className="w-[45%]"></View>
            <View className="w-[55%] flex flex-row justify-between items-center">
              <View className="flex flex-row gap-[4px]">
                <View className="w-[24px] h-[8px] bg-[#FF6EC7] rounded-[4px] "></View>
                <View className="w-[8px] h-[8px] bg-[#1F141440] rounded-full"></View>
                <View className="w-[8px] h-[8px] bg-[#1F141440] rounded-full"></View>
              </View>
              <Link
                className="font-600 text-[18px] text-[#050404]"
                style={{ fontFamily: "Manrope_600SemiBold" }}
                href={"/onboardingTwo"}
                asChild
              >
                <Pressable>
                  <Text
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                    className="text-[18px]"
                  >
                    Next
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
