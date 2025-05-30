import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
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

import { useSelector } from "react-redux";
import { selectUser } from "../../redux/authSlice";

export default function OwnerRegisterParkingScreen() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [totalSpots, setTotalSpots] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
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
        ownerId: user.uid,
        status: "pending",
        createdAt: serverTimestamp(),
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
            <TouchableOpacity style={styles.mapButton}>
              <MapPin size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
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
