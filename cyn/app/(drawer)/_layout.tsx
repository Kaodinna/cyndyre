import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomDrawer from "@/components/CustomDrawer";
export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }} className="bg-[#FF00B8]">
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: "#FF00B8",
            padding: 0,
          },
        }}
        drawerContent={(props) => <CustomDrawer {...props} />}
      >
        <Drawer.Screen name="(tabs)" />
      </Drawer>
    </GestureHandlerRootView>
  );
}
