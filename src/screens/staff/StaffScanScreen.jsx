import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, Image as ImageIcon, Check, X } from "lucide-react-native";

export default function StaffScanScreen() {
  const [scannedPlate, setScannedPlate] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Mock function to simulate scanning
  const startScanning = () => {
    setIsScanning(true);

    // Simulate a scan after 2 seconds
    setTimeout(() => {
      setScannedPlate("51F-123.45");
      setIsScanning(false);
    }, 2000);
  };

  const resetScan = () => {
    setScannedPlate(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.cameraContainer}>
          {isScanning ? (
            <View style={styles.scanningView}>
              <Text style={styles.scanningText}>Đang quét biển số...</Text>
            </View>
          ) : scannedPlate ? (
            <View style={styles.resultView}>
              <View style={styles.plateContainer}>
                <Text style={styles.plateText}>{scannedPlate}</Text>
              </View>
              <Text style={styles.resultText}>
                Biển số xe đã được nhận diện
              </Text>
            </View>
          ) : (
            <View style={styles.placeholderView}>
              <Camera size={48} color="#9CA3AF" />
              <Text style={styles.placeholderText}>
                Đặt camera hướng vào biển số xe
              </Text>
            </View>
          )}
        </View>

        {scannedPlate ? (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={resetScan}>
              <X size={24} color="#ffffff" />
              <Text style={styles.actionButtonText}>Quét lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
            >
              <Check size={24} color="#ffffff" />
              <Text style={styles.actionButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.scanButtonsContainer}>
            <TouchableOpacity style={styles.scanButton} onPress={startScanning}>
              <Camera size={24} color="#ffffff" />
              <Text style={styles.scanButtonText}>Quét biển số</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.scanButton, styles.uploadButton]}>
              <ImageIcon size={24} color="#4F46E5" />
              <Text style={[styles.scanButtonText, styles.uploadButtonText]}>
                Tải ảnh lên
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Hướng dẫn quét biển số</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>1</Text>
            </View>
            <Text style={styles.infoText}>Đặt camera thẳng với biển số xe</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>2</Text>
            </View>
            <Text style={styles.infoText}>
              Đảm bảo đủ ánh sáng và biển số sạch sẽ
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>3</Text>
            </View>
            <Text style={styles.infoText}>
              Giữ camera ổn định trong quá trình quét
            </Text>
          </View>
        </View>
      </View>
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
  cameraContainer: {
    height: 300,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  placeholderView: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
  },
  scanningView: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  resultView: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  plateContainer: {
    backgroundColor: "#FFFF00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000000",
    marginBottom: 16,
  },
  plateText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  resultText: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "bold",
  },
  scanButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  scanButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    padding: 16,
    marginRight: 8,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 8,
  },
  uploadButton: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#4F46E5",
    marginRight: 0,
    marginLeft: 8,
  },
  uploadButtonText: {
    color: "#4F46E5",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    borderRadius: 8,
    padding: 16,
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: "#10B981",
    marginRight: 0,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
  },
});
