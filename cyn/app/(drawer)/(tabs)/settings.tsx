import {
  View,
  Text,
  SectionList,
  Platform,
  StyleSheet,
  SectionListData,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Href } from "expo-router";
import { useAuth } from "@/components/AuthContext";

export default function Tab() {
  const { user } = useAuth();
  const isRider = user?.role === "rider";
  const isProvider = user?.role === "businessOwner";

  type MenuItem = {
    id: string;
    title: string;
    link?: Href;
  };

  type Section = {
    title: string;
    data: MenuItem[];
  };

  const personalItems: MenuItem[] = isProvider
    ? [
        { id: "1", title: "Profile", link: "/serviceProviderProfile" as Href },
        { id: "2", title: "Availability", link: "/availabilityScreen" as Href },
        { id: "3", title: "Withdrawal Bank", link: "/banks" as Href },
      ]
    : [
        { id: "1", title: "Profile", link: "/profile" },
        ...(isRider ? [] : [
          { id: "3", title: "Shipping Address", link: "/shippingAddress" as Href },
          { id: "4", title: "Payment Methods" },
          { id: "5", title: "Period Tracker", link: "/periodTrackerScreen" as Href },
        ]),
      ];

  const activityItems: MenuItem[] = isRider
    ? [
        { id: "1", title: "My Deliveries", link: "/riderDeliveries" as Href },
        { id: "2", title: "Help Center" },
      ]
    : isProvider
    ? [
        { id: "1", title: "Help Center" },
        { id: "2", title: "Privacy Policy" },
        { id: "3", title: "Terms and Conditions" },
      ]
    : [
        { id: "1", title: "My Orders", link: "/myOrders" as Href },
        { id: "2", title: "Help Center" },
        { id: "3", title: "Privacy Policy" },
        { id: "4", title: "Terms and Conditions" },
        { id: "5", title: "Country" },
        { id: "6", title: "Currency" },
      ];

  const Data: Section[] = [
    { title: "Settings", data: [] },
    { title: "Personal", data: personalItems },
    { title: isRider ? "Deliveries" : isProvider ? "Business" : "Shop", data: activityItems },
  ];

  return (
    <SafeAreaView
      className="flex flex-1 bg-[#F8F8FF]"
      style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
    >
      <View className="px-4">
        <SectionList
          showsVerticalScrollIndicator={false}
          sections={Data}
          renderItem={({ item }) =>
            item.link ? (
              <Link href={item.link} asChild>
                <Pressable
                  className="py-[16px] border-b-[1px] flex flex-row justify-between items-center"
                  style={{ borderColor: "rgba(55, 54, 54, 0.1)" }}
                >
                  <Text
                    className="text-[16px]"
                    style={{ fontFamily: "Manrope_500Medium" }}
                  >
                    {item.title}
                  </Text>

                  <Octicons name="chevron-right" size={24} color="#373636" />
                </Pressable>
              </Link>
            ) : (
              <Pressable
                className="py-[16px] border-b-[1px]"
                style={{ borderColor: "rgba(55, 54, 54, 0.1)" }}
              >
                <Text
                  className="text-[16px]"
                  style={{ fontFamily: "Manrope_500Medium" }}
                >
                  {item.title}
                </Text>
              </Pressable>
            )
          }
          renderSectionHeader={({ section }) => {
            const index = Data.findIndex((s) => s.title === section.title);
            return (
              <Text
                style={[
                  index === 0
                    ? styles.firstSectionHeader
                    : styles.sectionHeader,
                  { fontFamily: "Manrope_700Bold" },
                ]}
              >
                {section.title}
              </Text>
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  firstSectionHeader: {
    fontSize: 24,
    color: "#202020",
    backgroundColor: "#F7F7F7",
  },
  sectionHeader: {
    fontSize: 20,
    color: "#050404",
    backgroundColor: "#F7F7F7",
    paddingTop: 20,
  },
});
