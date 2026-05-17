import {
  Text,
  Pressable,
  View,
  StatusBar,
  StyleSheet,
  Image,
  Platform,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import CustomStatusBar from "@/components/statusbar";
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
export default function NotificationScreen() {
  type ItemData = {
    id: string;
    title: string;
    body: string;
    date: string;
  };

  const DATA: ItemData[] = [
    {
      id: "1",
      title: "Order Shipped",
      body: "We’re pleased to notify you that your package with order no #976423128 has been shipped.",
      date: "July 17th",
    },
    {
      id: "2",
      title: "Order Shipped",
      body: "We’re pleased to notify you that your package with order no #976423128 has been shipped.",
      date: "July 17th",
    },
    {
      id: "3",
      title: "Order Received",
      body: "We’re pleased to notify you that your package with order no #976423128 has been shipped.",
      date: "July 17th",
    },
    {
      id: "4",
      title: "Delivery Failed",
      body: "We’re pleased to notify you that your package with order no #976423128 has been shipped.",
      date: "July 17th",
    },
  ];
  type ItemProps = {
    item: ItemData;
    onPress: () => void;
  };
  const Item = ({ item, onPress }: ItemProps) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-row bg-white px-4 py-3 border-[#FFF1F9] border-t-[1px] border-b-[#FFF1F9] mb-2"
    >
      <View className="w-[10%]">
        <View className="w-[24px] h-[24px] bg-[#008000] rounded-full"></View>
      </View>
      <View className="w-[90%]">
        <View className="flex flex-row justify-between">
          <Text
            className="text-[14px] text-[#050404]"
            style={{ fontFamily: "Inter_600SemiBold" }}
          >
            {item.title}
          </Text>
          <Text
            style={{ fontFamily: "Manrope_400Regular" }}
            className="text-[12px] text-[#585757]"
          >
            {item.date}
          </Text>
        </View>
        <View className="mt-3">
          <Text
            className="text-[16px] leading-[20px] text-[#373636]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {item.body}
          </Text>
        </View>

        <Pressable className="border-[#FF6EC7] border-[1px] rounded-[4px] w-[80px] mt-3 px-[6px] py-[2px] flex">
          <Text
            className="text-[12px] text-[#FF6EC7] text-center"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            See details
          </Text>
        </Pressable>
      </View>
    </TouchableOpacity>
  );
  const renderItem = ({ item }: { item: ItemData }) => {
    return <Item item={item} onPress={() => {}} />;
  };
  return (
    <SafeAreaView className="bg-[#F8F8FF] min-h-full">
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={""}
      />
    </SafeAreaView>
  );
}
