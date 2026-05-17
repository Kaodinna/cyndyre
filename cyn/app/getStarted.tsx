import {
  Text,
  View,
  StatusBar,
  StyleSheet,
  ImageBackground,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function GetStarted() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
    },
    text: {
      fontSize: 25,
      fontWeight: "500",
    },
    image: {
      flex: 1,
      resizeMode: "cover",
      justifyContent: "center",
    },
    backgroundGradient: {
      flex: 1,
    },
  });
  const fashionShop = require("../assets/images/unsplash_fouVDmGXoPI.png");
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground style={styles.image} source={fashionShop}>
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.63)"]}
          style={styles.backgroundGradient}
        >
          <View className="flex flex-col">
            <View className="h-[60%]"></View>
            <View className="h-[40%] px-4">
              <View className="flex flex-col gap-[24px]">
                <Text
                  className=" text-[32px] text-[#FFFFFF] text-center"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  You want Authentic, here you go!
                </Text>
                <Text
                  className=" text-[16px] text-[#F2F2F2] text-center"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  Find it here, buy it now!
                </Text>
                <Link href={"/(drawer)/(tabs)"} asChild>
                  <Pressable className="h-[48px] bg-[#FF6EC7] rounded-[4px] items-center flex justify-center">
                    <Text
                      className=" text-[16px] text-center text-[#FFFFFF] items-center"
                      style={{ fontFamily: "Manrope_500Medium" }}
                    >
                      Get Started
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
