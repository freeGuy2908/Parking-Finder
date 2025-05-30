import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Info, Camera, Trash2 } from "lucide-react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { styles } from "../styles/formStyle";

/** expo import */
import * as ImagePicker from "expo-image-picker";

/** firebase import */
import { db } from "../../../../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/** cloudinary import */
import { uploadToCloudinary } from "../../../services/cloudinary";

export default function EditLotScreen() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [totalSpots, setTotalSpots] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [removedImageUrls, setRemovedImageUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();
  const route = useRoute();
  const parkingLotId = route.params?.lot?.id;
  useFocusEffect(
    useCallback(() => {
      console.log("Parking Lot ID:", parkingLotId);
    }, [parkingLotId])
  );

  useEffect(() => {
    if (!parkingLotId) {
      console.log("Không tìm thấy ID bãi đỗ xe");
      setIsLoading(false);
      return;
    }

    const fetchParkingLotData = async () => {
      try {
        const docRef = doc(db, "parkingLots", parkingLotId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setAddress(data.address || "");
          setTotalSpots(data.totalSpots?.toString() || "");
          setPricePerHour(data.pricePerHour?.toString() || "");
          setDescription(data.description || "");
          setExistingImageUrls(data.images || []);
        } else {
          console.log("Không tìm thấy dữ liệu bãi đỗ xe");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bãi đỗ xe:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParkingLotData();
  }, [parkingLotId]);

  const handlePickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền truy cập", "Quyền truy cập thư viện bị từ chối");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        setImages([...images, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
    }
  };

  const handleRemoveNewImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleRemoveExistingImage = (url) => {
    setExistingImageUrls(
      existingImageUrls.filter((imageUrl) => imageUrl !== url)
    );
    setRemovedImageUrls([...removedImageUrls, url]);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Tải lên ảnh mới
      const uploadPromises = images.map((uri) => uploadToCloudinary(uri));
      const newImageUrls = await Promise.all(uploadPromises);

      // Kết hợp ảnh hiện có (không bị xóa) và ảnh mới
      const updatedImageUrls = [...existingImageUrls, ...newImageUrls];

      // Cập nhật thông tin bãi đỗ xe trong Firestore
      const parkingRef = doc(db, "parkingLots", parkingLotId);
      await updateDoc(parkingRef, {
        name,
        address,
        totalSpots: parseInt(totalSpots),
        pricePerHour: parseInt(pricePerHour),
        description,
        images: updatedImageUrls,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Thành công", "Cập nhật thông tin bãi đỗ xe thành công!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Lỗi khi cập nhật bãi đỗ xe:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

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

        {/* Hiển thị ảnh hiện có */}
        {existingImageUrls.length > 0 && (
          <>
            <Text style={styles.subSectionTitle}>Ảnh hiện tại</Text>
            <View style={styles.imagePreviewContainer}>
              {existingImageUrls.map((url, index) => (
                <View key={`existing-${index}`} style={styles.imageWrapper}>
                  <Image source={{ uri: url }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => handleRemoveExistingImage(url)}
                  >
                    <Trash2 size={18} color="#FF4040" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Thêm ảnh mới */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePickImages}
        >
          <Camera size={24} color="#4F46E5" />
          <Text style={styles.uploadButtonText}>
            {images.length > 0
              ? `Đã chọn thêm ${images.length} ảnh mới`
              : "Thêm hình ảnh mới"}
          </Text>
        </TouchableOpacity>

        {/* Hiển thị preview ảnh mới */}
        {images.length > 0 && (
          <>
            <Text style={styles.subSectionTitle}>Ảnh mới</Text>
            <View style={styles.imagePreviewContainer}>
              {images.map((uri, index) => (
                <View key={`new-${index}`} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => handleRemoveNewImage(index)}
                  >
                    <Trash2 size={18} color="#FF4040" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.infoBox}>
          <Info size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            Thay đổi thông tin bãi đỗ xe có thể cần được kiểm duyệt lại trước
            khi hiển thị trên ứng dụng.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Cập nhật thông tin</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
