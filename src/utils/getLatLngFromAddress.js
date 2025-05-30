export const getLatLngFromAddress = async (address) => {
  const apiKey = "";
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`
  );
  const data = await response.json();
  console.log("Kết quả từ Google Maps API:", data);
  if (data.status === "OK") {
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } else {
    throw new Error("Không tìm thấy vị trí từ địa chỉ");
  }
};
