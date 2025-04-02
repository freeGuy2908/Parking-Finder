import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home,
  LayoutDashboard,
  PlusCircle,
  Settings,
  User,
} from "lucide-react-native";

import OwnerDashboardScreen from "../screens/owner/OwnerDashboardScreen";
import OwnerRegisterParkingScreen from "../screens/owner/OwnerRegisterParkingScreen";
import OwnerManageParkingScreen from "../screens/owner/OwnerManageParkingScreen";
import CustomerProfileScreen from "../screens/customer/CustomerProfileScreen";
import HomeButton from "../components/HomeButton";

const Tab = createBottomTabNavigator();

export default function OwnerNavigator() {
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
        name="Dashboard"
        component={OwnerDashboardScreen}
        options={{
          title: "Tổng quan",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RegisterParking"
        component={OwnerRegisterParkingScreen}
        options={{
          title: "Đăng ký bãi đỗ",
          tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="ManageParking"
        component={OwnerManageParkingScreen}
        options={{
          title: "Quản lý",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
