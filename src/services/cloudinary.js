import * as FileSystem from "expo-file-system";

export const uploadToCloudinary = async (uri) => {
  const CLOUD_NAME = "dfcwt6tyh"; // Thay bằng cloud name của bạn
  const UPLOAD_PRESET = "parking_lot_upload"; // Tên upload preset đã tạo

  // Chuyển đổi ảnh sang base64
  const base64Img = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const formData = new FormData();
  formData.append("file", `data:image/jpeg;base64,${base64Img}`);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const data = await response.json();
    return data.secure_url; // Trả về URL public của ảnh
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  }
};
