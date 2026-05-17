import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, View, Text, ScrollView } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Portal } from "react-native-portalize";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ProgressBar } from "./reusables";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: number; // px or percentage
  state?: number; // px or percentage
};

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  maxHeight,
  state,
}: BottomSheetProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const [contentHeight, setContentHeight] = useState(0);

  const sheetHeight =
    maxHeight && maxHeight < 1
      ? SCREEN_HEIGHT * maxHeight
      : (maxHeight ?? contentHeight);

  useEffect(() => {
    if (visible && sheetHeight) {
      translateY.value = withSpring(0);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT);
    }
  }, [visible, sheetHeight]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (translateY.value > sheetHeight / 3) {
        translateY.value = withTiming(SCREEN_HEIGHT, {}, () =>
          scheduleOnRN(onClose),
        );
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Portal>
      <>
        {/* Backdrop */}
        <Pressable onPress={onClose} className="absolute inset-0 bg-black/40" />

        <GestureDetector gesture={panGesture}>
          <Animated.View
            // style={[animatedStyle, { maxHeight: sheetHeight || "auto" }]}
            style={[
  animatedStyle,
  {
    height: sheetHeight || undefined,
    maxHeight: sheetHeight || undefined,
  },
]}
            className="absolute bottom-0 w-full bg-white rounded-t-3xl"
          >
            {/* Handle */}
            <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mt-3 mb-1" />

            {/* Header */}
            {title && (
              <View className="flex-row justify-between items-center px-5 py-2 border-b border-gray-200">
                <Text className="text-lg font-semibold">{title}</Text>
                <Pressable onPress={onClose}>
                  <Text className="text-xl text-gray-400">✕</Text>
                </Pressable>
              </View>
            )}
            {state && (
              <View className="mt-1 p-4 ">
                <ProgressBar step={state} />
              </View>
            )}
            {/* Scrollable content */}
            <ScrollView
              style={{ maxHeight: sheetHeight ? sheetHeight - 80 : undefined }} // leave space for footer
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                paddingBottom: 80,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View
                onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
              >
                {children}
              </View>
            </ScrollView>

            {/* Footer — pinned absolutely */}
            {footer && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  backgroundColor: "white",
                  borderTopWidth: 1,
                  borderTopColor: "#E5E7EB",
                }}
              >
                {footer}
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      </>
    </Portal>
  );
}
