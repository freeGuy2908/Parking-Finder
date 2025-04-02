import { createStackNavigator } from "@react-navigation/stack";
import MyParkingLot from "./MyParkingLot";
import RegisterParkingLot from "./RegisterParkingLot";
import EditParkingLot from "./EditParkingLot";

const Stack = createStackNavigator();

export default function ParkingLotManagement() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyParkingLot" component={MyParkingLot} />
      <Stack.Screen name="RegisterParkingLot" component={RegisterParkingLot} />
      <Stack.Screen name="EditParkingLot" component={EditParkingLot} />
    </Stack.Navigator>
  );
}
