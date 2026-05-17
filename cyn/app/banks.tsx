import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AddBankAccountBody,
  AppModal,
  RemoveBankAccountBody,
} from "@/components/reusables";
import { addUserBannk, getBanks } from "@/services/api/request";
import banks from "../banks.json";
type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
};

export default function WithdrawalBankAccountsScreen() {
  const router = useRouter();
  const [userBanks, setUserBanks] = useState<any[]>([]);
  const [openAddBank, setOpenAddBank] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  // demo state (replace with your API data)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: "1",
      bankName: "GTBank",
      accountNumber: "0123456789",
      accountName: "Sarah Johnson",
      isDefault: true,
    },
    {
      id: "2",
      bankName: "Access Bank",
      accountNumber: "0987654321",
      accountName: "Sarah Johnson",
      isDefault: false,
    },
    {
      id: "3",
      bankName: "First Bank",
      accountNumber: "0112233445",
      accountName: "Sarah Johnson",
      isDefault: false,
    },
  ]);

  const defaultId = useMemo(
    () => accounts.find((a) => a.isDefault)?.id,
    [accounts],
  );

  const setDefault = (id: string) => {
    setAccounts((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const removeAccount = (id: string) => {
    const isDefault = id === defaultId;
    // Alert.alert(
    //   "Remove bank account?",
    //   "This will remove the selected bank account from your withdrawal accounts.",
    //   [
    //     { text: "Cancel", style: "cancel" },
    //     {
    //       text: "Remove",
    //       style: "destructive",
    //       onPress: () => {
    //         setAccounts((prev) => prev.filter((a) => a.id !== id));

    //         // if they removed default, set first remaining as default (optional)
    //         if (isDefault) {
    //           setAccounts((prev) => {
    //             const next = prev.filter((a) => a.id !== id);
    //             if (next.length === 0) return [];
    //             return next.map((a, idx) => ({ ...a, isDefault: idx === 0 }));
    //           });
    //         }
    //       },
    //     },
    //   ],
    // );
  };

  const onAddNew = () => {
    // Navigate to Add Bank Account screen or open modal
    // router.push("/add-bank-account");
    Alert.alert("Add New Bank Account", "Hook this to your add bank flow.");
  };
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        const listRes = await getBanks();

        setUserBanks(listRes.data);
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };
    loadCustomerData();
  }, []);

  const handleSubmit = async (payload: any) => {
    setLoading(true);

    try {
      const response = await addUserBannk(payload);
      console.log("add bank payload", payload);
      console.log("add bank response", response);
      if (response.success) {
        setOpenAddBank(false);
      } else {
        Alert.alert(
          response.message || "Failed to add bank account. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      Alert.alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6EC7" />
      </View>
    );
  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF]">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex flex-row items-center gap-[10px] border-b border-[#EAECF0]">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#101828" />
        </Pressable>

        <Text
          className="text-[14px] text-[#101828]"
          style={{ fontFamily: "Manrope_700Bold" }}
        >
          Withdrawal Bank Accounts
        </Text>
      </View>

      <FlatList
        data={userBanks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        // 🔹 Main list content
        renderItem={({ item }) => (
          <BankAccountCard
            bankName={item.bankName}
            accountNumber={item.accountNumber}
            accountName={item.accountName}
            isDefault={!!item.isDefault}
            onSetDefault={() => setDefault(item.id)}
            onDelete={() => {
              removeAccount(item.id);
              setOpenRemove(true);
            }}
          />
        )}
        // 🔹 Header (everything above list)
        ListHeaderComponent={
          <View className="px-4 py-4 gap-[12px]">
            {/* Info Banner */}
            <View className="bg-[#FDF2F8] border border-[#FBCFE8] rounded-[12px] p-[12px]">
              <Text
                className="text-[12px] text-[#C11574]"
                style={{ fontFamily: "Manrope_400Regular", lineHeight: 16 }}
              >
                Manage your bank accounts for withdrawals. You can add multiple
                accounts and remove ones you no longer need.
              </Text>
            </View>

            {/* Add Button */}
            <Pressable
              onPress={() => setOpenAddBank(true)}
              className="h-[44px] rounded-[12px] border border-[#F6339A] bg-[#FFF1F8] flex flex-row items-center justify-center gap-[8px]"
            >
              <Ionicons name="add" size={18} color="#E60076" />
              <Text
                className="text-[13px] text-[#E60076]"
                style={{ fontFamily: "Manrope_600SemiBold" }}
              >
                Add New Bank Account
              </Text>
            </Pressable>
          </View>
        }
        // 🔹 Empty state
        ListEmptyComponent={
          <Text
            className="text-[13px] text-[#667085] text-center mt-[16px]"
            style={{ fontFamily: "Manrope_400Regular" }}
          >
            No bank accounts added yet.
          </Text>
        }
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: 16,
          gap: 12,
        }}
      />

      {/* Modals stay OUTSIDE FlatList */}
      <AppModal
        visible={openAddBank}
        onClose={() => setOpenAddBank(false)}
        title="Add Bank Account"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <AddBankAccountBody
              banks={banks}
              onCancel={() => setOpenAddBank(false)}
              onSubmit={(payload) => {
                console.log("payload", payload);
                handleSubmit(payload);
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </AppModal>

      <AppModal
        visible={openRemove}
        onClose={() => setOpenRemove(false)}
        title="Remove Bank Account"
      >
        <RemoveBankAccountBody
          onCancel={() => setOpenRemove(false)}
          onConfirm={async () => {
            setOpenRemove(false);
          }}
        />
      </AppModal>
    </SafeAreaView>
  );
}

function BankAccountCard({
  bankName,
  accountNumber,
  accountName,
  isDefault,
  onSetDefault,
  onDelete,
}: {
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  return (
    <View
      className={`rounded-[14px] border p-[14px] ${
        isDefault
          ? "border-[#F6339A] bg-[#FFF1F8]"
          : "border-[#EAECF0] bg-[#FFFFFF]"
      }`}
    >
      <View className="flex flex-row items-start justify-between">
        <View className="flex flex-row gap-[10px]">
          {/* Icon bubble */}
          <View className="h-[36px] w-[36px] rounded-full bg-[#FCE7F3] items-center justify-center">
            <Ionicons name="card-outline" size={18} color="#E60076" />
          </View>

          {/* Text */}
          <View className="gap-[4px]">
            <View className="flex flex-row items-center gap-[8px]">
              <Text
                className="text-[13px] text-[#101828]"
                style={{ fontFamily: "Manrope_700Bold" }}
              >
                {bankName}
              </Text>

              {isDefault ? (
                <View className="px-[8px] h-[20px] rounded-full bg-[#FCE7F3] items-center justify-center">
                  <Text
                    className="text-[11px] text-[#E60076]"
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                  >
                    Default
                  </Text>
                </View>
              ) : (
                <Pressable onPress={onSetDefault} hitSlop={10}>
                  <Text
                    className="text-[11px] text-[#E60076]"
                    style={{ fontFamily: "Manrope_600SemiBold" }}
                  >
                    Set as Default
                  </Text>
                </Pressable>
              )}
            </View>

            <Text
              className="text-[12px] text-[#667085]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {accountNumber}
            </Text>
            <Text
              className="text-[12px] text-[#667085]"
              style={{ fontFamily: "Manrope_400Regular" }}
            >
              {accountName}
            </Text>
          </View>
        </View>

        {/* Delete */}
        <Pressable onPress={onDelete} hitSlop={12}>
          <Feather name="trash-2" size={18} color="#F04438" />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
