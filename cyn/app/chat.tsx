import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { Feather, Octicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChatBubble } from "@/components/reusables";
import { Message } from "@/types/type";
import { router } from "expo-router";

const messages: Message[] = [
  {
    id: "1",
    type: "system",
    text: "Important: All booking-related communication must be done through this platform for evidence and protection. Cynderalla will prioritize customer experience in case of disputes.",
  },
  {
    id: "2",
    type: "client",
    text: "Hi! I have a booking for hair styling on December 2nd.",
    time: "10:30 AM",
  },
  {
    id: "3",
    type: "provider",
    text: "Hello Jane! Yes, I can see your booking. Looking forward to styling your hair!",
    time: "10:32 AM",
  },
];

const BookingChatScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-[#F8F8FF]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Pressable onPress={() => router.push("/(drawer)/(tabs)/cart")}>
            <Octicons name="arrow-left" size={24} color="black" />
          </Pressable>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            className="w-10 h-10 rounded-full"
          />
          <View>
            <Text className="text-[16px] font-semibold text-gray-900">
              Jane Doe
            </Text>
            <Text className="text-[12px] text-gray-500">
              Booking #BK-001 • Hair Styling
            </Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 16,
          }}
          renderItem={({ item }) => (
            <ChatBubble type={item.type} text={item.text} time={item.time} />
          )}
        />

        {/* Input */}
        <View
          className="bg-white border-t border-gray-100 px-4 py-3"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="flex-row items-center gap-3">
            <TouchableOpacity>
              <Feather name="paperclip" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TextInput
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-[14px]"
            />

            <TouchableOpacity className="w-10 h-10 rounded-full bg-pink-500 items-center justify-center">
              <Feather name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BookingChatScreen;
