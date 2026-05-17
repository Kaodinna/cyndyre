// import React, { useEffect, useState } from "react";
// import { Redirect } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { View, Text } from "react-native";

// const Index = () => {
//   const [initialRoute, setInitialRoute] = useState<any>(null);

//   useEffect(() => {
//     const checkOnboardingStatus = async () => {
//       try {
//         const hasLaunched = await AsyncStorage.getItem("hasLaunched");
//         if (hasLaunched === null) {
//           setInitialRoute("/onboardingOne");
//           await AsyncStorage.setItem("hasLaunched", "true");
//         } else {
//           setInitialRoute("/(tabs)");
//         }
//       } catch (error) {
//         console.error("Failed to check app launch status:", error);
//       }
//     };

//     checkOnboardingStatus();
//   }, []);

//   if (initialRoute === null) {
//     // You can render a loading screen or return null while checking the initial route
//     return (
//       <View>
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   return <Redirect href={initialRoute} />;
// };

// export default Index;
import React, { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text } from "react-native";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  exp: number;
};

const Index = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // 1️⃣ Onboarding
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        if (hasLaunched === null) {
          await AsyncStorage.setItem("hasLaunched", "true");
          setInitialRoute("/onboardingOne");
          return;
        }

        // 2️⃣ Get stored user
        const userDataString = await AsyncStorage.getItem("customerData");

        // 👉 No stored user
        if (!userDataString) {
          setInitialRoute("/(drawer)/(tabs)");
          return;
        }

        const userData = JSON.parse(userDataString);
        const { accessToken, role } = userData;

        // 👉 No token at all
        if (!accessToken) {
          setInitialRoute("/(drawer)/(tabs)");
          return;
        }

        try {
          const decoded = jwtDecode<JwtPayload>(accessToken);
          const isExpired = Date.now() >= decoded.exp * 1000;

          if (isExpired) {
            if (role === "businessOwner") {
              await AsyncStorage.removeItem("customerData");
              setInitialRoute("/login");
            } else {
              setInitialRoute("/(drawer)/(tabs)");
            }
            return;
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
          setInitialRoute("/login");
          return;
        }

        if (role === "businessOwner") {
          setInitialRoute("/(drawer)/(tabs)");
        } else {
          setInitialRoute("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking initial route:", error);
        setInitialRoute("/login");
      }
    };

    checkInitialRoute();
  }, []);

  if (!initialRoute) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <Redirect href={initialRoute as any} />;
};

export default Index;
