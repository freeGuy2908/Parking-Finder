import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Info, Camera } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles/formStyle";

/** expo import */
import * as ImagePicker from "expo-image-picker";

/** firebase import */
import { db } from "../../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/** cloudinary import */
import { uploadToCloudinary } from "../../services/cloudinary";

/** redux import */
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/authSlice";

import { getLatLngFromAddress } from "../../utils/getLatLngFromAddress";

export default function OwnerRegisterParkingScreen() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [totalSpots, setTotalSpots] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [bankId, setBankId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useNavigation();

  const user = useSelector(selectUser);

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

    if (
      !name.trim() ||
      !address.trim() ||
      !totalSpots.trim() ||
      !pricePerHour.trim() ||
      !description.trim() ||
      !bankId.trim() ||
      !bankAccount.trim() ||
      images.length === 0
    ) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ tất cả các thông tin và ít nhất 1 hình ảnh."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // lấy location từ address
      let geoLocation = null;
      try {
        const { lat, lng } = await getLatLngFromAddress(address);
        geoLocation = { latitude: lat, longitude: lng };
      } catch (error) {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy vị trí từ địa chỉ. Vui lòng nhập lại."
        );
        setIsSubmitting(false);
        return;
      }

      const uploadPromises = images.map((uri) => uploadToCloudinary(uri));
      const imageUrls = await Promise.all(uploadPromises);

      // Luu trữ thông tin bãi đỗ xe vào Firestore
      const docRef = await addDoc(collection(db, "parkingLots"), {
        name,
        address,
        location: geoLocation,
        totalSpots: parseInt(totalSpots),
        availableSpots: parseInt(totalSpots),
        pricePerHour: parseInt(pricePerHour),
        description,
        images: imageUrls,
        ownerId: user.uid,
        status: "pending",
        createdAt: serverTimestamp(),
        activeVehicles: [],
        staffs: [],
        bankId: bankId.trim().toLowerCase(),
        bankAccount: bankAccount.trim(),
      });
      Alert.alert("Thành công", "Đăng ký bãi đỗ xe thành công!");
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
            {/* <TouchableOpacity style={styles.mapButton}>
              <MapPin size={20} color="#4F46E5" />
            </TouchableOpacity> */}
          </View>
          <Text style={styles.tooltipText}>
            Vui lòng nhập địa chỉ theo số nhà, xã/phường/thị trấn,
            quận/huyện/thành phố, tỉnh để ứng dụng xác định được tọa độ chính
            xác. VD: 55 Trần Đại Nghĩa, Bách Khoa, Hai Bà Trưng, Hà Nội
          </Text>
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên ngân hàng nhận thanh toán</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: viettinbank"
            value={bankId}
            onChangeText={setBankId}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Số tài khoản nhận thanh toán</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số tài khoản"
            value={bankAccount}
            onChangeText={setBankAccount}
            keyboardType="numeric"
          />
        </View>

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

        {/* <View style={styles.infoBox}>
          <Info size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            Thông tin bãi đỗ xe sẽ được kiểm duyệt trước khi hiển thị trên ứng
            dụng.
          </Text>
        </View> */}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Đăng ký bãi đỗ xe</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
