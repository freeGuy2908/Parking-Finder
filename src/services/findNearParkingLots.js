import { calculateDistance } from "../utils/distanceCalculator";

export const findNearParkingLots = (userLocation, parkingLots, limit = 5) => {
  if (!userLocation || !parkingLots) return [];

  // Tính khoảng cách và thêm vào mỗi bãi xe
  const lotsWithDistance = parkingLots.map((lot) => ({
    ...lot,
    distance: calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      lot.location.latitude,
      lot.location.longitude
    ),
  }));

  // Sắp xếp theo khoảng cách và giới hạn số lượng
  return lotsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};
