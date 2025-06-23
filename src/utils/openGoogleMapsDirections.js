import { Linking } from "react-native";
import * as Location from "expo-location";
import { getLatLngFromAddress } from "./getLatLngFromAddress";

export const openGoogleMapsDirections = async (
  originLocation,
  destinationLocation
) => {
  try {
    // 1. Lay vi tri hien tai
    // const { status } = await Location.requestForegroundPermissionsAsync();
    // if (status !== "granted") {
    //   alert("Không được cấp quyền truy cập vị trí");
    //   return;
    // }
    // const currentLoc = await Location.getCurrentPositionAsync({});
    // const origin = `${currentLoc.coords.latitude}, ${currentLoc.coords.longitude}`;

    // Chuyen dia chi thanh toa do
    // const desCoords = await getLatLngFromAddress(destinationAddress);
    // const destination = `${desCoords.lat}, ${desCoords.lng}`;

    // Mo Google Maps
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originLocation}&destination=${destinationLocation}&travelmode=driving`;
    Linking.openURL(url);
  } catch (error) {
    console.error("Lỗi khi chỉ đường: ", error);
    alert("Không thể tìm đường đi. Vui lòng thử lại.");
  }
};
