import axios from "axios";

export const getDistance = async (originCoords, destinationAddress) => {
  try {
    const origin = `${originCoords.latitude},${originCoords.longitude}`;
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: origin,
          destinations: destinationAddress,
          key: "",
          language: "vi",
        },
      }
    );

    const result = response.data.rows[0].elements[0];
    if (result.status === "OK") {
      //console.log("Khoảng cách:", result);
      return result.distance;
    } else {
      console.warn("Không thể lấy khoảng cách:", result.status);
      return "N/A";
    }
  } catch (error) {
    console.error("Lỗi khi gọi Distance Matrix API:", error);
    return "N/A";
  }
};
