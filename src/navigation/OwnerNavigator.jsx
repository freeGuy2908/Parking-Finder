import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
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
import EditLotScreen from "../screens/owner/manage/EditLotScreen";
import ParkingLotDetailScreen from "../screens/owner/manage/ParkingLotDetailScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function OwnerTabs() {
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

export default function OwnerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InOwnerTabs" component={OwnerTabs} />
      <Stack.Screen
        name="ParkingDetail"
        component={ParkingLotDetailScreen}
        options={{
          headerShown: true,
          title: "Chi tiết bãi đỗ",
          presentation: "card",
          animationTypeForReplace: "push",
        }}
      />
      <Stack.Screen
        name="EditParking"
        component={EditLotScreen}
        options={{
          headerShown: true,
          title: "Chỉnh sửa thông tin bãi đỗ",
          presentation: "card",
          animationTypeForReplace: "push",
        }}
      />
    </Stack.Navigator>
  );
}
