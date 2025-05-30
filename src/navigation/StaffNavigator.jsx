import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Camera, QrCode, DollarSign, User } from "lucide-react-native";

import StaffScanScreen from "../screens/staff/StaffScanScreen";
import VehicleTracking from "../screens/owner/VehicleTracking";
import StaffTicketsScreen from "../screens/staff/StaffTicketsScreen";
import StaffPaymentScreen from "../screens/staff/StaffPaymentScreen";
import CustomerProfileScreen from "../screens/customer/CustomerProfileScreen";
import HomeButton from "../components/HomeButton";

const Tab = createBottomTabNavigator();

export default function StaffNavigator() {
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
        name="Scan"
        component={VehicleTracking}
        options={{
          title: "Quét biển số",
          tabBarIcon: ({ color }) => <Camera size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tickets"
        component={StaffTicketsScreen}
        options={{
          title: "Vé xe",
          tabBarIcon: ({ color }) => <QrCode size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Payment"
        component={StaffPaymentScreen}
        options={{
          title: "Thanh toán",
          tabBarIcon: ({ color }) => <DollarSign size={24} color={color} />,
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
