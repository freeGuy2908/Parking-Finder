import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ParkingLotManagement from "./ParkingLotManagement";
import VehicleTracking from "./VehicleTracking";
import Profile from "./Profile";

const Tab = createBottomTabNavigator();

export default function OwnerTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Quản lý" component={ParkingLotManagement} />
      <Tab.Screen name="Theo dõi xe" component={VehicleTracking} />
      <Tab.Screen name="Tài khoản" component={Profile} />
    </Tab.Navigator>
  );
}
