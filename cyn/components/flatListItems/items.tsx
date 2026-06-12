import {
  Category,
  ItemProps,
  ProductInterface,
  ProductProps,
} from "@/types/type";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { Pressable, View, Text, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  formatAppointmentDate,
  formatNumberToThousands,
  formatShortDate,
  RatingStars,
  summarizeBusinessHours,
} from "../reusables";
import { memo, useState } from "react";
import { addCommasToNumber } from "@/helpers/functions";
export const ServiceDetails = ({
  title,
  image,
  description,
  price,
  isSelected,
  time,
  onPress,
}: {
  title: string;
  image: string;
  description: string;
  price: number;
  time: number;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={` flex flex-row  gap-[12px]  w-full mb-4  p-[14px]  border-[1px] rounded-[14px] ${isSelected ? "border-[#F6339A]  bg-[#FDF2F8]" : "border-[#E5E7EB]  bg-[#ffffff]"}`}
  >
    <Image
      source={typeof image === "string" ? { uri: image } : image}
      className="w-[80px] h-[80px]  rounded-[10px]"
    />
    <View className="flex gap-[8px] p-[8px] flex-1">
      <View className="flex flex-row gap-[4px] items-center justify-between">
        <Text
          className="text-[16px]  text-[#101828]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {title}
        </Text>
        {isSelected ? (
          <Octicons name="check-circle" size={16} color="#F6339A" />
        ) : (
          <Feather name="circle" size={16} color="#D1D5DC" />
        )}
      </View>
      <Text
        className="text-[14px] text-[#4A5565]"
        style={{ fontFamily: "Manrope_400Regular" }}
      >
        {description}
      </Text>
      <View className="flex flex-row items-center justify-between w-full">
        <View className="flex flex-row gap-[8px] items-center ">
          <MaterialIcons name="access-time" size={16} color="#4A5565" />
          <Text
            className="text-[14px] text-[#4A5565]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {time} mins
          </Text>
        </View>
        <Text
          className="text-[16px] font-[600] text-[#F6339A]"
          style={{ fontFamily: "Manrope_600SemiBold" }}
        >
          ₦ {formatNumberToThousands(price)}
        </Text>
      </View>
    </View>
  </Pressable>
);
export const SelectedService = ({
  title,
  image,
  description,
  price,
  isSelected,
  time,
}: {
  title: string;
  image: string;
  description: string;
  price: number;
  time: number;
  isSelected: boolean;
}) => (
  <Pressable
    className={` flex flex-row  gap-[12px]  w-full mb-4  p-[14px] rounded-[10px] bg-[#F9FAFB] `}
  >
    <Image
      source={typeof image === "string" ? { uri: image } : image}
      className="w-[48px] h-[48px]  rounded-[10px]"
    />
    <View className="flex gap-[8px] p-[8px] flex-1">
      <View className="flex flex-row gap-[4px] items-center justify-between">
        <Text
          className="text-[14px]  text-[#101828]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {title}
        </Text>
      </View>

      <View className="flex flex-row items-center justify-between w-full">
        <View className="flex flex-row gap-[8px] items-center ">
          <Text
            className="text-[12px] text-[#6A7282]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {time} mins
          </Text>
        </View>
        <Text
          className="text-[14px] font-[600] text-[#101828]"
          style={{ fontFamily: "Manrope_600SemiBold" }}
        >
          ₦ {formatNumberToThousands(price)}
        </Text>
      </View>
    </View>
  </Pressable>
);
export const Service = ({
  businessName,
  businessAddress,
  image,
  description,
  businessHours,
  experience,
  id,
  isAvailableForHomeService,
}: {
  businessName: string;
  businessAddress: string;
  experience: number;
  image: string;
  description: string;
  isAvailableForHomeService: boolean;
  businessHours: any;
  id: string;
}) => (
  <Link href={`/serviceProvider/${id}`} asChild>
    <Pressable className=" flex  gap-[4px]  bg-[#ffffff] w-full mb-4 rounded-[6px] shadow-black/20 shadow-lg">
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        className="w-full h-[192px]  rounded-tr-[8px] rounded-tl-[8px]"
      />
      <View className="flex gap-[8px] p-[8px] w-full">
        <View className="flex flex-col gap-[4px]">
          <Text
            className="text-[16px]  text-[#101828]"
            style={{ fontFamily: "Manrope_600SemiBold" }}
          >
            {businessName}
          </Text>
        </View>

        <View className="flex flex-row gap-[8px] items-center w-full flex-wrap">
          <Ionicons name="location-outline" size={16} color="#4A5565" />
          <Text
            className="text-[14px] text-[#4A5565]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {businessAddress}
          </Text>
          <View className="rounded-full w-[6px] h-[6px] bg-[#99A1AF]"></View>
          <Text
            className="text-[14px] text-[#4A5565]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            2.3km
          </Text>
        </View>
        <View className="flex flex-row gap-[8px] items-center flex-wrap">
          <MaterialIcons name="access-time" size={16} color="#4A5565" />
          <Text
            className="text-[14px] text-[#4A5565]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {summarizeBusinessHours(businessHours)}
          </Text>
        </View>
        <View>
          <View className="bg-[#F3F4F6] flex items-center h-[24px] justify-center rounded-[41768300px] self-start px-[12px]">
            <Text
              className="text-[12px] text-[#364153]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Color
            </Text>
          </View>
        </View>
        <View className="flex flex-row border-t-[1px] border-[#00000019] py-2 items-center  justify-between">
          <View className="flex flex-row gap-[12px]  ">
            <Text
              className="text-[13px] font-[600] text-[#8C8C8C]"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              {experience} years exp
            </Text>
            <View className="bg-[#D1D5DC] h-[20px] w-[2px]"></View>
            <View className="flex flex-row gap-[4px]">
              {isAvailableForHomeService && (
                <Text
                  className="text-[14px] font-[600] text-[#F6339A]"
                  style={{ fontFamily: "Manrope_600SemiBold" }}
                >
                  Home Service
                </Text>
              )}
            </View>
          </View>
          {/* <Text
            className="text-[13px] font-[600] text-[#8C8C8C]"
            style={{ fontFamily: "Manrope_600SemiBold" }}
          >
            ₦4000 - ₦{price}
          </Text> */}
        </View>
      </View>
    </Pressable>
  </Link>
);
export const UserBookings = ({
  businessName,
  serviceLocation,
  image,
  appointmentTime,
  appointmentDate,
  cost,

  status,
  onReschedulePress,
  onCancelPress,
}: {
  businessName: string;
  cost: number;
  onReschedulePress?: () => void;
  onCancelPress?: () => void;
  image: string;
  appointmentTime: string;
  appointmentDate: string;

  serviceLocation: string;

  status: string;
}) => (
  <Pressable className=" flex  gap-[4px]  bg-[#ffffff]  mb-4 rounded-[6px] shadow-black/20 shadow-lg mx-4">
    <View className="relative w-full h-[192px] rounded-tr-[8px] rounded-tl-[8px] overflow-hidden">
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        className="w-full h-full"
      />

      {/* Status Badge */}
      <View className="absolute top-2 right-2 bg-[#F6339A] px-3 py-1 rounded-full">
        <Text
          className="text-white text-[12px] font-bold"
          style={{ fontFamily: "Manrope_700Bold" }}
        >
          {status?.toUpperCase()} {/* Example: "CONFIRMED", "CANCELLED" */}
        </Text>
      </View>
    </View>
    <View className="flex gap-[8px] p-[16px] w-full">
      <View className="flex flex-col gap-[4px]">
        <Text
          className="text-[20px]  text-[#101828]"
          style={{ fontFamily: "Manrope_700Bold" }}
        >
          {businessName}
        </Text>
      </View>
      <View className="flex flex-col gap-[8px]">
        <View className="flex flex-row gap-[8px] items-center w-full flex-wrap">
          <Octicons name="calendar" size={16} color="#F6339A" />
          <Text
            className="text-[14px] text-[#4A5565]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {formatAppointmentDate(appointmentDate)}
          </Text>
        </View>
        <View className="flex flex-row gap-[8px] items-center flex-wrap">
          <MaterialIcons name="access-time" size={16} color="#F6339A" />
          <Text
            className="text-[14px] text-[#4A5565]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {appointmentTime}
          </Text>
        </View>
        <View className="flex flex-row gap-[8px] items-center w-full flex-wrap">
          <Ionicons name="location-outline" size={16} color="#F6339A" />
          <Text
            className="text-[14px] text-[#4A5565]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {serviceLocation}
          </Text>
        </View>
      </View>
      <View className="flex flex-col gap-[16px]">
        <Text
          className="text-[20px] text-[#E60076] text-right"
          style={{ fontFamily: "Manrope_700Bold" }}
        >
          ${formatNumberToThousands(cost)}
        </Text>
        {["pending", "confirmed", "payment_pending"].includes(status) && (
          <View className="flex-row items-center">
            <Pressable
              onPress={onReschedulePress}
              className="flex-1 mr-4 border-[#D1D5DC] border-[1px] rounded-[8px] h-[36px] items-center justify-center"
            >
              <Text
                className="text-[14px] text-[#364153]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Reschedule
              </Text>
            </Pressable>

            <Pressable
              onPress={onCancelPress}
              className="border-[#D97474] flex-1 border-[1px] rounded-[8px] h-[36px] items-center justify-center"
            >
              <Text
                className="text-[14px] text-[#EB001B]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  </Pressable>
);
export const Booking = ({
  fullname,
  image,
  description,
  price,
  status,
  appointmentDate,
  appointmentTime,
  serviceLocation,
  onViewDetails,
}: {
  fullname: string;
  image: string;
  description: string;
  price: number;
  status: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceLocation: string;
  onViewDetails?: () => void;
}) => (
  <View
    className=" flex  gap-[8px]  bg-[#ffffff] w-full mb-4 rounded-[16px]  p-[16px]"
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5, // Android shadow
    }}
  >
    <View className="flex flex-row w-full justify-between items-center">
      <View className="flex flex-row gap-[12px] items-center">
        <Image
          source={typeof image === "string" ? { uri: image } : image}
          className=" h-[48px] w-[48px]  rounded-[14px]"
        />
        <View>
          <Text
            className="text-[16px]  text-[#101828]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {fullname}
          </Text>
          <Text
            className="text-[14px]  text-[#6A7282]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {fullname}
          </Text>
        </View>
      </View>
      <View>
        <View className="bg-[#FCE7F3] rounded-[41768300px] h-[24px] px-[8px] flex items-center justify-center">
          <Text
            className="text-[12px] text-[#E60076]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {status}
          </Text>
        </View>
      </View>
    </View>

    <View className="flex flex-col gap-[8px]">
      <View className="flex flex-row gap-[8px] items-center flex-wrap">
        <Feather name="calendar" size={16} color="#4A5565" />
        <Text
          className="text-[14px] text-[#4A5565]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {formatShortDate(appointmentDate)} at {appointmentTime}
        </Text>
      </View>
      <View className="flex flex-row gap-[8px] items-center flex-wrap">
        <Ionicons name="location-outline" size={16} color="#4A5565" />
        <Text
          className="text-[14px] text-[#4A5565]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {serviceLocation}
        </Text>
      </View>
      <View className="flex flex-row gap-[8px] items-center flex-wrap">
        <Ionicons name="call-outline" size={16} color="#4A5565" />
        <Text
          className="text-[14px] text-[#4A5565]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {description}
        </Text>
      </View>
      <View className="flex flex-row gap-[8px] items-center flex-wrap">
        <Feather name="dollar-sign" size={16} color="#4A5565" />
        <Text
          className="text-[14px] text-[#4A5565]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          ₦{formatNumberToThousands(price)}
        </Text>
      </View>
    </View>
    <View className="flex flex-row  gap-[8px] justify-between">
      <Pressable
        onPress={(e) => {
          onViewDetails?.();
        }}
        className="bg-[#F6339A] flex-1 rounded-[10px] h-[36px] px-[8px] flex items-center justify-center"
      >
        <Text
          className="text-[14px] text-[#ffffff]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          View Details
        </Text>
      </Pressable>
    </View>
  </View>
);
export const UpcomingBooking = ({
  status,
  image,
  price,
  providerId,
  appointmentDate,
  appointmentTime,
}: {
  status: string;
  image: string;

  price: number;
  providerId: string;
  appointmentDate: string;
  appointmentTime: string;
}) => (
  <Pressable
    className=" flex  gap-[8px]  bg-[#ffffff] w-full mb-4 rounded-[16px]  p-[16px]"
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5, // Android shadow
    }}
  >
    <View className="flex flex-row w-full justify-between items-center gap-[12px]">
      <View className="flex flex-row gap-[12px] items-center w-full ">
        <Image
          // source={require("../../assets/images/Sales consulting-pana 1.png")}
          source={typeof image === "string" ? { uri: image } : image}
          className=" h-[48px] w-[48px]  rounded-[14px]"
        />
        <View className="flex-1 flex flex-col gap-[6px] ">
          <Text
            className="text-[16px]  text-[#101828]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {providerId ?? ""}
          </Text>
          <View className="flex flex-row  justify-between ">
            <Text
              className="text-[14px]  text-[#6A7282]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {price}
            </Text>
            <Text
              className="text-[14px]  text-[#6A7282] text-right"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {formatShortDate(appointmentDate)}
            </Text>
          </View>
        </View>
      </View>
    </View>

    <View className="flex flex-row justify-between border-[#F3F4F6] border-t-[1.24px] h-[34px] items-center">
      <View className="flex flex-row gap-[8px] items-center flex-wrap">
        <MaterialCommunityIcons
          name="clock-time-four-outline"
          size={16}
          color="#4A5565"
        />
        <Text
          className="text-[14px] text-[#4A5565]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {appointmentTime}
        </Text>
      </View>
      <View>
        <View className="bg-[#FCE7F3] rounded-[41768300px] h-[24px] px-[8px] flex items-center justify-center">
          <Text
            className="text-[12px] text-[#E60076]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {status}
          </Text>
        </View>
      </View>
    </View>
  </Pressable>
);
export const ServiceListing = ({
  bookings,
  image,
  name,
  price,
  category,
  duration,
  rating,
  status,
}: {
  bookings: number;
  image: string;
  name: string;
  price: number;
  category: string;
  duration: number;
  rating: number;
  status: boolean;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <View
      className="bg-[#ffffff] mb-4 rounded-[14px]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // Android shadow
      }}
    >
      <View className="relative overflow-hidden">
        <Image
          source={typeof image === "string" ? { uri: image } : image}
          className="h-[192px] w-full rounded-tl-[14px] rounded-tr-[14px]"
        />

        {/* Top row */}
        <View className="absolute top-[12px] left-[12px] right-[12px] flex-row justify-between items-center">
          {/* Status */}
          <View
            className={` ${status ? "bg-[#FCE7F3]" : "bg-[#F3F4F6]"} rounded-full h-[24px] px-[8px] flex items-center justify-center`}
          >
            <Text
              className={`text-[12px]  ${status ? "text-[#E60076]" : "text-[#6A7282]"}`}
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {status ? "Active" : "Draft"}
            </Text>
          </View>

          {/* 3-dot */}
          <Pressable
            onPress={() => setMenuOpen((v) => !v)}
            className="w-[32px] h-[32px] bg-white rounded-full flex items-center justify-center"
          >
            <Feather name="more-vertical" size={18} color="#101828" />
          </Pressable>
        </View>

        {/* Dropdown */}
        {menuOpen && (
          <View className="absolute top-[52px] right-[12px] bg-white rounded-[12px] w-[140px] overflow-hidden shadow-md elevation-6 z-50">
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                // EDIT action
              }}
              className="flex-row items-center gap-[8px] px-[12px] py-[12px]"
            >
              <Feather name="edit-2" size={16} color="#101828" />
              <Text>Edit</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMenuOpen(false);
                // DELETE action
              }}
              className="flex-row items-center gap-[8px] px-[12px] py-[12px]"
            >
              <Feather name="trash-2" size={16} color="#E60076" />
              <Text className="text-[#E60076]">Delete</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View className=" flex  gap-[8px]   w-full    p-[16px] ">
        <View className="flex flex-row w-full justify-between items-center">
          <View className="flex flex-row gap-[12px] items-center">
            <View className="flex flex-col gap-[4px]">
              <Text
                className="text-[16px]  text-[#101828]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {name}
              </Text>
              <Text
                className="text-[14px]  text-[#6A7282]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {category}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col gap-[8px]">
          <View className="flex flex-row gap-[8px] items-center flex-wrap">
            <Feather name="dollar-sign" size={16} color="#4A5565" />
            <Text
              className="text-[14px] text-[#4A5565]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              ₦{formatNumberToThousands(price)}
            </Text>
          </View>
          <View className="flex flex-row gap-[8px] items-center flex-wrap">
            <MaterialIcons name="access-time" size={16} color="#4A5565" />
            <Text
              className="text-[14px] text-[#4A5565]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {duration} Minutes
            </Text>
          </View>
          <View className="flex flex-row border-[#F3F4F6] border-t-[1.24px] justify-between py-[6px]">
            <View className="flex flex-row items-center">
              <Text
                className="text-[14px] text-[#6A7282]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Bookings:
              </Text>
              <Text
                className="text-[14px] text-[#101828]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {bookings}
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <Text
                className="text-[14px] text-[#6A7282]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Rating:
              </Text>
              <Text
                className="text-[14px] text-[#101828]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {rating}⭐
              </Text>
            </View>
          </View>
        </View>
        <View className="flex flex-row items-center gap-[8px] justify-between">
          <Pressable className=" w-[100%] rounded-[10px] h-[40px] px-[8px] flex items-center justify-center border-[#D1D5DC] border-[1px]">
            <Text
              className="text-[14px] text-[#364153]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Deactivate
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
export const Payments = ({
  title,
  image,
  paymentType,
  price,
  platformFee,
  bookingDate,
  status,
  customerName,
  deadline,
  onViewDetails,
  onSendReminder,
}: {
  fullname?: string;
  title: string;
  paymentType: string;
  image: any;
  bookingDate: string;
  status: string;
  customerName: string;
  deadline: string;
  price: number;
  platformFee: number;
  onViewDetails?: () => void;
  onSendReminder?: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short", // Dec
      day: "numeric", // 2
      year: "numeric", // 2025
    });
  };
  const safeImage =
    typeof image === "string" ? image.replace("/svg", "/png") : image;
  return (
    <View
      className="bg-[#ffffff] mb-4 rounded-[14px] flex flex-row gap-[16px] p-[24px] w-full"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // Android shadow
      }}
    >
      {!imageError && safeImage ? (
        <Image
          source={{ uri: safeImage }}
          className="h-[48px] w-[48px] rounded-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="h-[48px] w-[48px] rounded-full items-center justify-center bg-gray-200">
          <FontAwesome5 name="user" size={20} color="black" />
        </View>
      )}

      <View className="flex flex-col gap-[16px]  flex-1">
        {/* Top row */}
        <View className="  flex-row justify-between items-center">
          <View className="flex flex-col gap-[4px]">
            <Text
              className="text-[16px]  text-[#101828]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {customerName}
            </Text>
            <View className="bg-[#FCE7F3] rounded-full h-[24px] px-[8px] flex flex-row items-center justify-center gap-[4px]">
              <MaterialIcons name="access-time" size={16} color="black" />
              <Text className="text-[12px] text-[#6A7282]">{status}</Text>
            </View>
          </View>
        </View>
        <View className="flex flex-col gap-[16px]">
          <View className="flex flex-row ">
            <View className="flex flex-col gap-[4px] flex-1">
              <Text
                className="text-[12px]  text-[#6A7282]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Booking Date
              </Text>
              <Text
                className="text-[14px]  text-[#101828]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {formatDate(bookingDate)}
              </Text>
            </View>
            <View className="flex flex-col gap-[4px]  flex-1">
              <Text
                className="text-[12px]  text-[#6A7282]  w-full"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Payment Type
              </Text>
              <Text
                className="text-[14px]  text-[#101828] uppercase"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                {paymentType}
              </Text>
            </View>
          </View>
          <View className="flex flex-row">
            <View className="flex flex-col gap-[4px] flex-1">
              <Text
                className="text-[12px]  text-[#6A7282]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Service Amount
              </Text>
              <Text
                className="text-[14px]  text-[#101828]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                ₦{formatNumberToThousands(price)}
              </Text>
            </View>
            <View className="flex flex-col gap-[4px] flex-1">
              <Text
                className="text-[12px]  text-[#6A7282]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Platform Fee (5%)
              </Text>
              <Text
                className="text-[14px]  text-[#101828]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                ₦{formatNumberToThousands(platformFee)}
              </Text>
            </View>
          </View>
        </View>
        <View className="border-[#FCCEE8] border-[1.24px] bg-[#FDF2F8] p-[14px] rounded-[10px]">
          <Text
            className="text-[14px]  text-[#861043]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            Payment Due: {formatAppointmentDate(deadline)} (60% of days before
            appointment)
          </Text>
        </View>
        <View className="flex flex-row gap-[12px] items-center">
          <Pressable
            onPress={onSendReminder}
            className="bg-[#F6339A] flex-1 h-[38px] rounded-[10px] flex items-center justify-center"
          >
            <Text
              className="text-[14px]  text-[#ffffff]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Send Reminder
            </Text>
          </Pressable>
          <Pressable
            onPress={onViewDetails}
            className="border-[#D1D5DC] border-[1.24px] flex-1 h-[38px] rounded-[10px] flex items-center justify-center"
          >
            <Text
              className="text-[14px]  text-[#364153]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              View details
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
export const Chat = ({ title, image, description, price }: ProductProps) => {
  return (
    <Pressable
      onPress={() => router.push("/chat")}
      className=" border-[#F3F4F6] border-b-[1.24px] mb-4 flex flex-row gap-[12px] py-[12px] w-full"
    >
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        className="h-[48px] w-[48px] rounded-full"
      />
      <View className="flex flex-col gap-[4px]  flex-1">
        {/* Top row */}
        <View className="  flex-row justify-between items-center">
          <Text
            className="text-[16px]  text-[#101828]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {title}
          </Text>

          <Text
            className="text-[12px]  text-[#6A7282]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            {title}
          </Text>
        </View>
        <Text
          className="text-[14px]  text-[#4A5565]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          Booking Date
        </Text>
        <Text
          className="text-[12px]  text-[#6A7282]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          Booking Date
        </Text>
      </View>
    </Pressable>
  );
};
export const Listing = ({
  name,
  image,
  rating,
  totalRatings,
  address,
  id,
}: {
  name: string;
  image: string;
  rating: number;
  totalRatings: number;
  address: string;
  id: string;
}) => (
  <Link href={`/serviceProvider/${id}`} asChild>
    <Pressable className="flex gap-[6px] p-[10px] bg-white w-[48%] mb-4 rounded-[12px] border border-[#E6E6E6]">
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        className="w-full h-[110px] rounded-[8px] bg-[#F5F5F5]"
        contentFit="cover"
      />
      <View className="flex gap-[4px] mt-1">
        <Text
          className="text-[13px] text-[#050404]"
          style={{ fontFamily: "Manrope_600SemiBold" }}
          numberOfLines={1}
        >
          {name}
        </Text>
        {!!address && (
          <Text
            className="text-[11px] text-[#585757]"
            style={{ fontFamily: "Manrope_400Regular" }}
            numberOfLines={2}
          >
            {address}
          </Text>
        )}
        <View className="flex flex-row items-center gap-1 mt-1">
          <RatingStars rating={rating} size={12} />
          {totalRatings > 0 && (
            <Text className="text-[10px] text-[#8C8C8C]" style={{ fontFamily: "Manrope_400Regular" }}>
              ({totalRatings})
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  </Link>
);
export const Product = ({
  id,
  title,
  image,
  description,
  price,
  averageRating,
}: ProductProps) => (
  <Link href={`/product/${id}`} asChild>
    <Pressable className=" flex  gap-[4px] p-[8px] bg-white w-[49%] mb-4 rounded-[6px]">
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        className="w-full h-[126px]  "
      />
      <View className="flex gap-[8px]">
        <Text
          className="text-[13px]  text-[#050404]"
          style={{ fontFamily: "Manrope_600SemiBold" }}
        >
          {title}
        </Text>
        <Text
          className="text-[10px] text-[#585757]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {description}
        </Text>
        <View>
          <Text
            className="text-[13px] font-[600] text-[#585757]"
            style={{ fontFamily: "Manrope_600SemiBold" }}
          >
            ₦{formatNumberToThousands(price)}
          </Text>
          {/* <View className="flex flex-row gap-2">
            <Text
              className="text-[13px] font-[600] text-[#8C8C8C]"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              ₦4000
            </Text>
            <Text
              className="text-[13px] font-[600] text-[#FE735C]"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              40%Off
            </Text>
          </View> */}
          <View className="mt-2">
            <RatingStars rating={averageRating ?? 0} />
          </View>
        </View>
      </View>
    </Pressable>
  </Link>
);
export const ProductRows = ({
  id,
  title,
  image,
  description,
  price,
}: ProductProps) => (
  <Link href={`/product/${id}`} asChild>
    <Pressable className=" flex  gap-[4px] p-[8px] bg-white mr-4 rounded-[6px] w-[185px]">
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        className="w-full h-[126px]  "
      />
      <View className="flex gap-[8px]">
        <Text
          className="text-[13px]  text-[#050404]"
          style={{ fontFamily: "Manrope_600SemiBold" }}
        >
          {title}
        </Text>
        <Text
          className="text-[10px] text-[#585757]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {description}
        </Text>
        <View>
          <Text
            className="text-[13px] font-[600] text-[#585757]"
            style={{ fontFamily: "Manrope_600SemiBold" }}
          >
            ₦{price}
          </Text>
          {/* <View className="flex flex-row gap-2">
            <Text
              className="text-[13px] font-[600] text-[#8C8C8C]"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              ₦4000
            </Text>
            <Text
              className="text-[13px] font-[600] text-[#FE735C]"
              style={{ fontFamily: "Manrope_600SemiBold" }}
            >
              40%Off
            </Text>
          </View> */}
          <View className="mt-2">
            <RatingStars rating={4.2} />
          </View>
        </View>
      </View>
    </Pressable>
  </Link>
);
export const Item = ({ title, image }: Category) => (
  <View className="w-[88px]  flex items-center justify-center gap-[4px]">
    <Image
      source={typeof image === "string" ? { uri: image } : image}
      className="w-[56px] h-[56px] rounded-full"
    />
    <Text
      className="text-[10px]  text-[#050404] text-center"
      style={{ fontFamily: "Manrope_500Medium" }}
    >
      {title}
    </Text>
  </View>
);
export const ServiceCategory = ({ title, image }: Category) => (
  <View className="w-[88px]  flex items-center justify-center gap-[4px] ">
    <Image
      source={typeof image === "string" ? { uri: image } : image}
      className="w-[56px] h-[56px] rounded-full border-[#FF6EC7] border-[2px]"
    />
    <Text
      className="text-[10px]  text-[#050404] text-center"
      style={{ fontFamily: "Manrope_500Medium" }}
    >
      {title}
    </Text>
  </View>
);
export const ProductCategory = ({ id, title, image }: Category) => (
  <Pressable
    onPress={() => {
      router.push(`/productCategory/${id}`);
    }}
  >
    <View className="w-[88px]  flex items-center justify-center gap-[4px]">
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        className="w-[56px] h-[56px] rounded-full"
      />
      <Text
        className="text-[10px]  text-[#050404] text-center"
        style={{ fontFamily: "Manrope_500Medium" }}
      >
        {title}
      </Text>
    </View>
  </Pressable>
);
export const ProductItem = memo(function ProductItem({
  item,
}: {
  item: ProductInterface;
}) {
  return (
    <Pressable
      className="p-[6px] bg-white w-[49%] mb-4 rounded-[6px]"
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image source={{ uri: item.coverImage }} className="w-full h-[126px]" />
      <View className="p-[4px] flex flex-col gap-[4px]">
        <Text
          className="text-[13px] text-[#050404]"
          style={{ fontFamily: "Manrope_600SemiBold" }}
        >
          {item.title}
        </Text>
        <Text
          className="text-[10px] text-[#585757]"
          style={{ fontFamily: "Manrope_400Regular" }}
        >
          {item.description}
        </Text>
        <Text
          className="text-[13px] font-[600] text-[#585757]"
          style={{ fontFamily: "Manrope_600SemiBold" }}
        >
          ₦{item.price}
        </Text>
      </View>
    </Pressable>
  );
});

type OrderThumbnailProps = {
  images: string[]; // array of image urls
  size?: number; // optional
  borderRadius?: number;
};

export const OrderThumbnail = ({
  images,
  size = 93,
  borderRadius = 6,
}: OrderThumbnailProps) => {
  const safe = (images || []).filter(Boolean);
  const count = safe.length;

  // Single image
  if (count <= 1) {
    return (
      <View
        style={{
          width: "100%",
          height: size,
          borderRadius,
          overflow: "hidden",
          backgroundColor: "#F3F3F3",
        }}
      >
        <Image
          source={{ uri: safe[0] }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Collage (2x2)
  const tiles = safe.slice(0, 4);
  const extra = count - tiles.length;

  return (
    <View
      style={{
        width: "100%",
        height: size,
        borderRadius,
        overflow: "hidden",
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: "#F3F3F3",
      }}
    >
      {tiles.map((uri, idx) => {
        const isLast = idx === tiles.length - 1;
        const showOverlay = extra > 0 && isLast;

        return (
          <View key={`${uri}-${idx}`} style={{ width: "50%", height: "50%" }}>
            <Image
              source={{ uri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />

            {showOverlay && (
              <View
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 14, fontWeight: "800" }}
                >
                  +{extra}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};
type OrderItemProps = {
  id: string;
  orderId: string;
  status: string;
  total: number;
  item: number; // count
  images: string[]; // product image urls for that order
  onPress?: () => void;
};
export const OrderItem = ({
  id,
  orderId,
  status,
  total,
  item,
  images,
  onPress,
}: OrderItemProps) => (
  <View className="border-[0.75px] border-[#E6E6E6] p-[6px] rounded-[8px] bg-white mb-2">
    <View className="flex flex-row items-center justify-between">
      {/* Thumbnail box */}
      <Pressable
        onPress={onPress}
        className="mr-[3%] rounded-[6px] border-[#E6E6E6] border-[1px] p-[3px] w-[30%] overflow-hidden"
      >
        <OrderThumbnail images={images} size={93} borderRadius={6} />
      </Pressable>

      <View className="w-[67%]">
        <View className="mb-[16px]">
          <View className="flex flex-row justify-between items-center mb-[4px]">
            <Text
              style={{ fontFamily: "Manrope_700Bold" }}
              className="text-[13px] text-[#050404]"
            >
              Order {orderId}
            </Text>

            <View className="py-[2px] px-[10px] bg-[#F9F9F9] rounded-[4px]">
              <Text
                className="text-[10px] text-[#050404]"
                style={{ fontFamily: "Manrope_500Medium" }}
              >
                {item} {item === 1 ? "item" : "items"}
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center">
            <Text
              className="text-[10px] text-[#585757]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Status:{" "}
            </Text>
            <Text
              className="text-[10px] text-[#585757]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {status}
            </Text>
          </View>
        </View>

        <View className="flex flex-row justify-between items-center">
          <View className="flex flex-row items-center">
            <Text
              className="text-[14px] text-[#050404]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              Total:{" "}
            </Text>
            <Text
              className="text-[16px] text-[#050404]"
              style={{ fontFamily: "Manrope_700Bold" }}
            >
              ₦{addCommasToNumber(total)}
            </Text>
          </View>

          {status === "Received" ? (
            <Pressable className="border-[#FF6EC7] border-[1px] py-[6px] rounded-[4px] w-[77px]">
              <Text
                className="text-[#FF6EC7] text-center"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Review
              </Text>
            </Pressable>
          ) : (
            <Pressable
              className="bg-[#FF6EC7] py-[6px] rounded-[4px] w-[77px]"
              onPress={() => router.push(`/orderDetail/${id}`)}
            >
              <Text
                className="text-white text-center"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Track
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  </View>
);
