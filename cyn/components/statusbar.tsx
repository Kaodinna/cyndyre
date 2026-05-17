import React, { ReactNode } from "react";
import { StatusBar, StatusBarStyle, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CustomStatusBarProps {
  children: ReactNode;
  statusBgColor?: string;
  barStyle?: StatusBarStyle;
  bgColor?: string;
}

export default function CustomStatusBar({
  children,
  statusBgColor = "#FF6EC7",
  barStyle = "dark-content",
  bgColor = "#fff",
}: CustomStatusBarProps) {
  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: statusBgColor }}>
      <StatusBar
        backgroundColor={statusBgColor}
        barStyle={barStyle}
        translucent={false}
      />

      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={{ flex: 1, backgroundColor: bgColor }}
      >
        {children}
      </SafeAreaView>
    </SafeAreaView>
  );
}
