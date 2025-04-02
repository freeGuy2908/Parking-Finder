import { StyleSheet } from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./src/screens/HomeScreen";
import CustomerNavigator from "./src/navigation/CustomerNavigator";
import OwnerNavigator from "./src/navigation/OwnerNavigator";
import StaffNavigator from "./src/navigation/StaffNavigator";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CustomerTabs"
            component={CustomerNavigator}
            options={{ headerShown: false, title: "Khách" }}
          />
          <Stack.Screen
            name="OwnerTabs"
            component={OwnerNavigator}
            options={{ headerShown: false, title: "Chủ bãi xe" }}
          />
          <Stack.Screen
            name="StaffTabs"
            component={StaffNavigator}
            options={{ headerShown: false, title: "Nhân viên" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
