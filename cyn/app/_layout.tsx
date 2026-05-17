import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { View, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { persistor, store } from "@/components/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { Host } from "react-native-portalize";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import {
  Manrope_400Regular,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  Manrope_600SemiBold,
  Manrope_500Medium,
} from "@expo-google-fonts/manrope";
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import {
  LibreCaslonText_400Regular,
  LibreCaslonText_400Regular_Italic,
  LibreCaslonText_700Bold,
} from "@expo-google-fonts/libre-caslon-text";
import {
  Raleway_100Thin,
  Raleway_200ExtraLight,
  Raleway_300Light,
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
  Raleway_800ExtraBold,
  Raleway_900Black,
  Raleway_100Thin_Italic,
  Raleway_200ExtraLight_Italic,
  Raleway_300Light_Italic,
  Raleway_400Regular_Italic,
  Raleway_500Medium_Italic,
  Raleway_600SemiBold_Italic,
  Raleway_700Bold_Italic,
  Raleway_800ExtraBold_Italic,
  Raleway_900Black_Italic,
} from "@expo-google-fonts/raleway";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { JsStack } from "@/components/JsStack";
SplashScreen.preventAutoHideAsync();
import { Easing } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/reusables";
import Drawer from "expo-router/drawer";
import { AuthProvider } from "@/components/AuthContext";
const ANIMATION_DURATION = 400;
const ROTATE_VALUES = ["60deg", "45deg", "30deg", "15deg", "0deg"];

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Raleway_700Bold_Italic,
    Inter_600SemiBold,
    LibreCaslonText_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_400Regular,
    Manrope_700Bold,
    Inter_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Host>
        <AuthProvider>
          <Provider store={store}>
            <Toast config={toastConfig} />

            <PersistGate loading={null} persistor={persistor}>
              <JsStack
                screenOptions={{
                  transitionSpec: {
                    open: {
                      animation: "timing",
                      config: {
                        duration: ANIMATION_DURATION,
                        easing: Easing.out(Easing.ease),
                      },
                    },
                    close: {
                      animation: "timing",
                      config: {
                        duration: ANIMATION_DURATION,
                        easing: Easing.in(Easing.ease),
                      },
                    },
                  },
                  cardOverlayEnabled: true,
                  gestureEnabled: Platform.OS === "ios",
                  cardStyleInterpolator: ({ current, next, layouts }) => {
                    // Calculate rotation for a subtle effect
                    const rotate = current.progress.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: ROTATE_VALUES,
                      extrapolate: "clamp",
                    });

                    const INITIAL_SCALE = 1.6;
                    const FINAL_SCALE = 1;

                    const OVERLAY_OPACITY_MAX = 0.5;
                    const NEXT_SCREEN_OPACITY_MIN = 0.8;

                    const overlayOpacity = current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, OVERLAY_OPACITY_MAX],
                      extrapolate: "clamp",
                    });

                    const nextScreenOpacity = current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [NEXT_SCREEN_OPACITY_MIN, 1],
                      extrapolate: "clamp",
                    });
                    // Calculate scale for zooming effect on the next screen
                    const scale = next
                      ? next.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, FINAL_SCALE],
                          extrapolate: "clamp",
                        })
                      : current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [INITIAL_SCALE, 1],
                          extrapolate: "clamp",
                        });

                    const INITIAL_TRANSLATE_X_MULTIPLIER = 1.6;
                    const NEXT_TRANSLATE_X_MULTIPLIER = -0.3;

                    // Calculate translateX for the current screen
                    const translateX = current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        INITIAL_TRANSLATE_X_MULTIPLIER * layouts.screen.width,
                        0,
                      ],
                      extrapolate: "clamp",
                    });

                    // Calculate translateX for the next screen (if exists)
                    const nextTranslateX = next
                      ? next.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            0,
                            NEXT_TRANSLATE_X_MULTIPLIER * layouts.screen.width,
                          ],
                          extrapolate: "clamp",
                        })
                      : 0;

                    const transform = [
                      { translateX },
                      { translateX: nextTranslateX },
                      { perspective: 1000 },
                      { rotateY: rotate },
                      { scale },
                    ];
                    // const customEasing = Easing.bezier(0.5, 0.1, 0.5, 1.0);
                    return {
                      cardStyle: {
                        transform,
                        opacity: nextScreenOpacity,
                        // transitionTimingFunction: customEasing,
                      },
                      overlayStyle: { opacity: overlayOpacity },
                    };
                  },
                }}
              >
                <JsStack.Screen name="index" options={{ headerShown: false }} />
                <JsStack.Screen
                  name="(drawer)"
                  options={{ headerShown: false }}
                />

                <JsStack.Screen
                  name="notification"
                  options={{
                    headerShown: true,
                    title: "Notifications",
                    // headerBackTitleVisible: false,
                    headerTitleStyle: {
                      fontFamily: "Manrope_700Bold",
                      fontSize: 18,
                    },
                    headerBackground: () => (
                      <View style={{ flex: 1, backgroundColor: "#F8F8FF" }} />
                    ),
                  }}
                />
                <JsStack.Screen
                  name="profile"
                  options={{
                    headerShown: true,
                    title: "Profile",
                    // headerBackTitleVisible: false,
                    headerTitleStyle: {
                      fontFamily: "Manrope_700Bold",
                      fontSize: 18,
                    },
                    headerBackground: () => (
                      <View style={{ flex: 1, backgroundColor: "#F8F8FF" }} />
                    ),
                  }}
                />
                <JsStack.Screen
                  name="shippingAddress"
                  options={{
                    headerShown: true,
                    title: "Shipping Address",
                    headerBackTitle: "",
                    headerTitleStyle: {
                      fontFamily: "Manrope_700Bold",
                      fontSize: 18,
                    },
                    headerBackground: () => (
                      <View style={{ flex: 1, backgroundColor: "#F8F8FF" }} />
                    ),
                  }}
                />
                <JsStack.Screen
                  name="myOrders"
                  options={{
                    headerShown: true,
                    title: "My Orders",
                    // headerBackTitleVisible: false,
                    headerBackTitle: "",
                    headerTitleStyle: {
                      fontFamily: "Manrope_700Bold",
                      fontSize: 18,
                    },
                    headerBackground: () => (
                      <View style={{ flex: 1, backgroundColor: "#F8F8FF" }} />
                    ),
                  }}
                />
                <JsStack.Screen
                  name="orderConfirmation"
                  options={{
                    headerShown: true,
                    title: "Order Confirmation",

                    headerBackTitle: "",
                    headerTitleStyle: {
                      fontFamily: "Manrope_700Bold",
                      fontSize: 18,
                    },
                    headerBackground: () => (
                      <View style={{ flex: 1, backgroundColor: "#F8F8FF" }} />
                    ),
                  }}
                />

                <JsStack.Screen
                  name="onboardingOne"
                  options={{ headerShown: false }}
                />

                <JsStack.Screen name="chat" options={{ headerShown: false }} />
                <JsStack.Screen
                  name="availabilityScreen"
                  options={{ headerShown: false }}
                />
                <JsStack.Screen name="banks" options={{ headerShown: false }} />
                <JsStack.Screen
                  name="serviceProviderProfile"
                  options={{ headerShown: false }}
                />

                <JsStack.Screen
                  name="createListing"
                  options={{ headerShown: false }}
                />
                <JsStack.Screen
                  name="onboardingTwo"
                  options={{ headerShown: false }}
                />
                <JsStack.Screen
                  name="onboardingThree"
                  options={{ headerShown: false }}
                />
                <JsStack.Screen
                  name="getStarted"
                  options={{ headerShown: false }}
                />
                <JsStack.Screen
                  name="serviceProvider/[id]"
                  options={{ headerShown: false }}
                />
                <JsStack.Screen
                  name="signup"
                  options={{ headerShown: false }}
                />
                <JsStack.Screen
                  name="verifyEmail"
                  options={{ headerShown: false }}
                />
                <JsStack.Screen name="login" options={{ headerShown: false }} />
                <JsStack.Screen
                  name="forgotPassword"
                  options={{ headerShown: false }}
                />
                {/* <JsStack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
                <JsStack.Screen
                  name="product/[id]"
                  options={{ headerShown: false }}
                />
                <JsStack.Screen
                  name="orderDetail/[id]"
                  options={{ headerShown: false }}
                />
                <JsStack.Screen
                  name="periodTrackerScreen"
                  // options={{ headerShown: true }}
                  options={{
                    headerShown: true,
                    title: "Period Tracker",

                    headerBackTitle: "",
                    headerTitleStyle: {
                      fontFamily: "Manrope_700Bold",
                      fontSize: 18,
                    },
                    headerBackground: () => (
                      <View style={{ flex: 1, backgroundColor: "#F8F8FF" }} />
                    ),
                  }}
                />
                <JsStack.Screen
                  name="myBookings"
                  // options={{ headerShown: true }}
                  options={{
                    headerShown: true,
                    title: "My Bookings",

                    headerBackTitle: "",
                    headerTitleStyle: {
                      fontFamily: "Manrope_700Bold",
                      fontSize: 18,
                    },
                    headerBackground: () => (
                      <View style={{ flex: 1, backgroundColor: "#F8F8FF" }} />
                    ),
                  }}
                />
                <JsStack.Screen
                  name="productCategory/[id]"
                  options={{ headerShown: false }}
                />
              </JsStack>
            </PersistGate>
          </Provider>
        </AuthProvider>
      </Host>
    </GestureHandlerRootView>
  );
}
