import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Info, Camera } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

/** expo import */
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";

/** firebase import */
import { db } from "../../../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  GeoPoint,
} from "firebase/firestore";

/** cloudinary import */
import { uploadToCloudinary } from "../../services/cloudinary";

export default function OwnerRegisterParkingScreen() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [totalSpots, setTotalSpots] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState(null); // Lưu tọa độ tạm khi chọn trên map

  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // Mở modal bản đồ
  const openMapModal = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Permission denied");

      // Nếu đã có vị trí cũ, dùng làm vị trí khởi tạo
      if (location) setTempLocation(location);
      setIsMapVisible(true);
    } catch (err) {
      alert("Cần cấp quyền vị trí để sử dụng tính năng này");
    }
  };

  // Xác nhận vị trí từ modal
  const confirmLocation = async () => {
    if (!tempLocation) return;

    setLocation(tempLocation);
    setIsMapVisible(false);

    // Reverse geocoding để lấy địa chỉ
    const addressResponse = await Location.reverseGeocodeAsync(tempLocation);
    if (addressResponse[0]) {
      const { street, city, region } = addressResponse[0];
      setAddress([street, city, region].filter(Boolean).join(", "));
    }
  };

  const handlePickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Quyền truy cập thư viện bị từ chối");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        setImages(result.assets.map((asset) => asset.uri));
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const uploadPromises = images.map((uri) => uploadToCloudinary(uri));
      const imageUrls = await Promise.all(uploadPromises);

      // Luu trữ thông tin bãi đỗ xe vào Firestore
      const docRef = await addDoc(collection(db, "parkingLots"), {
        name,
        address,
        totalSpots: parseInt(totalSpots),
        pricePerHour: parseInt(pricePerHour),
        description,
        images: imageUrls,
        location: new GeoPoint(location.latitude, location.longitude),
        ownerId: "ownerId",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      console.log("Đăng ký thành công! ID: ", docRef.id);
    } catch (error) {
      setError("Lỗi khi đăng ký: " + error.message);
      console.error("Lỗi khi đăng ký bãi đỗ xe:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên bãi đỗ xe</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên bãi đỗ xe"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Địa chỉ</Text>
          <View style={styles.addressInputContainer}>
            <TextInput
              style={styles.addressInput}
              placeholder="Nhập địa chỉ bãi đỗ xe"
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <TouchableOpacity style={styles.mapButton} onPress={openMapModal}>
              <MapPin size={20} color="#4F46E5" />
            </TouchableOpacity>

            {/* Hiển thị thông báo lỗi */}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
          {/* Modal Map Picker */}
          <Modal visible={isMapVisible} animationType="slide">
            <View style={{ flex: 1 }}>
              {/* Bản đồ */}
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: tempLocation?.latitude || 10.762622,
                  longitude: tempLocation?.longitude || 106.660172,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={(e) => setTempLocation(e.nativeEvent.coordinate)}
              >
                {tempLocation && <Marker coordinate={tempLocation} />}
              </MapView>

              {/* Thanh công cụ */}
              <View style={styles.mapToolbar}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsMapVisible(false)}
                >
                  <Text>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmLocation}
                  disabled={!tempLocation}
                >
                  <Text style={{ color: "black" }}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tổng số chỗ đỗ</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số lượng chỗ đỗ"
            value={totalSpots}
            onChangeText={setTotalSpots}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Giá tiền (VND/giờ)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập giá tiền"
            value={pricePerHour}
            onChangeText={setPricePerHour}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập mô tả về bãi đỗ xe"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* <Text style={styles.sectionTitle}>Thời gian hoạt động</Text>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Mở cửa 24/7</Text>
          <Switch
            value={isOpen24Hours}
            onValueChange={setIsOpen24Hours}
            trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }}
            thumbColor={isOpen24Hours ? "#4F46E5" : "#9CA3AF"}
          />
        </View>

        {!isOpen24Hours && (
          <View style={styles.timeContainer}>
            <View style={styles.timeInputGroup}>
              <Text style={styles.timeLabel}>Giờ mở cửa</Text>
              <TextInput
                style={styles.timeInput}
                value={openTime}
                onChangeText={setOpenTime}
              />
            </View>

            <View style={styles.timeInputGroup}>
              <Text style={styles.timeLabel}>Giờ đóng cửa</Text>
              <TextInput
                style={styles.timeInput}
                value={closeTime}
                onChangeText={setCloseTime}
              />
            </View>
          </View>
        )} */}

        <Text style={styles.sectionTitle}>Hình ảnh bãi đỗ xe</Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePickImages}
        >
          <Camera size={24} color="#4F46E5" />
          <Text style={styles.uploadButtonText}>
            {images.length > 0
              ? `Đã chọn ${images.length} ảnh`
              : "Thêm hình ảnh"}
          </Text>
        </TouchableOpacity>

        {/* Hiển thị preview ảnh đã chọn */}
        <View style={styles.imagePreviewContainer}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.imagePreview} />
          ))}
        </View>

        <View style={styles.infoBox}>
          <Info size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            Thông tin bãi đỗ xe sẽ được kiểm duyệt trước khi hiển thị trên ứng
            dụng.
          </Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Đăng ký bãi đỗ xe</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  textArea: {
    height: 100,
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  mapButton: {
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: "#1F2937",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeInputGroup: {
    width: "48%",
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4F46E5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4F46E5",
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
