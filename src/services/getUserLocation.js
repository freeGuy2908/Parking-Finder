import * as Location from "expo-location";

export const getUserLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Quyền truy cập vị trí bị từ chối");
    return null;
  }

  let location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};
