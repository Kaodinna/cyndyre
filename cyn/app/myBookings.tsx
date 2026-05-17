import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import {
  cancelBooking,
  getBookingsForCustomer,
  rescheduleBooking,
} from "@/services/api/request";
import {
  AppModal,
  BookingsFilterSection,
  CalendarPicker,
  CustomTextArea,
  filterItemsWithNullParent,
  StatusModal,
  TimeSlotGrid,
} from "@/components/reusables";
import { Category } from "@/types/type";
import { UserBookings } from "@/components/flatListItems/items";

type FormData = {
  reason: string;
};
export default function Tab() {
  const [serviceProvicders, setServicProviders] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    reason: "",
  });
  const [modalType, setModalType] = useState<
    "reschedule" | "cancel" | "pickTime" | null
  >(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"upcoming" | "canceled" | "completed">(
    "upcoming",
  );
  const bookingStatusMap: Record<
    "upcoming" | "completed" | "canceled",
    string[]
  > = {
    upcoming: ["pending", "confirmed", "payment_pending", "rescheduled"],
    completed: ["completed"],
    canceled: ["cancelled", "expired", "no_show"],
  };
  const [errors, setErrors] = useState<FormErrors>({});
  type FormErrors = Partial<Record<keyof FormData, string>>;

  const loadCustomerData = async () => {
    try {
      setLoading(true);

      const statuses = bookingStatusMap[tab];
      const bookings = await getBookingsForCustomer(statuses);

      setServicProviders(bookings);
    } catch (err: any) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [tab]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  }
  const handleReschedule = (booking: any) => {
    setOpenHistory(true);
    setModalType("reschedule");
    setSelectedBooking(booking);
  };

  const handleCancel = (booking: any) => {
    // Open cancel confirmation modal
    setOpenHistory(true);

    setModalType("cancel");
    setSelectedBooking(booking);
  };
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const validateForm = (data: any, type: "cancel" | "reschedule") => {
    const errors: any = {};

    // common validation
    if (!data.reason) {
      errors.reason = "Reason is required";
    }

    // extra validation for reschedule
    if (type === "reschedule") {
      if (!data.selectedTime) {
        errors.selectedTime = "Time is required";
      }

      if (!data.date) {
        errors.date = "Date is required";
      }
    }

    return errors;
  };
  const resetForm = () => {
    setFormData({
      reason: "",
      // add other fields here
    });

    setSelectedTime("");
    setDate("");
    setErrors({});
  };
  const handleSubmit = async () => {
    const validationErrors = validateForm(formData, "cancel");
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const payload = {
      ...formData,
    };

    try {
      const response = await cancelBooking(payload, selectedBooking._id);

      if (response.success) {
        setOpenHistory(false);
        loadCustomerData();
        resetForm();
      } else {
        setApiError(
          response.message || "Failed to add service. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setApiError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const reschedule = async () => {
    const validationErrors = validateForm(
      { ...formData, selectedTime, date },
      "reschedule",
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const payload = {
      ...formData,
      newAppointmentTime: selectedTime,
      newAppointmentDate: date,
    };
    console.log("Reschedule selectedBooking._id:", selectedBooking._id);
    try {
      const response = await rescheduleBooking(payload, selectedBooking._id);

      if (response.success) {
        setOpenHistory(false);
        loadCustomerData();
        resetForm();
      } else {
        setApiError(response.message || "Failed to reschedule booking.");
      }
    } catch (error: any) {
      setApiError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  const isRescheduleDisabled = !formData.reason || !selectedTime || !date;
  return (
    <SafeAreaView
      edges={["bottom"]}
      className="flex-1 bg-[#F8F8FF]"
      style={{ paddingTop: Platform.OS === "android" ? 40 : 0 }}
    >
      <View className="mt-4 mx-4">
        <BookingsFilterSection activeTab={tab} onChangeTab={setTab} />
      </View>
      <ScrollView className=" flex flex-col ">
        {serviceProvicders.length > 0 && (
          <View className="bg-[#FEF6E8] my-[24px] mx-4  border-[#E5E7EB] border-[1.24px] p-[16px] rounded-[10px] gap-[12px] flex flex-row">
            <MaterialIcons name="error-outline" size={20} color="#FD8905" />
            <View className="flex flex-col gap-[4px] flex-1">
              <Text
                className="text-[#101828] text-[14px]"
                style={{ fontFamily: "Manrope_700Bold" }}
              >
                Cancellation Policy
              </Text>
              <Text
                className="text-[#4A5565] text-[14px]"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                You can cancel or reschedule for free up until 60% of the time
                has passed since booking. After that, cancelling forfeits 70% of
                the cost, with a 20% refund and 5% service charge.
              </Text>
            </View>
          </View>
        )}
        <FlatList
          scrollEnabled={false}
          data={serviceProvicders}
          keyExtractor={(item) => item._id}
          // contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <UserBookings
              // id={item.id}
              appointmentTime={item.appointmentTime}
              cost={item.servicePrice}
              status={item.status}
              appointmentDate={item.appointmentDate}
              businessName={item.providerId?.businessName}
              image={item.providerId.images?.[0] ?? ""}
              serviceLocation={item.serviceLocation}
              onReschedulePress={() => handleReschedule(item)}
              onCancelPress={() => handleCancel(item)}
            />
          )}
          ListFooterComponent={<View className="h-28" />}
          ListEmptyComponent={
            <View className="flex flex-col gap-[24px]">
              <Image
                source={require("../assets/images/bx_calendar.png")}
                className="w-[121px] h-[121px] self-center mt-20"
              />
              <View className="flex flex-col gap-[6px]">
                <Text
                  className="text-center text-[#585757] text-[20px]"
                  style={{ fontFamily: "Manrope_700Bold" }}
                >
                  No Bookings
                </Text>
                <Text
                  className="text-center text-[#585757] text-[16px]"
                  style={{ fontFamily: "Manrope_400Regular" }}
                >
                  You have not made any orders yet
                </Text>
              </View>
            </View>
          }
        />
      </ScrollView>
      <AppModal
        visible={openHistory}
        onClose={() => setOpenHistory(false)}
        title={
          modalType === "cancel"
            ? "Cancel Appointment"
            : "Reschedule Appointment"
        }
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex flex-col gap-[24px]">
            {modalType === "cancel" ? (
              <Text
                className="text-[#101828] text-[16px] text-center"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Are you sure you want to cancel your appointment with{" "}
                <Text className="" style={{ fontFamily: "Manrope_700Bold" }}>
                  {selectedBooking?.providerId?.businessName}?
                </Text>
              </Text>
            ) : (
              <Text
                className="text-[#101828] text-[16px] text-center"
                style={{ fontFamily: "Manrope_400Regular" }}
              >
                Choose a new time for your appointment with{" "}
                <Text className="" style={{ fontFamily: "Manrope_700Bold" }}>
                  {selectedBooking?.providerId?.businessName}
                </Text>
              </Text>
            )}
            {modalType === "reschedule" && (
              <View className="flex-row gap-[16px]">
                <Pressable
                  onPress={() => {
                    setModalType("pickTime");
                  }}
                  className="bg-[#FF6EC7] h-[36px]  rounded-[10px] items-center justify-center flex-1"
                >
                  <Text
                    className="text-[#FFFFFF] text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Find New Time
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setModalType("cancel");
                  }}
                  className="h-[36px]  rounded-[10px] border-[#D97474] border-[1.24px] items-center justify-center flex-1"
                >
                  <Text
                    className="text-[#EB001B] text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Cancel Booking
                  </Text>
                </Pressable>
              </View>
            )}
            {modalType === "cancel" && (
              <View className="flex flex-col gap-[24px]">
                <CustomTextArea
                  label="Reason for Cancellation"
                  placeholder="Please provide a reason for canceling your appointment..."
                  value={formData.reason}
                  onChangeText={(text) => handleInputChange("reason", text)}
                  numberOfLines={5}
                  errorMessage={errors.reason}
                />
                <View className="flex-row gap-[16px]">
                  <Pressable
                    onPress={() => setOpenHistory(false)}
                    className="h-[36px]  rounded-[10px] border-[#D1D5DC] border-[1.24px] items-center justify-center flex-1"
                  >
                    <Text
                      className="text-[#364153] text-[14px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Keep Appointment
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleSubmit()}
                    className="bg-[#D22C2C] h-[36px]  rounded-[10px] items-center justify-center flex-1"
                  >
                    <Text
                      className="text-[#FFFFFF] text-[14px]"
                      style={{ fontFamily: "Manrope_400Regular" }}
                    >
                      Confirm Cancellation
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
            {modalType === "pickTime" && (
              <ScrollView className="max-h-[550px]">
                <View className="mb-6">
                  <CalendarPicker value={date} onSelect={(d) => setDate(d)} />
                </View>

                <View className="mb-6">
                  <TimeSlotGrid
                    value={selectedTime}
                    onSelect={(time) => setSelectedTime(time)}
                  />
                </View>

                <View className="mb-6">
                  <CustomTextArea
                    label="Reason for Cancellation"
                    placeholder="Please provide a reason for canceling your appointment..."
                    value={formData.reason}
                    onChangeText={(text) => handleInputChange("reason", text)}
                    numberOfLines={5}
                    errorMessage={errors.reason}
                  />
                </View>
                <Pressable
                  onPress={reschedule}
                  disabled={isRescheduleDisabled}
                  className={`h-[37px] rounded-[10px] items-center justify-center flex-1 ${
                    isRescheduleDisabled ? "bg-gray-400" : "bg-[#FF6EC7]"
                  }`}
                >
                  <Text
                    className="text-[#FFFFFF] text-[14px]"
                    style={{ fontFamily: "Manrope_400Regular" }}
                  >
                    Confirm
                  </Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </TouchableWithoutFeedback>
      </AppModal>
      <StatusModal
        visible={showSuccess}
        type="success"
        title="Success"
        message="Service Cancelled Successfully."
        buttonText="Continue"
        onClose={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
}
