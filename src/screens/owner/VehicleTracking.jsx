import React, { useState, useRef, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/authSlice";

export default function VehicleTracking() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const cameraRef = useRef(null);
  const navigation = useNavigation(); // Khởi tạo navigation
  const user = useSelector(selectUser);
  const [parkingLot, setParkingLot] = useState(null);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Fetch parking lot info for the staff
  useEffect(() => {
    const fetchParkingLot = async () => {
      try {
        // First get staff assignment
        const staffRef = collection(db, "staffAssignments");
        const q = query(staffRef, where("staffId", "==", user.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const staffAssignment = snapshot.docs[0].data();
          const parkingLotId = staffAssignment.parkingLotId;

          // Then get parking lot details
          const parkingLotRef = doc(db, "parkingLots", parkingLotId);
          const parkingLotDoc = await getDoc(parkingLotRef);

          if (parkingLotDoc.exists()) {
            const parkingLotData = parkingLotDoc.data();
            setParkingLot({
              id: parkingLotId,
              name: parkingLotData.name,
              price: parkingLotData.pricePerHour, // Get price from parking lot document
            });
          } else {
            throw new Error("Parking lot not found");
          }
        } else {
          throw new Error("Staff assignment not found");
        }
      } catch (error) {
        console.error("Error fetching parking lot:", error);
        Alert.alert("Lỗi", "Không thể lấy thông tin bãi đỗ xe");
      }
    };

    if (user?.uid) {
      fetchParkingLot();
    }
  }, [user?.uid]);

  const handleCapture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: false, // Base64 không cần thiết nếu chỉ dùng URI
        });

        const resizedPhoto = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        console.log("Resized image URI:", resizedPhoto.uri);
        recognizeLicensePlate(resizedPhoto.uri);
      } catch (error) {
        console.error("Error taking or resizing picture:", error);
        Alert.alert(
          "Lỗi",
          "Không thể chụp hoặc thay đổi kích thước ảnh. Vui lòng thử lại."
        );
      }
    } else {
      Alert.alert(
        "Lỗi",
        "Camera chưa sẵn sàng. Vui lòng đợi một lát và thử lại."
      );
    }
  };

  const createTicket = async (licensePlate) => {
    if (!parkingLot) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin bãi đỗ xe");
      return;
    }

    try {
      // Check if there's already an active ticket for this license plate
      const ticketsRef = collection(
        db,
        "parkingLots",
        parkingLot.id,
        "tickets"
      );
      const q = query(
        ticketsRef,
        where("licensePlate", "==", licensePlate),
        where("status", "==", "active")
      );
      const existingTickets = await getDocs(q);

      if (!existingTickets.empty) {
        Alert.alert("Lỗi", "Xe này đang có vé đang hoạt động");
        return;
      }

      // Lấy preference tới bãi đỗ xe
      const parkingLotRef = doc(db, "parkingLots", parkingLot.id);
      const parkingLotDoc = await getDoc(parkingLotRef);
      if (!parkingLotDoc.exists()) {
        Alert.alert("Lỗi", "Không tìm thấy bãi đỗ xe");
        return;
      }
      const lotData = parkingLotDoc.data();
      if (lotData.availableSpots !== undefined && lotData.availableSpots <= 0) {
        Alert.alert("Lỗi", "Bãi đỗ xe đã hết chỗ trống");
        return;
      }

      // Create new ticket
      const ticketData = {
        licensePlate: licensePlate.toUpperCase(),
        entryTime: serverTimestamp(),
        exitTime: null,
        status: "active",
        parkingLotId: parkingLot.id,
        parkingLotName: parkingLot.name,
        price: parkingLot.price,
        totalAmount: parkingLot.price,
        createdBy: user.uid,
        customerId: null,
      };

      await addDoc(
        collection(db, "parkingLots", parkingLot.id, "tickets"),
        ticketData
      );

      // Logic giảm số chỗ trống khi có xe vào
      if (lotData.availableSpots !== undefined) {
        await updateDoc(parkingLotRef, {
          availableSpots: lotData.availableSpots - 1,
          activeVehicles: arrayUnion(licensePlate.toUpperCase()),
        });
      }

      Alert.alert("Thành công", `Đã tạo vé cho xe ${licensePlate}`, [
        {
          text: "OK",
          onPress: () => navigation.navigate("Tickets"),
        },
      ]);
    } catch (error) {
      console.error("Error creating ticket:", error);
      Alert.alert("Lỗi", "Không thể tạo vé xe");
    }
  };

  // Update the recognizeLicensePlate function
  const recognizeLicensePlate = async (imageUri) => {
    const apiKey = "";
    const apiUrl = "https://api.platerecognizer.com/v1/plate-reader/";

    if (!apiKey) {
      Alert.alert(
        "Lỗi",
        "Vui lòng cung cấp API key hợp lệ của Plate Recognizer."
      );
      // navigation.goBack(); // Có thể quay lại nếu không có API key
      return;
    }

    const formData = new FormData();
    formData.append("upload", {
      uri: imageUri,
      name: "license-plate.jpg",
      type: "image/jpeg",
    });

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        const plate = response.data.results[0].plate;
        setLicensePlate(plate);

        // Create ticket instead of just navigating
        await createTicket(plate);
      } else {
        Alert.alert(
          "Không tìm thấy biển số",
          "Không thể nhận dạng biển số từ ảnh. Vui lòng thử lại với ảnh rõ hơn."
        );
      }
    } catch (error) {
      console.error("Lỗi khi nhận dạng biển số:", error);
      let errorMessage = "Không thể nhận dạng biển số xe.";
      if (error.response) {
        console.error("Data:", error.response.data);
        console.error("Status:", error.response.status);
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (
          error.response.status === 401 ||
          error.response.status === 403
        ) {
          errorMessage = "Lỗi xác thực API. Vui lòng kiểm tra API key.";
        } else if (
          error.response.status === 400 &&
          error.response.data.detail === "No active subscription found"
        ) {
          errorMessage =
            "Không tìm thấy gói đăng ký đang hoạt động cho API key này.";
        } else if (error.response.status === 400) {
          errorMessage =
            "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại ảnh hoặc thông số.";
        }
      }
      Alert.alert("Lỗi nhận dạng", errorMessage);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Đang yêu cầu quyền truy cập camera...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Không có quyền truy cập camera</Text>
        <Button title="Cấp quyền" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
        barcodeScannerSettings={
          {
            // Nếu không dùng quét barcode thì có thể bỏ
            // barCodeTypes: ['qr'],
          }
        }
        // onBarcodeScanned={ ... }
      />
      <View style={styles.controls}>
        <Button
          title="Chụp biển số xe"
          onPress={handleCapture}
          disabled={!isCameraReady}
        />
        {licensePlate ? (
          <Text style={styles.plateText}>Biển số vừa chụp: {licensePlate}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1, // Cho camera chiếm phần lớn không gian
  },
  controls: {
    // View chứa nút bấm và text hiển thị biển số
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)", // Nền mờ để dễ đọc chữ
  },
  message: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    margin: 20,
  },
  plateText: {
    fontSize: 18,
    color: "#00FF00", // Màu xanh lá cho dễ thấy
    textAlign: "center",
    marginTop: 15,
    fontWeight: "bold",
  },
});
