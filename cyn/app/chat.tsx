import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, Octicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ChatBubble } from "@/components/reusables";
import { Message } from "@/types/type";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { getChatMessages } from "@/services/api/request";
import { getToken, SERVER_URL } from "@/utils/axios/axios";
import { io, Socket } from "socket.io-client";

const BookingChatScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    bookingId: string;
    providerName?: string;
    serviceType?: string;
    bookingRef?: string;
    avatarUrl?: string;
  }>();

  const bookingId = params.bookingId;
  const providerName = params.providerName ?? "Provider";
  const serviceType = params.serviceType ?? "Service";
  const bookingRef = params.bookingRef ?? "";
  const avatarUrl = params.avatarUrl;

  const senderType: "customer" | "provider" =
    user?.role === "businessOwner" ? "provider" : "customer";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const mapServerMessage = (msg: any): Message => ({
    id: msg._id ?? msg.id ?? String(Math.random()),
    type: msg.isSystemMessage
      ? "system"
      : msg.senderType === "provider"
        ? "provider"
        : "client",
    text: msg.message,
    time: msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined,
  });

  const loadHistory = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const data = await getChatMessages(bookingId);
      const history = Array.isArray(data) ? data.map(mapServerMessage) : [];
      setMessages(history);
    } catch {
      // history unavailable — start fresh
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!bookingId) return;

    let socket: Socket;

    const connect = async () => {
      const token = await getToken();
      socket = io(SERVER_URL, {
        transports: ["websocket"],
        auth: { token },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("joinRoom", bookingId);
      });

      socket.on("newMessage", (msg: any) => {
        setMessages((prev) => [...prev, mapServerMessage(msg)]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      });

      socket.on("connect_error", () => {
        // silently retry — socket.io handles reconnection automatically
      });
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveRoom", bookingId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [bookingId]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !bookingId || !user?.id) return;

    if (!socketRef.current?.connected) {
      Alert.alert("Not connected", "Reconnecting… please try again in a moment.");
      return;
    }

    setSending(true);
    setInputText("");

    socketRef.current.emit(
      "sendMessage",
      {
        bookingId,
        senderId: user.id,
        senderType,
        message: text,
      },
      () => setSending(false),
    );
  };

  const systemMessage: Message = {
    id: "__system__",
    type: "system",
    text: "Important: All booking-related communication must be done through this platform for evidence and protection. Cynderalla will prioritize customer experience in case of disputes.",
  };

  const displayMessages: Message[] =
    messages.length > 0 && messages[0].type === "system"
      ? messages
      : [systemMessage, ...messages];

  return (
    <SafeAreaView className="flex-1 bg-[#F8F8FF]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Octicons name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Image
            source={
              avatarUrl
                ? { uri: avatarUrl }
                : { uri: "https://i.pravatar.cc/100" }
            }
            className="w-10 h-10 rounded-full"
          />
          <View className="flex-1">
            <Text className="text-[16px] font-semibold text-gray-900">
              {providerName}
            </Text>
            <Text className="text-[12px] text-gray-500" numberOfLines={1}>
              {bookingRef ? `${bookingRef} • ` : ""}{serviceType}
            </Text>
          </View>
        </View>

        {/* Messages */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF6EC7" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item }) => (
              <ChatBubble type={item.type} text={item.text} time={item.time} />
            )}
          />
        )}

        {/* Input */}
        <View
          className="bg-white border-t border-gray-100 px-4 py-3"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="flex-row items-center gap-3">
            <TextInput
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-[14px]"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={sending || !inputText.trim()}
              className="w-10 h-10 rounded-full bg-pink-500 items-center justify-center"
              style={{ opacity: sending || !inputText.trim() ? 0.5 : 1 }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BookingChatScreen;
