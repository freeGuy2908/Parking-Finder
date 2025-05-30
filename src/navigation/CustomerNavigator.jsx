import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Map, Car, User } from "lucide-react-native";

import CustomerMapScreen from "../screens/customer/CustomerMapScreen";
import CustomerParkingStatusScreen from "../screens/customer/CustomerParkingStatusScreen";
import CustomerProfileScreen from "../screens/customer/CustomerProfileScreen";
import HomeButton from "../components/HomeButton";

import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../redux/authSlice";

const Tab = createBottomTabNavigator();

export default function CustomerNavigator() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        //headerShown: false,
        headerRight: () => <HomeButton />,
      }}
    >
      <Tab.Screen
        name="Map"
        component={CustomerMapScreen}
        options={{
          title: "Tìm bãi đỗ",
          tabBarIcon: ({ color }) => <Map size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="ParkingStatus"
        component={CustomerParkingStatusScreen}
        options={{
          title: "Xe của tôi",
          tabBarIcon: ({ color }) => <Car size={24} color={color} />,
        }}
      />
      {isAuthenticated && (
        <Tab.Screen
          name="Profile"
          component={CustomerProfileScreen}
          options={{
            title: "Tài khoản",
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
}
