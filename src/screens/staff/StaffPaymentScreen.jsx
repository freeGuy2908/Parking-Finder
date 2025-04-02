import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  QrCode,
  Clock,
  Calendar,
  Car,
  CreditCard,
  Smartphone,
} from "lucide-react-native";

export default function StaffPaymentScreen() {
  const [licensePlate, setLicensePlate] = useState("51F-123.45");

  // Mock data for the current ticket
  const ticketData = {
    entryTime: "14:30",
    entryDate: "15/04/2024",
    duration: "2 giờ 15 phút",
    fee: "45,000 VND",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Biển số xe</Text>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="Nhập biển số xe"
            />
            <TouchableOpacity style={styles.scanButton}>
              <QrCode size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Car size={24} color="#4F46E5" />
            <Text style={styles.licensePlate}>{licensePlate}</Text>
          </View>

          <View style={styles.ticketDetails}>
            <View style={styles.detailItem}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                Giờ vào: {ticketData.entryTime}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                Ngày: {ticketData.entryDate}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                Thời gian: {ticketData.duration}
              </Text>
            </View>
          </View>

          <View style={styles.feeContainer}>
            <Text style={styles.feeLabel}>Phí gửi xe:</Text>
            <Text style={styles.feeAmount}>{ticketData.fee}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

        <View style={styles.paymentMethodsContainer}>
          <TouchableOpacity
            style={[styles.paymentMethod, styles.selectedPaymentMethod]}
          >
            <CreditCard size={24} color="#4F46E5" />
            <Text style={styles.paymentMethodText}>Tiền mặt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.paymentMethod}>
            <CreditCard size={24} color="#6B7280" />
            <Text style={styles.paymentMethodText}>Thẻ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.paymentMethod}>
            <Smartphone size={24} color="#6B7280" />
            <Text style={styles.paymentMethodText}>Chuyển khoản</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Mã QR thanh toán</Text>
          <View style={styles.qrCode}>
            <QrCode size={160} color="#1F2937" />
          </View>
          <Text style={styles.qrInstructions}>
            Khách hàng có thể quét mã QR này để thanh toán qua ứng dụng ngân
            hàng
          </Text>
        </View>

        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
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
  searchContainer: {
    marginBottom: 24,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  scanButton: {
    width: 48,
    height: 48,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  ticketCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  ticketHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  licensePlate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  ticketDetails: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  feeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  feeLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
  },
  feeAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  paymentMethodsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  paymentMethod: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  selectedPaymentMethod: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  paymentMethodText: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 8,
  },
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  qrCode: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  qrInstructions: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
