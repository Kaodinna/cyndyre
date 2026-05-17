// components/FilterSheet.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from "react";
import { View, Text, Pressable } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
type FilterSheetProps<T> = {
  title?: string;
  isOpen: boolean;
  value: T; // applied filters from parent
  defaultValue: T; // for reset
  onClose: () => void;

  onApply: (next: T) => void;
  onReset?: (next: T) => void;

  snapPoints?: (string | number)[];
  renderContent: (args: {
    draft: T;
    setDraft: React.Dispatch<React.SetStateAction<T>>;
  }) => React.ReactNode;

  applyLabel?: string;
  resetLabel?: string;
};

export function FilterSheet<T>({
  title = "Filters",
  isOpen,
  value,
  defaultValue,
  onClose,
  onApply,
  onReset,
  snapPoints: snapPointsProp,
  renderContent,
  applyLabel = "Apply",
  resetLabel = "Reset",
}: FilterSheetProps<T>) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => snapPointsProp ?? ["60%", "85%"],
    [snapPointsProp],
  );

  const [draft, setDraft] = useState<T>(value);

  const insets = useSafeAreaInsets();
  // When opening: copy applied -> draft, then expand
  useEffect(() => {
    if (isOpen) {
      setDraft(value);
      // expand next tick so draft is ready
      requestAnimationFrame(() => sheetRef.current?.expand());
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen, value]);

  const close = useCallback(() => {
    sheetRef.current?.close();
    onClose(); // parent sets isOpen=false
  }, [onClose]);

  const apply = useCallback(() => {
    onApply(draft);
    close();
  }, [draft, onApply, close]);

  const reset = useCallback(() => {
    setDraft(defaultValue);
    onReset?.(defaultValue);
  }, [defaultValue, onReset]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>{title}</Text>
        <Pressable onPress={close}>
          <Text style={{ fontSize: 14 }}>Close</Text>
        </Pressable>
      </View>

      {/* Scrollable body */}
      <BottomSheetScrollView
        contentContainerStyle={{
          padding: 16,

          paddingBottom: 60 + insets.bottom, // 👈 must be >= footer height
        }}
      >
        {renderContent({ draft, setDraft })}
      </BottomSheetScrollView>

      {/* Sticky footer */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 40,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16 + insets.bottom, // 👈 IMPORTANT
          flexDirection: "row",
          gap: 12,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#eee",
        }}
      >
        <Pressable
          onPress={reset}
          style={{
            flex: 1,
            padding: 12,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
          }}
        >
          <Text style={{ textAlign: "center" }}>{resetLabel}</Text>
        </Pressable>

        <Pressable
          onPress={apply}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: "#ff4fa3",
            borderRadius: 10,
          }}
        >
          <Text style={{ textAlign: "center", color: "#000000" }}>
            {applyLabel}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
