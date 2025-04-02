import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Info, Camera } from "lucide-react-native";

export default function OwnerRegisterParkingScreen() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [totalSpots, setTotalSpots] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen24Hours, setIsOpen24Hours] = useState(false);
  const [openTime, setOpenTime] = useState("07:00");
  const [closeTime, setCloseTime] = useState("22:00");

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

        <Text style={styles.sectionTitle}>Thời gian hoạt động</Text>

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
        )}

        <Text style={styles.sectionTitle}>Hình ảnh bãi đỗ xe</Text>

        <TouchableOpacity style={styles.uploadButton}>
          <Camera size={24} color="#4F46E5" />
          <Text style={styles.uploadButtonText}>Thêm hình ảnh</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Info size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            Thông tin bãi đỗ xe sẽ được kiểm duyệt trước khi hiển thị trên ứng
            dụng.
          </Text>
        </View>

        <TouchableOpacity style={styles.submitButton}>
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
});
