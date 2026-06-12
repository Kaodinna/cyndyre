import {
  Category,
  CustomDropdownProps,
  CustomTextAreaProps,
  CustomTextInputProps,
  CustomToastProps,
  InfoRowProps,
  MultiPhotoUploaderProps,
  PerformanceCardProps,
  Props,
  QuickActionsProps,
  RatingProps,
  StatCardProps,
  TabButtonsProps,
} from "@/types/type";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Href, Link, router, useNavigation } from "expo-router";
import React, {
  useRef,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import {
  View,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  Animated,
  TextInput,
  Modal,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  InputAccessoryView,
  Button,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { jwtDecode } from "jwt-decode";
import {
  getProducts,
  getServiceProviderById,
  getServicesByServiceProviderId,
} from "@/services/api/request";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Slider from "@react-native-community/slider";
const baseUrl = `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1`;

export function filterItemsWithNullParent(items?: Category[]): Category[] {
  return (items ?? []).filter(
    (item) =>
      item.parent !== null || item.name === "Thrift Market and Creatives",
  );
}
export function filterItemsWithNoParent(items: Category[]): Category[] {
  return items?.filter((item) => item.parent === null);
}

export const TabButtons: React.FC<TabButtonsProps> = ({
  tabs,
  activeTab,
  onChangeTab,
}) => {
  return (
    <View className="flex flex-row w-full">
      {tabs.map((tab, index) => {
        const isActive = activeTab === index;

        return (
          <Pressable
            key={index}
            onPress={() => onChangeTab(index)}
            className="w-1/3"
          >
            <View
              className={`
                flex items-center justify-center py-3 
                border-b-[1px]
                ${isActive ? "border-[#F6339A]" : "border-transparent"}
              `}
            >
              <Text
                style={{ fontFamily: "Manrope_700Bold" }}
                className={`
                  text-[14px] 
                  ${isActive ? "text-[#F6339A] font-semibold" : "text-[#6B7280]"}
                `}
              >
                {tab}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CarouselWithThumbnails({
  images,
  height = 260,
  borderRadius = 16,
  thumbnailSize = 78,
  thumbnailSpacing = 12,
}: Props) {
  const mainRef = useRef<FlatList<string>>(null);
  const thumbRef = useRef<FlatList<string>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // When main carousel finishes momentum scroll, update active index
  const onMomentumScrollEnd = useCallback(
    (ev: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = ev.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      setActiveIndex(index);

      // ensure active thumbnail is visible / centered
      thumbRef.current?.scrollToOffset({
        offset: Math.max(
          0,
          index * (thumbnailSize + thumbnailSpacing) -
            SCREEN_WIDTH / 2 +
            thumbnailSize / 2,
        ),
        animated: true,
      });
    },
    [thumbnailSize, thumbnailSpacing],
  );

  // When user taps thumbnail, scroll main to that index
  const handleThumbnailPress = (index: number) => {
    setActiveIndex(index);
    mainRef.current?.scrollToOffset({
      offset: index * SCREEN_WIDTH,
      animated: true,
    });

    // also scroll thumbnails to keep selected visible
    thumbRef.current?.scrollToOffset({
      offset: Math.max(
        0,
        index * (thumbnailSize + thumbnailSpacing) -
          SCREEN_WIDTH / 2 +
          thumbnailSize / 2,
      ),
      animated: true,
    });
  };

  // Render each main image (full width)
  const renderMainItem = ({ item }: { item: string }) => (
    <View
      style={{
        width: SCREEN_WIDTH,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={{ uri: item }}
        style={{
          width: SCREEN_WIDTH - 10, // small horizontal padding for visual spacing
          height,
          borderRadius,
          resizeMode: "cover",
        }}
      />
    </View>
  );

  // Render thumbnails
  const renderThumbItem = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const isActive = index === activeIndex;
    return (
      <Pressable
        onPress={() => handleThumbnailPress(index)}
        style={[
          styles.thumbnailWrap,
          {
            marginRight: thumbnailSpacing,
            width: thumbnailSize,
            height: thumbnailSize,
            borderRadius: 12,
            ...(isActive ? styles.activeThumbnailWrap : {}),
          },
        ]}
      >
        <Image
          source={{ uri: item }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 10,
            resizeMode: "cover",
          }}
        />
      </Pressable>
    );
  };

  return (
    <View>
      {/* MAIN CAROUSEL */}
      <FlatList
        data={images}
        ref={mainRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderMainItem}
        onMomentumScrollEnd={onMomentumScrollEnd}
        initialScrollIndex={0}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* DOTS */}
      <View style={styles.dotsContainer}>
        {images?.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              { backgroundColor: idx === activeIndex ? "#FF4EB9" : "#E6E6E6" },
            ]}
          />
        ))}
      </View>

      {/* THUMBNAILS */}
      <View style={{ marginTop: 14, paddingLeft: 0 }}>
        <FlatList
          data={images}
          ref={thumbRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => `thumb-${i}`}
          renderItem={renderThumbItem}
          contentContainerStyle={{ alignItems: "center" }}
          // performance helpers
          getItemLayout={(_, index) => ({
            length: thumbnailSize + thumbnailSpacing,
            offset: index * (thumbnailSize + thumbnailSpacing),
            index,
          })}
        />
      </View>
    </View>
  );
}

export function RatingStars({
  rating,
  size = 22,
  color = "#FFB400",
}: RatingProps) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const icon =
      rating >= i
        ? "star" // full star
        : rating >= i - 0.5
          ? "star-half" // half star
          : "star-border"; // empty star

    stars.push(
      <MaterialIcons
        key={i}
        name={icon as any}
        size={size}
        color={color}
        style={{ marginRight: 3 }}
      />,
    );
  }

  return <View style={{ flexDirection: "row" }}>{stars}</View>;
}

export function formatNumberToThousands(number: number) {
  return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function PerformanceCard({
  stats,
  onPrimaryPress,
  onSecondaryPress,
  primaryBtnLabel = "View Stats",
  secondaryBtnLabel = "Reports",
}: PerformanceCardProps) {
  return (
    <View className="p-[24px] gap-[24px] rounded-[16px] bg-[#F6339A]">
      {/* Header */}
      <View className="flex flex-row justify-between items-center">
        <View className="flex flex-col gap-[4px]">
          <Text
            className="text-[#FCE7F3] text-[14px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            This Week
          </Text>
          <Text
            className="text-[#ffffff] text-[16px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            Your Performance
          </Text>
        </View>
        <Feather name="trending-up" size={24} color="white" />
      </View>

      {/* Stats Row */}
      <View className="flex flex-row gap-[16px]">
        {stats.map((stat, idx) => (
          <View key={idx} className="flex flex-col gap-[4px] w-1/3">
            <Text
              className="text-[#FCE7F3] text-[12px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {stat.label}
            </Text>
            <Text
              className="text-[#ffffff] text-[20px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <View className="flex flex-row gap-[8px]">
        <Pressable
          onPress={onPrimaryPress}
          className="bg-white rounded-[10px] h-[36px] flex items-center justify-center flex-1"
        >
          <Text
            className="text-[#F6339A] text-[14px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {primaryBtnLabel}
          </Text>
        </Pressable>
        <Pressable
          onPress={onSecondaryPress}
          className="bg-[#E60076] rounded-[10px] h-[36px] flex items-center justify-center flex-1"
        >
          <Text
            className="text-[#ffffff] text-[14px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {secondaryBtnLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function StatCard({
  icon,
  value,
  label,
  className = "",
}: StatCardProps) {
  return (
    <View
      className={`rounded-[16px] p-[16px] bg-white flex flex-col gap-[8px] ${className}`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // Android shadow
      }}
    >
      {/* Icon */}
      <View className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center bg-[#F3F4F6]">
        {icon}
      </View>

      {/* Value */}
      <Text
        className="text-[20px] text-[#101828]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {value}
      </Text>

      {/* Label */}
      <Text
        className="text-[12px] text-[#6A7282]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {label}
      </Text>
    </View>
  );
}
export function StatCardThree({
  icon,
  value,
  label,
  className = "",
}: StatCardProps) {
  return (
    <View
      className={`rounded-[16px] p-[12px] bg-white flex flex-col gap-[16px] border-[#E5E7EB] border-[1px] ${className}`}
    >
      {/* Icon */}
      <View className="flex flex-row items-center gap-[8px]">
        <View className="w-[32px] h-[32px] rounded-full flex items-center justify-center bg-[#FCE7F3]">
          {icon}
        </View>
        <Text
          className="text-[12px] text-[#6A7282]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {label}
        </Text>
      </View>
      {/* Value */}
      <Text
        className="text-[20px] text-[#101828]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {value}
      </Text>

      {/* Label */}
    </View>
  );
}
export function StatCardTwo({
  icon,
  value,
  label,
  className = "",
}: StatCardProps) {
  return (
    <View
      className={`rounded-[16px] p-[16px] bg-white flex flex-col gap-[8px] ${className}`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // Android shadow
      }}
    >
      {/* Icon */}
      <View className="w-[48px] h-[48px] rounded-[14px] flex  justify-center ">
        {icon}
      </View>

      {/* Value */}
      <Text
        className="text-[20px] text-[#101828]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {value}
      </Text>

      {/* Label */}
      <Text
        className="text-[12px] text-[#6A7282]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {label}
      </Text>
    </View>
  );
}
export function QuickActions({
  icon,
  value,
  className = "",
  route,
}: QuickActionsProps) {
  const handlePress = () => {
    if (route) {
      router.push(route as any); // now TS knows route is not undefined
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`rounded-[16px] p-[16px] bg-[#F9FAFB] flex flex-col gap-[8px] ${className}`}
    >
      {/* Icon */}
      <View className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center ">
        {icon}
      </View>

      {/* Value */}
      <Text
        className="text-[14px] text-[#101828] text-center"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {value}
      </Text>
    </Pressable>
  );
}
export const SectionHeader = ({
  title,
  action,
  href,
}: {
  title: string;
  action: string;
  href: Href;
}) => (
  <View className="flex flex-row justify-between items-center mt-4 mb-2">
    <Text style={styles.sectionTitle}>{title}</Text>
    <Link href={href} asChild>
      <Text style={styles.sectionAction}>{action}</Text>
    </Link>
  </View>
);

// export const toastConfig = {
//   error: ({ text1, text2 }: CustomToastProps) => (
//     <View className="flex-row items-center justify-start w-[90%] h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg">
//       {text1 && (
//         <Text className="text-[#D92D20] text-[12px] font-semibold">
//           {text1}
//         </Text>
//       )}
//       {text2 && <Text style={{ color: "white" }}>{text2}</Text>}
//     </View>
//   ),
//   success: ({ text1, text2 }: CustomToastProps) => (
//     <View className="flex-row items-center justify-start w-[90%] h-[52px] border border-[#ABEFC6] bg-[#ECFDF3] p-3 rounded-lg">
//       {text1 && (
//         <Text className="text-[#067647] text-[12px] font-semibold">
//           {text1}
//         </Text>
//       )}
//       {text2 && <Text style={{ color: "white" }}>{text2}</Text>}
//     </View>
//   ),
//   delete: ({ text1, text2 }: CustomToastProps) => (
//     <View className="flex-row items-center justify-start w-[90%] h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg">
//       {text1 && (
//         <Text className="text-[#D92D20] text-[12px] font-semibold">
//           {text1}
//         </Text>
//       )}
//       {text2 && <Text style={{ color: "white" }}>{text2}</Text>}
//     </View>
//   ),
// };
export const toastConfig = {
  success: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-center w-[90%] min-h-[52px] border border-[#ABEFC6] bg-[#ECFDF3] p-3 rounded-lg">
      <View className="flex-1">
        {text1 && (
          <Text className="text-[#067647] text-[13px] font-semibold">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-[#475467] text-[12px] mt-1">{text2}</Text>
        )}
      </View>
    </View>
  ),

  error: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-center w-[90%] min-h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg">
      <View className="flex-1">
        {text1 && (
          <Text className="text-[#D92D20] text-[13px] font-semibold">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-[#475467] text-[12px] mt-1">{text2}</Text>
        )}
      </View>
    </View>
  ),
};

export const InfoRow: React.FC<InfoRowProps> = ({
  title,
  subtitle,
  rightText,
}) => {
  return (
    <View className="flex flex-row items-center justify-between">
      <View className="flex flex-col gap-[4px]">
        <Text
          className="text-[#101828] text-[14px]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {title}
        </Text>
        <Text
          className="text-[#6A7282] text-[12px]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {subtitle}
        </Text>
      </View>
      <Text
        className="text-[#101828] text-[16px]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        ₦{formatNumberToThousands(rightText)}
      </Text>
    </View>
  );
};
export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  fadeAnim,
  value,
  placeholderTextColor,
  onChangeText,
  placeholder,
  className = "",
  errorMessage,
  label = "",
  keyboardType,
  secureTextEntry = false,
  ...props
}) => {
  const [isTextHidden, setIsTextHidden] = useState(secureTextEntry);

  return (
    <View className="flex flex-col gap-[8px] ">
      <Text
        className="text-[16px] leading-[25px] text-[#364153]"
        style={{ fontFamily: "Inter_300Light" }}
      >
        {label}
      </Text>

      <View>
        <View className="flex-row items-center border-[1.24px] border-[#D1D5DC] rounded-[10px] px-[16px] h-[50.43px]">
          <TextInput
            style={{ fontFamily: "Inter_500Medium", flex: 1 }}
            value={value}
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            secureTextEntry={isTextHidden}
            className={`text-[14px] leading-[15px] text-[#000000] ${className} `}
            {...props}
          />

          {/* Toggle only if secureTextEntry is true */}
          {secureTextEntry && (
            <Pressable onPress={() => setIsTextHidden((prev: any) => !prev)}>
              <Ionicons
                name={isTextHidden ? "eye-off" : "eye"}
                size={20}
                color="#808080"
              />
            </Pressable>
          )}
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text className="font-600 text-[10px] leading-[10px] text-[#FF0000] mt-1">
            {errorMessage}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};
export const CustomTextInputWithIcon: React.FC<CustomTextInputProps> = ({
  fadeAnim,
  value,
  placeholderTextColor,
  onChangeText,
  placeholder,
  className = "",
  errorMessage,
  label = "",
  keyboardType,
  secureTextEntry = false,
  icon,
  ...props
}) => {
  const [isTextHidden, setIsTextHidden] = useState(secureTextEntry);

  return (
    <View className="flex flex-col gap-[8px] w-full">
      {label ? (
        <Text
          className="text-[16px] leading-[25px] text-[#364153]"
          style={{ fontFamily: "Inter_300Light" }}
        >
          {label}
        </Text>
      ) : null}

      <View className="w-full">
        <View className="flex-row items-center border-[1.24px] border-[#D1D5DC] rounded-[10px] px-[16px] h-[50.43px] gap-[8px] w-full">
          {/* Dynamic icon */}
          {icon && icon}

          <TextInput
            style={{ fontFamily: "Inter_500Medium" }}
            className={`flex-1 text-[14px] leading-[15px] ${className}`}
            value={value}
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            secureTextEntry={isTextHidden}
            {...props}
          />

          {/* Password toggle */}
          {secureTextEntry && (
            <Pressable onPress={() => setIsTextHidden((prev) => !prev)}>
              <Ionicons
                name={isTextHidden ? "eye-off" : "eye"}
                size={20}
                color="#808080"
              />
            </Pressable>
          )}
        </View>

        {errorMessage ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text className="font-600 text-[10px] leading-[10px] text-[#FF0000] mt-1">
              {errorMessage}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
};

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  options,
  placeholder = "Select option",
  icon,
  errorMessage,
  fadeAnim,
  onSelect,
}) => {
  const [visible, setVisible] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <View className="flex flex-col gap-[8px] w-full">
      {label ? (
        <Text
          className="text-[16px] leading-[25px] text-[#364153]"
          style={{ fontFamily: "Inter_300Light" }}
        >
          {label}
        </Text>
      ) : null}

      {/* Dropdown trigger */}
      <Pressable
        onPress={() => setVisible(true)}
        className="flex-row items-center border-[1.24px] border-[#D1D5DC] rounded-[10px] px-[16px] h-[50.43px] gap-[8px] w-full"
      >
        {icon && icon}

        <Text
          className={`flex-1 text-[14px] ${
            selectedLabel ? "text-[#111827]" : "text-[#9CA3AF]"
          }`}
          style={{ fontFamily: "Inter_500Medium" }}
        >
          {selectedLabel || placeholder}
        </Text>

        <Ionicons name="chevron-down" size={18} color="#99A1AF" />
      </Pressable>

      {/* Error */}
      {errorMessage ? (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text className="font-600 text-[10px] text-[#FF0000] mt-1">
            {errorMessage}
          </Text>
        </Animated.View>
      ) : null}

      {/* Modal */}
      <Modal transparent visible={visible} animationType="fade">
        <Pressable
          onPress={() => setVisible(false)}
          className="flex-1 bg-black/40 justify-center px-6"
        >
          <View className="bg-white rounded-[14px] max-h-[60%]">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                  className="px-4 py-4 border-b border-[#E5E7EB]"
                >
                  <Text
                    className="text-[16px] text-[#111827]"
                    style={{ fontFamily: "Inter_500Medium" }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export const CustomTextArea: React.FC<CustomTextAreaProps> = ({
  label,
  value,
  placeholder,
  placeholderTextColor = "#9CA3AF",
  icon,
  errorMessage,
  fadeAnim,
  onChangeText,
  numberOfLines = 4,
  className = "",
}) => {
  return (
    <View className="flex flex-col gap-[8px] w-full">
      {label ? (
        <Text
          className="text-[16px] leading-[25px] text-[#364153]"
          style={{ fontFamily: "Inter_300Light" }}
        >
          {label}
        </Text>
      ) : null}

      <View className="w-full">
        <View className="flex-row border-[1.24px] border-[#D1D5DC] rounded-[10px] px-[16px] py-[12px] gap-[8px] w-full">
          {icon && <View className="pt-1">{icon}</View>}

          <TextInput
            multiline
            textAlignVertical="top"
            numberOfLines={numberOfLines}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            style={{ fontFamily: "Inter_500Medium" }}
            className={`flex-1 text-[14px] leading-[22px] h-[100px] ${className}`}
          />
        </View>

        {errorMessage ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text className="font-600 text-[10px] text-[#FF0000] mt-1">
              {errorMessage}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
};

export const MultiPhotoUploader: React.FC<MultiPhotoUploaderProps> = ({
  label = "Add Photos",
  images,
  onChange,
  maxImages = 5,
  errorMessage,
  tipText,
}) => {
  useEffect(() => {
    (async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);
  const [uploading, setUploading] = useState(false);

  const uploadImageToBackend = async (uri: string): Promise<string> => {
    const formData = new FormData();

    formData.append("uploadedFile", {
      uri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

    const response = await fetch(`${baseUrl}/bucket/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data?.success) {
      throw new Error("Upload failed");
    }
    console.log("data,", data);
    return data.data.url; // Cloudinary URL from backend
  };

  const pickImages = async () => {
    if (images.length >= maxImages) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        setUploading(true);
        const uploadedUrls = await Promise.all(
          result.assets.map((asset) => uploadImageToBackend(asset.uri)),
        );

        onChange([...images, ...uploadedUrls]);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploading(false); // stop loading
      }
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <View className="w-full gap-[12px]">
      {uploading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <ActivityIndicator size="large" color="#6B7280" />
        </View>
      )}

      {/* Label */}
      <Text className="text-[16px] text-[#364153] font-light">{label}</Text>

      {/* Image Grid */}
      <FlatList
        data={images}
        horizontal
        keyExtractor={(_, i) => String(i)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item, index }) => (
          <View className="relative mt-2">
            <Image
              source={{ uri: item }}
              className="w-[88px] h-[88px] rounded-[12px]"
            />

            <Pressable
              onPress={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-[#FF2D55] w-[22px] h-[22px] rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        )}
      />

      {/* Upload Button */}
      {images.length < maxImages && (
        <Pressable
          onPress={pickImages}
          className="border border-dashed border-[#D1D5DC] rounded-[14px] py-[20px] items-center justify-center gap-[6px]"
        >
          <Ionicons name="cloud-upload-outline" size={22} color="#6B7280" />
          <Text className="text-[14px] text-[#6B7280]">Upload Photo</Text>
        </Pressable>
      )}

      {/* Tip */}
      {tipText && (
        <View className="bg-[#FDF2F8] rounded-[10px] px-[12px] py-[10px] border-[#FCCEE8] border-[1px] flex flex-row gap-[10px]">
          <Text
            className="text-[14px] text-[#861043]"
            style={{ fontFamily: "Manrope_700Bold" }}
          >
            Tip:
          </Text>

          <Text
            className="text-[14px] text-[#861043] flex-1"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {tipText}
          </Text>
        </View>
      )}

      {/* Error */}
      {errorMessage && (
        <Text className="text-[10px] text-[#FF0000]">{errorMessage}</Text>
      )}
    </View>
  );
};

type ChatBubbleProps = {
  type: "system" | "client" | "provider";
  text: string;
  time?: string;
};

export const ChatBubble = ({ type, text, time }: ChatBubbleProps) => {
  if (type === "system") {
    return (
      <View className="bg-pink-50 border border-pink-200 rounded-xl p-3 mb-4">
        <Text className="text-[12px] text-pink-700 text-center">{text}</Text>
      </View>
    );
  }

  const isProvider = type === "provider";

  return (
    <View
      className={`mb-4 max-w-[80%] ${isProvider ? "self-end" : "self-start"}`}
    >
      <View
        className={`rounded-2xl px-4 py-3 ${
          isProvider ? "bg-pink-500 rounded-br-md" : "bg-gray-100 rounded-bl-md"
        }`}
      >
        <Text
          className={`text-[14px] ${
            isProvider ? "text-white" : "text-gray-800"
          }`}
        >
          {text}
        </Text>
      </View>

      {time && <Text className="text-[10px] text-gray-400 mt-1">{time}</Text>}
    </View>
  );
};

type TimeField = "start" | "end";

type Propz = {
  day: string;
  initialEnabled?: boolean;
  initialStartTime?: Date;
  initialEndTime?: Date;
  onChange?: (enabled: boolean, startTime: Date, endTime: Date) => void;
};

export function WorkingHourRow({ day, initialEnabled = false, initialStartTime, initialEndTime, onChange }: Propz) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [startTime, setStartTime] = useState(initialStartTime ?? new Date());
  const [endTime, setEndTime] = useState(initialEndTime ?? new Date());

  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeField, setActiveField] = useState<TimeField | null>(null);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const openTimePicker = (field: TimeField) => {
    setActiveField(field);
    setPickerVisible(true);
  };

  const onTimeChange = (_: any, selectedDate?: Date) => {
    if (!selectedDate) {
      setPickerVisible(false);
      return;
    }

    let newStart = startTime;
    let newEnd = endTime;
    if (activeField === "start") { setStartTime(selectedDate); newStart = selectedDate; }
    if (activeField === "end") { setEndTime(selectedDate); newEnd = selectedDate; }

    onChange?.(enabled, newStart, newEnd);

    if (Platform.OS === "android") {
      setPickerVisible(false);
    }
  };

  return (
    <>
      {/* Row */}
      <View className="flex-row items-center justify-between mb-3">
        {/* Checkbox + Day */}
        <Pressable
          onPress={() => { const next = !enabled; setEnabled(next); onChange?.(next, startTime, endTime); }}
          className="flex-row items-center gap-2"
        >
          <Feather
            name={enabled ? "check-square" : "square"}
            size={18}
            color={enabled ? "#EC4899" : "#9CA3AF"}
          />
          <Text className="text-[13px] text-gray-800 w-10">{day}</Text>
        </Pressable>

        {/* Right Side */}
        {!enabled ? (
          <Text className="text-gray-400 text-[12px]">Closed</Text>
        ) : (
          <View className="flex-row items-center gap-2">
            <TextInput
              value={formatTime(startTime)}
              editable={false}
              onPressIn={() => openTimePicker("start")}
              className="border border-gray-200 rounded-lg px-3 py-1 text-[12px] text-gray-700 min-w-[72px] text-center"
            />

            <Text className="text-gray-400 text-[12px]">to</Text>

            <TextInput
              value={formatTime(endTime)}
              editable={false}
              onPressIn={() => openTimePicker("end")}
              className="border border-gray-200 rounded-lg px-3 py-1 text-[12px] text-gray-700 min-w-[72px] text-center"
            />
          </View>
        )}
      </View>

      {/* ANDROID PICKER */}
      {pickerVisible && Platform.OS === "android" && (
        <DateTimePicker
          value={activeField === "start" ? startTime : endTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* IOS PICKER MODAL */}
      {Platform.OS === "ios" && (
        <Modal transparent visible={pickerVisible} animationType="slide">
          <View className="flex-1 justify-end bg-black/30">
            <View className="bg-white p-4 rounded-t-2xl">
              <DateTimePicker
                value={activeField === "start" ? startTime : endTime}
                mode="time"
                display="spinner"
                textColor="#111827"
                themeVariant="light"
                onChange={(_, date) => date && onTimeChange(null, date)}
              />

              <Pressable
                onPress={() => setPickerVisible(false)}
                className="mt-4 py-3 bg-pink-500 rounded-lg"
              >
                <Text className="text-white text-center font-medium">Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

export function UnavailableDateRow({ date, onDelete }: { date: string; onDelete?: () => void }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-[13px] text-gray-700">{date}</Text>

      <TouchableOpacity onPress={onDelete}>
        <Feather name="x" size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}

type Propx = {
  title: string;
  description: string;
  variant?: "info" | "danger";
};

export function InfoAlert({ title, description, variant = "info" }: Propx) {
  const isDanger = variant === "danger";

  return (
    <View
      className={`rounded-2xl p-4 mb-6 border ${
        isDanger ? "bg-pink-50 border-pink-200" : "bg-pink-50 border-pink-200"
      }`}
    >
      <Text className="text-[13px] font-semibold text-pink-700 mb-1">
        {title}
      </Text>
      <Text className="text-[12px] text-pink-700 leading-5">{description}</Text>
    </View>
  );
}

interface EmptyListProps {
  message?: string;
  icon?: any; // optional icon/image
}

export const EmptyList: React.FC<EmptyListProps> = ({ message, icon }) => {
  return (
    <View style={styles.container}>
      {icon && <Image source={icon} style={styles.icon} resizeMode="contain" />}
      <Text style={styles.text}>{message || "Nothing to show here!"}</Text>
    </View>
  );
};
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  } else {
    return num.toString();
  }
};

export const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};
export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};
type DayHours = {
  open: string;
  close: string;
  isOpen: boolean;
};

type BusinessHours = Record<
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday",
  DayHours
>;

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABEL: Record<(typeof DAY_ORDER)[number], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 || 12;
  const period = h >= 12 ? "PM" : "AM";
  return m === 0 ? `${hour} ${period}` : `${hour}:${m} ${period}`;
};

export const summarizeBusinessHours = (hours?: BusinessHours): string[] => {
  if (!hours) return [];

  const groups: Record<string, string[]> = {};

  for (const day of DAY_ORDER) {
    const dayHours = hours[day];

    // 🔒 Guard missing days
    if (!dayHours || !dayHours.isOpen) {
      if (!groups["Closed"]) groups["Closed"] = [];
      groups["Closed"].push(DAY_LABEL[day]);
      continue;
    }

    const { open, close } = dayHours;

    const key = `${formatTime(open)} - ${formatTime(close)}`;

    if (!groups[key]) groups[key] = [];
    groups[key].push(DAY_LABEL[day]);
  }

  return Object.entries(groups).map(([time, days]) =>
    days.length === 1
      ? `${days[0]}: ${time}`
      : `${days[0]} - ${days[days.length - 1]}: ${time}`,
  );
};

interface UseServiceProviderScreenProps {
  providerId: string;
  productLimit?: number;
}

export function useServiceProviderScreen({
  providerId,
  productLimit = 10,
}: UseServiceProviderScreenProps) {
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [serviceProvider, setServiceProvider] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // 🔹 Initial page load
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const [providerRes, listingRes] = await Promise.all([
          getServiceProviderById(providerId),
          getServicesByServiceProviderId(providerId),
        ]);

        if (!mounted) return;

        setServiceProvider(providerRes.data);
        setListings(listingRes.data);
      } catch (err: any) {
        setError(err?.message ?? "Something went wrong");
      } finally {
        mounted && setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [providerId]);

  // 🔹 Products
  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const res = await getProducts(productLimit);
        mounted && setProducts(res.data);
      } finally {
        mounted && setProductsLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, [productLimit]);

  // 🔹 Memoized business hours summary
  const businessHoursSummary = useMemo(() => {
    if (!serviceProvider?.businessHours) return [];
    return summarizeBusinessHours(serviceProvider.businessHours);
  }, [serviceProvider?.businessHours]);

  return {
    loading,
    productsLoading,
    error,
    serviceProvider,
    listings,
    products,
    businessHoursSummary,
  };
}

interface ProgressProps {
  step: number;
  total?: number;
}

export const ProgressBar = ({ step, total = 4 }: ProgressProps) => {
  return (
    <View className="flex flex-row items-center gap-[8px]">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className={`h-[4px] flex-1 rounded-full ${
            index < step ? "bg-[#F6339A]" : "bg-[#D1D5DC]"
          }`}
        />
      ))}
    </View>
  );
};

interface ServiceOptionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  extraText?: string;
  selected?: boolean;
  onPress?: () => void;
}
interface PaymentOptionCardProps {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  warning: string;
  selected?: boolean;
  onPress?: () => void;
  rules: string[];
}

export const ServiceOptionCard = ({
  icon,
  title,
  description,
  extraText,
  selected,
  onPress,
}: ServiceOptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-[14px] border-[1px] h-[82.4px] justify-center px-[12px]
        ${selected ? "border-[#F6339A] bg-[#FFF1F6]" : "border-[#E5E7EB]"}`}
    >
      <View className="flex flex-row gap-[12px] items-center">
        <View className="bg-[#FCE7F3] h-[48px] w-[48px] rounded-full items-center justify-center">
          {icon}
        </View>

        <View className="flex flex-col gap-[4px] flex-1">
          <Text
            className="text-[#101828] text-[16px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {title}
          </Text>

          <Text
            className="text-[#4A5565] text-[14px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {description}
          </Text>

          {extraText && (
            <Text
              className="text-[#F6339A] text-[14px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {extraText}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};
export const PaymentOptionCard = ({
  id,
  icon,
  title,
  description,
  selected,
  onPress,
  rules,
  warning,
}: PaymentOptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-[14px] border-[1px] py-[16px] justify-center px-[12px]
        ${selected ? "border-[#F6339A] bg-[#FFF1F6]" : "border-[#E5E7EB]"}`}
    >
      <View className="flex flex-col gap-[12px]">
        <View className="flex flex-row gap-[12px] items-center">
          <View
            className={` ${id === "later" ? "bg-[#FCE7F3]" : "bg-[#DCFCE7]"} h-[48px] w-[48px] rounded-full items-center justify-center`}
          >
            {icon}
          </View>

          <View className="flex flex-col gap-[4px] flex-1">
            <Text
              className="text-[#101828] text-[16px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {title}
            </Text>

            <Text
              className="text-[#4A5565] text-[14px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {description}
            </Text>
          </View>
        </View>
        <View className="px-4 flex flex-col gap-[8px]">
          {rules.map((rule, index) => (
            <Text
              className="text-[#4A5565] text-[16px]"
              style={{ fontFamily: "Manrope_400Regular" }}
              key={index}
            >
              {rule}
            </Text>
          ))}
        </View>
        <Text
          className="text-[#F54900] text-[16px]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {warning}
        </Text>
      </View>
    </Pressable>
  );
};
export const InfoCard = ({
  icon,
  title,
  rules,
}: {
  icon: ReactNode;
  title: string;
  rules: string[];
}) => {
  return (
    <View
      className={`rounded-[14px] py-[16px] justify-center px-[12px] bg-[#F9FAFB]
      `}
    >
      <View className="flex flex-col gap-[12px]">
        <View className="flex flex-row gap-[12px] items-center">
          {icon}

          <View className="flex flex-col gap-[4px] flex-1">
            <Text
              className="text-[#101828] text-[16px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {title}
            </Text>
          </View>
        </View>
        <View className="px-8 flex flex-col gap-[8px]">
          {rules.map((rule, index) => (
            <Text
              className="text-[#4A5565] text-[14px]"
              style={{ fontFamily: "Manrope_400Regular" }}
              key={index}
            >
              {rule}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

type CalendarPickerProps = {
  value: string | null;
  onSelect?: (date: string) => void;
  availableDates?: { date: string; isAvailable: boolean }[];
  loading?: boolean;
};

export const CalendarPicker = ({
  value,
  onSelect,
  availableDates,
  loading,
}: CalendarPickerProps) => {
  const availableSet = React.useMemo(() => {
    if (!availableDates) return null;
    return new Set(availableDates.filter((d) => d.isAvailable).map((d) => d.date));
  }, [availableDates]);

  const markedDates = React.useMemo(() => {
    const marks: Record<string, any> = {};
    if (availableDates) {
      for (const d of availableDates) {
        if (!d.isAvailable) {
          marks[d.date] = { disabled: true, disableTouchEvent: true };
        }
      }
    }
    if (value) {
      marks[value] = { selected: true, selectedColor: "#EC4899", disableTouchEvent: false };
    }
    return marks;
  }, [availableDates, value]);

  const onDayPress = (day: any) => {
    if (availableSet && !availableSet.has(day.dateString)) return;
    onSelect?.(day.dateString);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {loading && (
        <View style={{ padding: 8, alignItems: "center" }}>
          <ActivityIndicator size="small" color="#EC4899" />
          <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
            Loading availability…
          </Text>
        </View>
      )}
      <Calendar
        minDate={new Date().toISOString().split("T")[0]}
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          todayTextColor: "#EC4899",
          arrowColor: "#EC4899",
          selectedDayBackgroundColor: "#EC4899",
          disabledDayTextColor: "#D1D5DB",
          textDisabledColor: "#D1D5DB",
        }}
      />
      {availableDates && !loading && (
        <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 8, paddingTop: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#EC4899" }} />
            <Text style={{ fontSize: 11, color: "#6B7280" }}>Available</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#D1D5DB" }} />
            <Text style={{ fontSize: 11, color: "#6B7280" }}>Unavailable</Text>
          </View>
        </View>
      )}
    </View>
  );
};

function to12Hour(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

type TimeSlotGridProps = {
  value: string | null;
  onSelect?: (time: string) => void;
  slots?: string[];
  loading?: boolean;
};

export const TimeSlotGrid = ({
  value,
  onSelect,
  slots,
  loading,
}: TimeSlotGridProps) => {
  if (loading) {
    return (
      <View style={{ padding: 16, alignItems: "center" }}>
        <ActivityIndicator size="small" color="#EC4899" />
        <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 6 }}>
          Loading time slots…
        </Text>
      </View>
    );
  }

  if (slots && slots.length === 0) {
    return (
      <View style={{ padding: 16, alignItems: "center" }}>
        <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
          No available times on this day.
        </Text>
      </View>
    );
  }

  const displaySlots = slots ?? [];

  return (
    <View>
      <Text style={styles.label}>Available Time</Text>
      <View style={styles.grid}>
        {displaySlots.map((time24) => {
          const display = to12Hour(time24);
          const isSelected = value === time24;
          return (
            <TouchableOpacity
              key={time24}
              style={[styles.slot, isSelected && styles.selected]}
              onPress={() => onSelect?.(time24)}
            >
              <Text style={[styles.slotText, isSelected && styles.selectedText]}>
                {display}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const InfoRowText = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon: ReactNode;
}) => {
  return (
    <View className="flex flex-row gap-[12px] items-center">
      {icon}
      <View>
        <Text
          className="text-[#6A7282] text-[14px]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {label}
        </Text>
        <Text
          className="text-[#101828] text-[16px]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {value || "-"}
        </Text>
      </View>
    </View>
  );
};
export function getPercentage(value: number, percent: number): number {
  return (value * percent) / 100;
}

type ToggleButtonProps = {
  errorMessage?: string;
  value: boolean; // current state
  onToggle: (newValue: boolean) => void; // callback when toggled
  trueLabel?: string; // optional label for true
  falseLabel?: string; // optional label for false
  size?: "small" | "medium" | "large"; // optional size
};

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  value,
  onToggle,
  errorMessage,
  trueLabel = "On",
  falseLabel = "Off",
  size = "medium",
}) => {
  const height = size === "small" ? 30 : size === "large" ? 50 : 40;
  const width = height * 2;

  return (
    <View>
      <Pressable
        onPress={() => onToggle(!value)}
        style={[
          styles.containerx,
          { width, height, borderRadius: height / 2 },
          value ? styles.activeBg : styles.inactiveBg,
        ]}
      >
        <View
          style={[
            styles.slider,
            {
              width: height - 4,
              height: height - 4,
              borderRadius: (height - 4) / 2,
              transform: [{ translateX: value ? width / 2 : 0 }],
            },
          ]}
        />
        <Text style={[styles.labelx, { left: 8 }]}>{falseLabel}</Text>
        <Text style={[styles.labely, { right: 8 }]}>{trueLabel}</Text>
      </Pressable>

      <Text className="font-600 text-[10px] leading-[10px] text-[#FF0000] mt-1">
        {errorMessage}
      </Text>
    </View>
  );
};
export const getUserToken = async (): Promise<string | null> => {
  try {
    const customerDataString = await AsyncStorage.getItem("customerData");
    if (customerDataString) {
      const customerData = JSON.parse(customerDataString);
      return customerData.accessToken ?? null;
    }
    return null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

type JwtPayload = {
  exp: number;
};

export const isTokenExpired = async (): Promise<boolean> => {
  const token = await getUserToken();

  if (!token) return true;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    console.error("Invalid token:", error);
    return true;
  }
};

type CategoryOption = {
  label: string;
  value: string;
};

type CategorySelectorProps = {
  errorMessage?: string;
  label: string;
  options: CategoryOption[];
  value: string[]; // selected IDs
  onChange: (selected: string[]) => void;
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  label,
  errorMessage,
  options,
  value,
  onChange,
}) => {
  const toggleCategory = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <View className="flex flex-col gap-[8px]">
      <Text
        className="text-[16px] leading-[25px] text-[#364153]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {label}
      </Text>
      <View style={{ gap: 12 }}>
        {/* Selected categories */}
        {selectedOptions.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: "row", gap: 8 }}
          >
            {selectedOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.selectedPill}
                onPress={() => toggleCategory(option.value)}
              >
                <Text style={styles.selectedTextx}>{option.label} ✕</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* All categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexDirection: "row", gap: 6 }}
        >
          <View style={styles.allCategories}>
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => toggleCategory(option.value)}
                  style={[
                    styles.categoryPill,
                    isSelected && styles.categoryPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <Text className="font-600 text-[10px] leading-[10px] text-[#FF0000] mt-1">
        {errorMessage}
      </Text>
    </View>
  );
};

type StatusType = "success" | "error";

interface StatusModalProps {
  visible: boolean;
  type: StatusType;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  type,
  title,
  message,
  buttonText = "Close",
  onClose,
}) => {
  const isError = type === "error";

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.containerxt}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isError ? "#FFE5E5" : "#E6F9EE" },
            ]}
          >
            <Ionicons
              name={isError ? "close-circle" : "checkmark-circle"}
              size={40}
              color={isError ? "#E53935" : "#2E7D32"}
            />
          </View>

          {title && <Text style={styles.title}>{title}</Text>}

          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isError ? "#E53935" : "#2E7D32" },
            ]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

type DistanceSliderProps = {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
};

export function DistanceSlider({
  label = "Maximum distance",
  value,
  min = 1,
  max = 50,
  step = 1,
  unit = "km",
  onChange,
}: DistanceSliderProps) {
  return (
    <View style={{ gap: 8 }}>
      {/* Header row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: "#444" }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: "600" }}>
          {value} {unit}
        </Text>
      </View>

      {/* Slider */}
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        minimumTrackTintColor="#ff4fa3" // pink like your UI
        maximumTrackTintColor="#e5e5e5"
        thumbTintColor="#ff4fa3"
      />
    </View>
  );
}
type FilterCheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function FilterCheckbox({
  label,
  checked,
  onChange,
}: FilterCheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      className="flex-row items-center justify-between py-3"
    >
      {/* Label */}
      <Text
        className="text-[14px] text-[#4A5565]"
        style={{ fontFamily: "Manrope_600SemiBold" }}
      >
        {label}
      </Text>

      {/* Checkbox */}
      <View
        className={`w-5 h-5 rounded-[4px] border flex items-center justify-center
        ${checked ? "bg-[#FF4FA3] border-[#FF4FA3]" : "border-[#CBD5E1]"}`}
      >
        {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
    </Pressable>
  );
}

type TabKey = "upcoming" | "canceled" | "completed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "canceled", label: "Canceled" },
  { key: "completed", label: "Completed" },
];

type BookingsProps = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
};

export function BookingsFilterSection({
  activeTab,
  onChangeTab,
}: BookingsProps) {
  return (
    <View className="">
      {/* Segmented tabs container */}
      <View className="bg-[#FFF1F9] border-[#FFD2EE] border-[1px] rounded-[4px] p-[2.13px] flex flex-row">
        {TABS.map((t) => {
          const isActive = activeTab === t.key;

          return (
            <Pressable
              key={t.key}
              onPress={() => onChangeTab(t.key)}
              className={`flex-1 rounded-[4px] py-[10px] items-center justify-center ${
                isActive ? "bg-[#F76FC1]" : "bg-transparent"
              }`}
              android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            >
              <Text
                className={`text-[13px] ${
                  isActive ? "text-white" : "text-[#667085]"
                }`}
                style={{ fontFamily: "Manrope_600SemiBold" }}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function formatShortDate(isoString: string): string {
  const date = new Date(isoString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
export const formatAppointmentDate = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};
type AppModalProps = {
  visible: boolean;
  onClose: () => void;

  title?: string;

  /** Replace the entire body with anything */
  children?: React.ReactNode;

  /** Optional footer slot (buttons, etc.) */
  footer?: React.ReactNode;

  /** Tap backdrop to close */
  closeOnBackdropPress?: boolean;

  /** Width of the card on large screens */
  maxWidth?: number;
};

export function AppModal({
  visible,
  onClose,
  title = "",
  children,
  footer,
  closeOnBackdropPress = true,
  maxWidth = 380,
}: AppModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === "ios" ? "slide" : "fade"}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeOnBackdropPress ? onClose : undefined}
        />

        <View style={[styles.card, { maxWidth }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titlexc}>{title}</Text>

            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color="#667085" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Body */}
          <View style={styles.body}>{children}</View>

          {/* Footer */}
          {footer ? (
            <>
              <View style={styles.divider} />
              <View style={styles.footer}>{footer}</View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

type ContactCustomerModalProps = {
  visible: boolean;
  onClose: () => void;

  name: string;
  service: string;
  phone: string;
  appointment: string;
  amount: string;
  avatarUrl?: string;
  title?: string;

  onOpenChat: () => void;
  onCall: () => void;
};

export function ContactCustomerModal({
  visible,
  onClose,
  name,
  service,
  phone,
  appointment,
  amount,
  avatarUrl,
  onOpenChat,
  onCall,
  title = "Contact Customer",
}: ContactCustomerModalProps) {
  function Row({ label, value }: { label: string; value: string }) {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    );
  }

  function Divider() {
    return <View style={{ height: 1, backgroundColor: "#EAECF0" }} />;
  }
  return (
    <AppModal visible={visible} onClose={onClose} title={title}>
      {/* Profile Row */}
      <View style={styles.profileRow}>
        <Image
          source={{
            uri:
              avatarUrl ??
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.sub}>{service}</Text>
        </View>
      </View>

      {/* Info / Warning */}
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Important:</Text>
        <Text style={styles.noticeText}>
          All communications must be done through the platform chat for evidence
          and protection. This ensures transaction safety for both parties.
        </Text>
      </View>

      {/* Buttons */}
      <Pressable style={styles.primaryBtn} onPress={onOpenChat}>
        <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
        <Text style={styles.primaryText}>
          Open Chat with {name.split(" ")[0]}
        </Text>
      </Pressable>

      <Pressable style={styles.outlineBtn} onPress={onCall}>
        <Ionicons name="call-outline" size={18} color="#344054" />
        <Text style={styles.outlineText}>Call {phone}</Text>
      </Pressable>

      {/* Details */}
      <View style={styles.detailsCard}>
        <Row label="Appointment" value={appointment} />
        <Divider />
        <Row label="Service" value={service} />
        <Divider />
        <Row label="Amount" value={amount} />
      </View>
    </AppModal>
  );
}

type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

type WithdrawFundsModalProps = {
  visible: boolean;
  onClose: () => void;

  availableBalance: number;
  accounts: BankAccount[];

  onAddNewBank?: () => void;

  onConfirmWithdrawal?: (payload: {
    amount: number;
    account: BankAccount;
  }) => void;
};

type Step = "withdraw" | "confirm";

export function WithdrawFundsModal({
  visible,
  onClose,
  availableBalance,
  accounts,
  onAddNewBank,
  onConfirmWithdrawal,
}: WithdrawFundsModalProps) {
  const [step, setStep] = useState<Step>("withdraw");
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts?.[0]?.id ?? "",
  );
  const [amount, setAmount] = useState<string>("");
  const [activePercent, setActivePercent] = useState<number | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );

  const amountValue = useMemo(() => {
    const n = Number(String(amount).replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const canContinue =
    amountValue > 0 &&
    amountValue <= availableBalance &&
    Boolean(selectedAccount);

  const reset = () => {
    setStep("withdraw");
    // optionally keep selections
    // setAmount("");
    // setSelectedAccountId(accounts?.[0]?.id ?? "");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // const setPercent = (p: number) => {
  //   const val = Math.floor((availableBalance * p) / 100);
  //   setAmount(String(val));
  // };
  const setPercent = (p: number) => {
    const val = Math.floor((availableBalance * p) / 100);
    setAmount(String(val));
    setActivePercent(p);
  };

  const title = step === "withdraw" ? "Withdraw Funds" : "Confirm Withdrawal";
  function InfoRow({ label, value }: { label: string; value: string }) {
    return (
      <View className="flex flex-row items-center justify-between">
        <Text
          className="text-[12px] text-[#667085]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {label}
        </Text>
        <Text
          className="text-[12px] text-[#101828]"
          style={{ fontFamily: "Manrope_700Bold" }}
        >
          {value}
        </Text>
      </View>
    );
  }

  function Divider() {
    return <View className="h-[1px] bg-[#EAECF0]" />;
  }
  function PercentChip({
    label,
    onPress,
    active,
  }: {
    label: string;
    onPress: () => void;
    active?: boolean;
  }) {
    return (
      <Pressable
        onPress={onPress}
        className={`h-[30px] px-[12px] rounded-[10px] border items-center justify-center ${
          active
            ? "bg-[#FCE7F3] border-[#FBCFE8]"
            : "bg-[#F2F4F7] border-[#EAECF0]"
        }`}
      >
        <Text
          className={`${active ? "text-[#E60076]" : "text-[#667085]"} text-[12px]`}
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }
  const inputId = "withdrawAmount";
  return (
    <AppModal visible={visible} onClose={handleClose} title={title}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === "withdraw" ? (
              <View className="gap-[14px]">
                {/* Available Balance */}
                <View className="bg-[#F9FAFB] border border-[#EAECF0] rounded-[12px] px-[12px] py-[10px]">
                  <Text
                    className="text-[12px] text-[#667085]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Available Balance
                  </Text>
                  <Text
                    className="text-[14px] text-[#101828]"
                    style={{ fontFamily: "Manrope_700Bold" }}
                  >
                    ₦{availableBalance.toLocaleString()}
                  </Text>
                </View>

                {/* Withdrawal Amount */}
                <View className="gap-[8px]">
                  <Text
                    className="text-[12px] text-[#667085]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Withdrawal Amount
                  </Text>

                  <View className="flex flex-row items-center bg-[#FFFFFF] border border-[#D0D5DD] rounded-[12px] px-[12px] h-[44px]">
                    <Text
                      className="text-[14px] text-[#667085]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      ₦
                    </Text>
                    <TextInput
                      returnKeyType="done"
                      inputAccessoryViewID={
                        Platform.OS === "ios" ? inputId : undefined
                      }
                      value={amount}
                      onChangeText={(val) =>
                        setAmount(val.replace(/[^0-9]/g, ""))
                      }
                      keyboardType="number-pad"
                      placeholder="450000"
                      placeholderTextColor="#98A2B3"
                      className="flex-1 text-[14px] text-[#101828] ml-[8px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    />

                    {Platform.OS === "ios" ? (
                      <InputAccessoryView nativeID={inputId}>
                        <View
                          style={{
                            alignItems: "flex-end",
                            padding: 8,
                            backgroundColor: "#F2F4F7",
                          }}
                        >
                          <Button
                            title="Done"
                            onPress={() => Keyboard.dismiss()}
                          />
                        </View>
                      </InputAccessoryView>
                    ) : null}
                  </View>
                  <View className="flex flex-row gap-[8px]">
                    <PercentChip
                      label="25%"
                      active={activePercent === 25}
                      onPress={() => setPercent(25)}
                    />
                    <PercentChip
                      label="50%"
                      active={activePercent === 50}
                      onPress={() => setPercent(50)}
                    />
                    <PercentChip
                      label="75%"
                      active={activePercent === 75}
                      onPress={() => setPercent(75)}
                    />
                    <PercentChip
                      label="All"
                      active={activePercent === 100}
                      onPress={() => setPercent(100)}
                    />
                  </View>

                  {amountValue > availableBalance ? (
                    <Text
                      className="text-[12px] text-[#B42318]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Amount cannot exceed available balance.
                    </Text>
                  ) : null}
                </View>

                {/* Select Bank Account */}
                <View className="gap-[8px]">
                  <Text
                    className="text-[12px] text-[#667085]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Select Bank Account
                  </Text>

                  <View className="gap-[10px]">
                    {accounts.map((acc) => {
                      const isSelected = acc.id === selectedAccountId;

                      return (
                        <Pressable
                          key={acc.id}
                          onPress={() => setSelectedAccountId(acc.id)}
                          className={`rounded-[12px] px-[12px] py-[12px] border ${
                            isSelected
                              ? "border-[#F6339A] bg-[#FFF1F8]"
                              : "border-[#EAECF0] bg-[#FFFFFF]"
                          }`}
                        >
                          <View className="flex flex-row items-start justify-between">
                            <View className="gap-[4px]">
                              <Text
                                className="text-[14px] text-[#101828]"
                                style={{ fontFamily: "Manrope_700Bold" }}
                              >
                                {acc.bankName}
                              </Text>
                              <Text
                                className="text-[12px] text-[#667085]"
                                style={{ fontFamily: "Manrope_400Regular" }}
                              >
                                {acc.accountNumber}
                              </Text>
                              <Text
                                className="text-[12px] text-[#667085]"
                                style={{ fontFamily: "Manrope_400Regular" }}
                              >
                                {acc.accountName}
                              </Text>
                            </View>

                            <View
                              className={`h-[18px] w-[18px] rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-[#F6339A]"
                                  : "border-[#D0D5DD]"
                              }`}
                            >
                              {isSelected ? (
                                <View className="h-[10px] w-[10px] rounded-full bg-[#F6339A]" />
                              ) : null}
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Pressable
                    onPress={onAddNewBank}
                    className="h-[44px] rounded-[12px] border border-[#EAECF0] bg-[#FFFFFF] flex flex-row items-center justify-center gap-[8px]"
                  >
                    <Ionicons name="add" size={18} color="#667085" />
                    <Text
                      className="text-[13px] text-[#667085]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Add New Bank Account
                    </Text>
                  </Pressable>
                </View>

                {/* Actions */}
                <View className="flex flex-row gap-[12px] mt-[6px]">
                  <Pressable
                    onPress={handleClose}
                    className="flex-1 h-[44px] rounded-[12px] border border-[#D0D5DD] bg-[#FFFFFF] items-center justify-center"
                  >
                    <Text
                      className="text-[13px] text-[#344054]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setStep("confirm")}
                    disabled={!canContinue}
                    className={`flex-1 h-[44px] rounded-[12px] items-center justify-center ${
                      canContinue ? "bg-[#F6339A]" : "bg-[#FAD1E8]"
                    }`}
                  >
                    <Text
                      className="text-[13px] text-[#FFFFFF]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Continue
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="gap-[14px]">
                {/* Summary Card */}
                <View className="border border-[#EAECF0] bg-[#FFFFFF] rounded-[14px] p-[14px] gap-[12px]">
                  <View className="items-center gap-[8px] py-[6px]">
                    <View className="h-[44px] w-[44px] rounded-full bg-[#FCE7F3] items-center justify-center">
                      <Ionicons name="cash-outline" size={20} color="#E60076" />
                    </View>

                    <Text
                      className="text-[16px] text-[#101828]"
                      style={{ fontFamily: "Manrope_700Bold" }}
                    >
                      ₦{amountValue.toLocaleString()}
                    </Text>
                  </View>

                  <InfoRow
                    label="Bank"
                    value={selectedAccount?.bankName ?? "-"}
                  />
                  <Divider />
                  <InfoRow
                    label="Account Number"
                    value={selectedAccount?.accountNumber ?? "-"}
                  />
                  <Divider />
                  <InfoRow
                    label="Account Name"
                    value={selectedAccount?.accountName ?? "-"}
                  />
                  <Divider />
                  <InfoRow label="Processing Time" value="1-3 business days" />
                </View>

                {/* Warning */}
                <View className="bg-[#FDF2F8] border border-[#FBCFE8] rounded-[12px] p-[12px]">
                  <Text
                    className="text-[12px] text-[#C11574]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Please ensure your bank details are correct. Withdrawals
                    cannot be reversed once processed.
                  </Text>
                </View>

                {/* Actions */}
                <View className="flex flex-row gap-[12px]">
                  <Pressable
                    onPress={() => setStep("withdraw")}
                    className="flex-1 h-[44px] rounded-[12px] border border-[#D0D5DD] bg-[#FFFFFF] items-center justify-center"
                  >
                    <Text
                      className="text-[13px] text-[#344054]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Back
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      if (!selectedAccount) return;
                      onConfirmWithdrawal?.({
                        amount: amountValue,
                        account: selectedAccount,
                      });
                      handleClose();
                    }}
                    className="flex-1 h-[44px] rounded-[12px] bg-[#F6339A] items-center justify-center"
                  >
                    <Text
                      className="text-[13px] text-[#FFFFFF]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Confirm Withdrawal
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AppModal>
  );
}

type TransactionType = "payment" | "fee" | "withdrawal" | "refund";

type Transaction = {
  id: string;
  type: TransactionType;
  title: string;
  subtitle: string;
  date: string;
  amount: number;
};

type Tab = "all" | "earnings" | "debits" | "withdrawals";

type Propsvb = {
  transactions: Transaction[];
};

export function TransactionHistoryBody({ transactions }: Propsvb) {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filtered = transactions.filter((tx) => {
    if (activeTab === "all") return true;
    if (activeTab === "earnings") return tx.amount > 0;
    if (activeTab === "withdrawals") return tx.type === "withdrawal";
    if (activeTab === "debits") return tx.amount < 0;
    return true;
  });
  function TransactionRow({ tx }: { tx: Transaction }) {
    const isCredit = tx.amount > 0;

    const iconConfig = {
      payment: {
        bg: "#ECFDF3",
        icon: "arrow-up-outline",
        color: "#12B76A",
      },
      fee: {
        bg: "#FEE4E2",
        icon: "remove-outline",
        color: "#F04438",
      },
      withdrawal: {
        bg: "#EFF8FF",
        icon: "arrow-down-outline",
        color: "#2E90FA",
      },
      refund: {
        bg: "#FEE4E2",
        icon: "remove-outline",
        color: "#F04438",
      },
    }[tx.type];

    return (
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row gap-[10px] items-center">
          <View
            className="h-[32px] w-[32px] rounded-full items-center justify-center"
            style={{ backgroundColor: iconConfig.bg }}
          >
            <Ionicons
              name={iconConfig.icon as any}
              size={16}
              color={iconConfig.color}
            />
          </View>

          <View className="gap-[2px]">
            <Text
              className="text-[13px] text-[#101828]"
              style={{ fontFamily: "Manrope_500Medium" }}
            >
              {tx.title}
            </Text>
            <Text
              className="text-[12px] text-[#667085]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {tx.subtitle}
            </Text>
            <Text
              className="text-[11px] text-[#98A2B3]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {tx.date}
            </Text>
          </View>
        </View>

        <Text
          className={`text-[13px] ${
            isCredit ? "text-[#12B76A]" : "text-[#F04438]"
          }`}
          style={{ fontFamily: "Manrope_600SemiBold" }}
        >
          {isCredit ? "+" : "-"}₦{Math.abs(tx.amount).toLocaleString()}
        </Text>
      </View>
    );
  }
  function TabChip({
    label,
    active,
    onPress,
  }: {
    label: string;
    active?: boolean;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        className={`h-[32px] px-[12px] rounded-[10px] border items-center justify-center ${
          active
            ? "bg-[#FCE7F3] border-[#FBCFE8]"
            : "bg-[#F2F4F7] border-[#EAECF0]"
        }`}
      >
        <Text
          className={`text-[12px] ${
            active ? "text-[#E60076]" : "text-[#667085]"
          }`}
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="gap-[12px]">
      {/* Tabs */}
      <View className="flex flex-row gap-[8px]">
        <TabChip
          label="All"
          active={activeTab === "all"}
          onPress={() => setActiveTab("all")}
        />
        <TabChip
          label="Earnings"
          active={activeTab === "earnings"}
          onPress={() => setActiveTab("earnings")}
        />
        <TabChip
          label="Debits"
          active={activeTab === "debits"}
          onPress={() => setActiveTab("debits")}
        />
        <TabChip
          label="Withdrawals"
          active={activeTab === "withdrawals"}
          onPress={() => setActiveTab("withdrawals")}
        />
      </View>

      {/* List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-[12px] pb-[8px]">
          {filtered.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}

          {filtered.length === 0 && (
            <Text
              className="text-[13px] text-[#667085] text-center mt-[12px]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              No transactions found
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

type StatRow = {
  label: string;
  value: string;
  /**
   * Optional change indicator under value e.g "+15.2%"
   * You control formatting (include + / - yourself)
   */
  changeText?: string;
  /**
   * Change color: "up" (pink) | "down" (green) | "muted"
   * Match your figma: they used pink for increases.
   */
  changeTone?: "up" | "down" | "muted";
  /**
   * Show star icon after value (for rating)
   */
  showStar?: boolean;
};

type DetailedStatsBodyProps = {
  thisWeek: StatRow[];
  thisMonth: StatRow[];
  allTime: StatRow[];

  /** optional: make all-time rows pink like figma */
  allTimeTint?: boolean;
};

export function DetailedStatsBody({
  thisWeek,
  thisMonth,
  allTime,
  allTimeTint = true,
}: DetailedStatsBodyProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-[14px] pb-[8px]">
        <Section title="This Week" rows={thisWeek} />
        <Section title="This Month" rows={thisMonth} />
        <Section title="All Time" rows={allTime} tinted={allTimeTint} />
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  rows,
  tinted,
}: {
  title: string;
  rows: StatRow[];
  tinted?: boolean;
}) {
  return (
    <View className="gap-[8px]">
      <Text
        className="text-[12px] text-[#667085]"
        style={{ fontFamily: "Manrope_600SemiBold" }}
      >
        {title}
      </Text>

      <View className="gap-[10px]">
        {rows.map((row, idx) => (
          <StatItem key={`${row.label}-${idx}`} row={row} tinted={tinted} />
        ))}
      </View>
    </View>
  );
}

function StatItem({ row, tinted }: { row: StatRow; tinted?: boolean }) {
  const changeColor =
    row.changeTone === "down"
      ? "#12B76A"
      : row.changeTone === "muted"
        ? "#98A2B3"
        : "#E60076"; // "up" default (pink)

  return (
    <View
      className={`rounded-[12px] border border-[#EAECF0] px-[12px] py-[12px] ${
        tinted ? "bg-[#FFF1F8]" : "bg-[#FFFFFF]"
      }`}
    >
      <View className="flex flex-row items-start justify-between">
        <Text
          className="text-[12px] text-[#667085]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {row.label}
        </Text>

        <View className="items-end">
          <View className="flex flex-row items-center gap-[4px]">
            <Text
              className="text-[12px] text-[#101828]"
              style={{ fontFamily: "Manrope_700Bold" }}
            >
              {row.value}
            </Text>

            {row.showStar ? (
              <Ionicons name="star" size={12} color="#FDB022" />
            ) : null}
          </View>

          {row.changeText ? (
            <Text
              className="text-[11px]"
              style={{ fontFamily: "Manrope_400Regular", color: changeColor }}
            >
              {row.changeText}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

type ReportKey = "revenue" | "booking" | "customer" | "performance" | "tax";

type ReportItem = {
  key: ReportKey;
  title: string;
  subtitle: string;
};

type Propsy = {
  reports?: ReportItem[];

  onSelectReport?: (key: ReportKey) => void;

  // Custom date range actions
  onGenerateCustomReport?: (range: { from: string; to: string }) => void;

  // If you want to control values from parent, you can pass these:
  initialFrom?: string;
  initialTo?: string;
};

const DEFAULT_REPORTS: ReportItem[] = [
  { key: "revenue", title: "Revenue Report", subtitle: "Last 30 days" },
  { key: "booking", title: "Booking Report", subtitle: "All bookings" },
  { key: "customer", title: "Customer Report", subtitle: "Customer data" },
  {
    key: "performance",
    title: "Performance Report",
    subtitle: "Stats & analytics",
  },
  { key: "tax", title: "Tax Report", subtitle: "For tax purposes" },
];

export function DownloadReportsBody({
  reports,
  onSelectReport,
  onGenerateCustomReport,
  initialFrom = "",
  initialTo = "",
}: Propsy) {
  const list = useMemo(() => reports ?? DEFAULT_REPORTS, [reports]);

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  const canGenerate = Boolean(from.trim()) && Boolean(to.trim());

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="gap-[12px]">
        <Text
          className="text-[12px] text-[#667085]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          Select the type of report you’d like to download
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-[12px] pb-[10px]">
            {/* Report list */}
            <View className="gap-[10px]">
              {list.map((item) => (
                <ReportRow
                  key={item.key}
                  title={item.title}
                  subtitle={item.subtitle}
                  onPress={() => onSelectReport?.(item.key)}
                />
              ))}
            </View>

            {/* Custom Date Range Card */}
            <View className="mt-[8px] bg-[#F9FAFB] border border-[#EAECF0] rounded-[14px] p-[12px] gap-[10px]">
              <Text
                className="text-[12px] text-[#101828]"
                style={{ fontFamily: "Manrope_600SemiBold" }}
              >
                Custom Date Range
              </Text>

              <View className="gap-[6px]">
                <Text
                  className="text-[12px] text-[#667085]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  From
                </Text>
                <TextInput
                  value={from}
                  onChangeText={setFrom}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#98A2B3"
                  className="h-[44px] px-[12px] rounded-[12px] bg-[#FFFFFF] border border-[#EAECF0] text-[14px] text-[#101828]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                  returnKeyType="next"
                />
              </View>

              <View className="gap-[6px]">
                <Text
                  className="text-[12px] text-[#667085]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  To
                </Text>
                <TextInput
                  value={to}
                  onChangeText={setTo}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#98A2B3"
                  className="h-[44px] px-[12px] rounded-[12px] bg-[#FFFFFF] border border-[#EAECF0] text-[14px] text-[#101828]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              <Pressable
                onPress={() => onGenerateCustomReport?.({ from, to })}
                disabled={!canGenerate}
                className={`h-[44px] rounded-[12px] items-center justify-center ${
                  canGenerate ? "bg-[#F6339A]" : "bg-[#FAD1E8]"
                }`}
              >
                <Text
                  className="text-[13px] text-[#FFFFFF]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  Generate Custom Report
                </Text>
              </Pressable>

              {!canGenerate ? (
                <Text
                  className="text-[11px] text-[#98A2B3]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  Enter both dates to generate a report.
                </Text>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

function ReportRow({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-[#FFFFFF] border border-[#EAECF0] rounded-[14px] px-[12px] py-[12px]"
    >
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-[10px]">
          <View className="h-[32px] w-[32px] rounded-[10px] bg-[#F2F4F7] items-center justify-center">
            <Ionicons name="download-outline" size={16} color="#667085" />
          </View>

          <View className="gap-[2px]">
            <Text
              className="text-[13px] text-[#101828]"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              {title}
            </Text>
            <Text
              className="text-[12px] text-[#667085]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {subtitle}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
      </View>
    </Pressable>
  );
}

type Option = { name: string; code: string };

type SearchableSelectProps = {
  label?: string;
  placeholder?: string;
  value?: string; // selected value
  options: Option[];
  onChange: (value: string) => void;

  /** Optional: show error text */
  error?: string;

  /** Optional: render label/value formatting */
  getLabel?: (value: string) => string;
};

export function SearchableSelect({
  label,
  placeholder = "Select",
  value,
  options,
  onChange,
  error,
  getLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selectedLabel = useMemo(() => {
    if (!value) return "";
    if (getLabel) return getLabel(value);
    return options.find((o) => o.code === value)?.name ?? "";
  }, [value, options, getLabel]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return options;
    return options.filter((o) => o.name.toLowerCase().includes(query));
  }, [q, options]);

  return (
    <View className="gap-[6px]">
      {label ? (
        <Text
          className="text-[12px] text-[#667085]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => setOpen(true)}
        className={`h-[44px] rounded-[12px] px-[12px] border flex flex-row items-center justify-between ${
          error ? "border-[#FDA29B]" : "border-[#D0D5DD]"
        } bg-[#FFFFFF]`}
      >
        <Text
          className={`text-[14px] ${value ? "text-[#101828]" : "text-[#98A2B3]"}`}
          style={{ fontFamily: "Manrope_400Regular" }}
          numberOfLines={1}
        >
          {value ? selectedLabel : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#667085" />
      </Pressable>

      {error ? (
        <Text
          className="text-[12px] text-[#B42318]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {error}
        </Text>
      ) : null}

      {/* Picker Modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 bg-[rgba(16,24,40,0.45)] justify-center px-4">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View className="bg-[#FFFFFF] rounded-[16px] overflow-hidden">
              {/* Header */}
              <View className="px-4 py-3 flex flex-row items-center justify-between border-b border-[#EAECF0]">
                <Text
                  className="text-[14px] text-[#101828]"
                  style={{ fontFamily: "Manrope_700Bold" }}
                >
                  Select bank
                </Text>
                <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                  <Ionicons name="close" size={20} color="#667085" />
                </Pressable>
              </View>

              {/* Search */}
              <View className="p-4 gap-[8px]">
                <View className="h-[44px] rounded-[12px] border border-[#D0D5DD] px-[12px] flex flex-row items-center gap-[8px]">
                  <Ionicons name="search" size={18} color="#667085" />
                  <TextInput
                    value={q}
                    onChangeText={setQ}
                    placeholder="Search bank name"
                    placeholderTextColor="#98A2B3"
                    className="flex-1 text-[14px] text-[#101828]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                    autoFocus
                  />
                </View>

                {/* List */}
                <View className="max-h-[320px]">
                  <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.code}
                    keyboardShouldPersistTaps="handled"
                    ItemSeparatorComponent={() => (
                      <View className="h-[1px] bg-[#EAECF0]" />
                    )}
                    renderItem={({ item }) => {
                      const active = item.code === value;
                      return (
                        <Pressable
                          onPress={() => {
                            onChange(item.code);
                            setOpen(false);
                            setQ("");
                          }}
                          className="py-[12px] flex flex-row items-center justify-between"
                        >
                          <Text
                            className="text-[14px] text-[#101828]"
                            style={{ fontFamily: "Manrope_400Regular" }}
                          >
                            {item.name}
                          </Text>

                          {active ? (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color="#E60076"
                            />
                          ) : null}
                        </Pressable>
                      );
                    }}
                    ListEmptyComponent={() => (
                      <Text
                        className="text-[13px] text-[#667085] py-4 text-center"
                        style={{ fontFamily: "Manrope_400Regular" }}
                      >
                        No results
                      </Text>
                    )}
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

type BankOption = { name: string; code: string };

type Propser = {
  banks: BankOption[]; // large list
  onCancel: () => void;
  onSubmit: (payload: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    isDefault: boolean;
  }) => void;

  // optional: if you want to auto-resolve account name from API when accountNumber hits 10 digits
  onResolveAccountName?: (args: {
    bankCode: string;
    accountNumber: string;
  }) => Promise<string>;
};

export function AddBankAccountBody({
  banks,
  onCancel,
  onSubmit,
  onResolveAccountName,
}: Propser) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [resolving, setResolving] = useState(false);
  const selectedBank = banks.find((b) => b.code === bankCode);
  const bankName = selectedBank?.name || "";

  const accError =
    accountNumber.length === 0
      ? "Enter account number"
      : accountNumber.length !== 10
        ? "Account number must be 10 digits"
        : "";

  const canSubmit =
    bankCode &&
    accountNumber.length === 10 &&
    accountName.trim().length > 2 &&
    !resolving;

  const tryResolve = async (nextAccNumber: string, nextBankCode: string) => {
    if (!onResolveAccountName) return;
    if (!nextBankCode) return;
    if (nextAccNumber.length !== 10) return;

    try {
      setResolving(true);
      const name = await onResolveAccountName({
        bankCode: nextBankCode,
        accountNumber: nextAccNumber,
      });
      setAccountName(name || "");
    } finally {
      setResolving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="gap-[12px]">
        <ToggleButton
          value={isEnabled}
          onToggle={setIsEnabled}
          trueLabel="Yes"
          falseLabel="No"
          size="medium"
        />
        {/* Bank Name */}
        <SearchableSelect
          label="Bank Name"
          placeholder="Select your bank"
          value={bankCode}
          options={banks}
          onChange={(v) => {
            setBankCode(v);
            // if account number already complete, resolve
            void tryResolve(accountNumber, v);
          }}
          error={bankCode ? "" : undefined}
          getLabel={(val) => banks.find((b) => b.code === val)?.name ?? val}
        />

        {/* Account Number */}
        <View className="gap-[6px]">
          <Text
            className="text-[12px] text-[#667085]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            Account Number
          </Text>

          <TextInput
            value={accountNumber}
            onChangeText={(v) => {
              const cleaned = v.replace(/[^0-9]/g, "").slice(0, 10);
              setAccountNumber(cleaned);
              if (cleaned.length < 10) setAccountName("");
              void tryResolve(cleaned, bankCode);
            }}
            keyboardType="number-pad"
            placeholder="0123456789"
            placeholderTextColor="#98A2B3"
            className={`h-[44px] rounded-[12px] px-[12px] border bg-[#FFFFFF] text-[14px] text-[#101828] ${
              accError ? "border-[#FDA29B]" : "border-[#D0D5DD]"
            }`}
            style={{ fontFamily: "Manrope_400Regular" }}
          />

          <Text
            className="text-[12px] text-[#667085]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            Enter your 10-digit account number
          </Text>

          {accError ? (
            <Text
              className="text-[12px] text-[#B42318]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {accError}
            </Text>
          ) : null}
        </View>

        {/* Account Name */}
        <View className="gap-[6px]">
          <Text
            className="text-[12px] text-[#667085]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            Account Name
          </Text>

          <TextInput
            value={accountName}
            onChangeText={setAccountName}
            placeholder="Full name on account"
            placeholderTextColor="#98A2B3"
            className="h-[44px] rounded-[12px] px-[12px] border border-[#D0D5DD] bg-[#FFFFFF] text-[14px] text-[#101828]"
            style={{ fontFamily: "Manrope_400Regular" }}
            editable={!resolving} // if you're resolving from API, keep it locked while loading
          />

          {resolving ? (
            <Text
              className="text-[12px] text-[#667085]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Resolving account name...
            </Text>
          ) : null}
        </View>

        {/* Warning box */}
        <View className="bg-[#FDF2F8] border border-[#FBCFE8] rounded-[12px] p-[12px]">
          <Text
            className="text-[12px] text-[#C11574]"
            style={{ fontFamily: "Manrope_400Regular", lineHeight: 16 }}
          >
            Please ensure your account details are correct. Withdrawals will be
            sent to this account.
          </Text>
        </View>

        {/* Bottom buttons */}
        <View className="flex flex-row gap-[12px] mt-[4px]">
          <Pressable
            onPress={onCancel}
            className="flex-1 h-[44px] rounded-[12px] border border-[#D0D5DD] bg-[#FFFFFF] items-center justify-center"
          >
            <Text
              className="text-[13px] text-[#344054]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Cancel
            </Text>
          </Pressable>

          <Pressable
            disabled={!canSubmit}
            onPress={() =>
              onSubmit({
                bankCode,
                bankName,
                accountNumber,
                accountName: accountName.trim(),
                isDefault: isEnabled,
              })
            }
            className={`flex-1 h-[44px] rounded-[12px] items-center justify-center ${
              canSubmit ? "bg-[#F6339A]" : "bg-[#E4E7EC]"
            }`}
          >
            <Text
              className={`text-[13px] ${canSubmit ? "text-[#FFFFFF]" : "text-[#98A2B3]"}`}
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Add Account
            </Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

type Propsing = {
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export function RemoveBankAccountBody({
  onCancel,
  onConfirm,
  loading = false,
}: Propsing) {
  return (
    <View className="gap-[16px]">
      {/* Message */}
      <Text
        className="text-[14px] text-[#667085]"
        style={{ fontFamily: "Manrope_400Regular", lineHeight: 20 }}
      >
        Are you sure you want to remove this bank account? This action cannot be
        undone.
      </Text>

      {/* Actions */}
      <View className="flex flex-row gap-[12px]">
        <Pressable
          onPress={onCancel}
          className="flex-1 h-[44px] rounded-[12px] border border-[#D0D5DD] bg-[#FFFFFF] items-center justify-center"
        >
          <Text
            className="text-[14px] text-[#344054]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          disabled={loading}
          className={`flex-1 h-[44px] rounded-[12px] items-center justify-center ${
            loading ? "bg-[#FDA29B]" : "bg-[#F04438]"
          }`}
        >
          <Text
            className="text-[14px] text-[#FFFFFF]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {loading ? "Removing..." : "Remove Account"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slot: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: "45%",
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#EC4899",
    borderColor: "#EC4899",
  },
  slotText: {
    color: "#333",
    fontWeight: "500",
  },
  selectedText: {
    color: "#fff",
  },
  disabled: {
    backgroundColor: "#F1F1F1",
    borderColor: "#E5E5E5",
  },
  disabledText: {
    color: "#AAA",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  thumbnailWrap: {
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  activeThumbnailWrap: {
    borderColor: "#FF4EB9",
    shadowColor: "#FF4EB9",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 16,
  },
  sectionAction: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: "#FF6EC7",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },
  icon: {
    width: 120,
    height: 120,
    tintColor: "#ccc", // optional for vector icon
  },
  containerx: {
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#ccc",
  },
  activeBg: {
    backgroundColor: "#FF6EC7",
  },
  inactiveBg: {
    backgroundColor: "#E5E7EB",
  },
  slider: {
    position: "absolute",
    top: 2,
    left: 2,
    backgroundColor: "white",
  },
  labelx: {
    position: "absolute",
    fontSize: 12,
    color: "#555",
    top: "50%",
    transform: [{ translateY: -6 }],
  },
  labely: {
    position: "absolute",
    fontSize: 12,
    color: "#555",
    // top: "50%",
    transform: [{ translateY: -6 }],
  },
  selectedPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#FF6EC7",
    marginRight: 4,
  },
  selectedTextx: {
    color: "white",
    fontSize: 14,
  },
  allCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  categoryPillSelected: {
    backgroundColor: "#FF6EC7",
    borderColor: "#ccc",
  },
  categoryText: {
    color: "#333",
    fontSize: 14,
  },
  categoryTextSelected: {
    color: "white",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  containerxt: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 40, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",

    // shadow
    shadowColor: "#101828",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titlexc: {
    fontSize: 14,
    color: "#101828",
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#EAECF0",
  },
  body: {
    padding: 16,
    gap: 12,
  },
  footer: {
    padding: 16,
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#F2F4F7",
  },
  name: { fontSize: 14, fontWeight: "700", color: "#101828" },
  sub: { fontSize: 12, color: "#667085", marginTop: 2 },

  notice: {
    borderWidth: 1,
    borderColor: "#FBCFE8",
    backgroundColor: "#FDF2F8",
    padding: 12,
    borderRadius: 12,
  },
  noticeTitle: { color: "#C11574", fontWeight: "700", fontSize: 12 },
  noticeText: { color: "#C11574", fontSize: 12, marginTop: 4, lineHeight: 16 },

  primaryBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EC4899",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },

  outlineBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  outlineText: { color: "#344054", fontWeight: "600", fontSize: 13 },

  detailsCard: {
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLabel: { fontSize: 12, color: "#667085" },
  rowValue: { fontSize: 12, color: "#101828", fontWeight: "600" },
});
