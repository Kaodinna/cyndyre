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

export default function profileScreen() {
  return (
    <SafeAreaView className="flex-1  bg-gray-100">
      <View>
        <View className="relative">
          <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center" />
          <View
            className="w-4 h-4 bg-red-500 rounded-full absolute"
            style={{ transform: [{ translateX: 34 }, { translateY: 34 }] }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
