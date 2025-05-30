import * as Location from "expo-location";

export const getUserLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    alert("Quyền truy cập vị trí bị từ chối");
    return;
  }

  let currentLoc = await Location.getCurrentPositionAsync({});
  return {
    latitude: currentLoc.coords.latitude,
    longitude: currentLoc.coords.longitude,
  };
};
