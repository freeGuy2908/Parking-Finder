import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, MapPin, Car, QrCode } from "lucide-react-native";

export default function CustomerParkingStatusScreen() {
  // Mock data for active parking
  const activeParkingData = {
    parkingLot: "Bãi đỗ xe Trung tâm",
    address: "123 Đường Lê Lợi, Quận 1",
    entryTime: "14:30, 15/04/2024",
    duration: "2 giờ 15 phút",
    estimatedFee: "45,000 VND",
    licensePlate: "51F-123.45",
  };

  // Mock data for parking history
  const parkingHistory = [
    {
      id: 1,
      parkingLot: "Bãi đỗ xe Vincom",
      date: "12/04/2024",
      duration: "1 giờ 30 phút",
      fee: "30,000 VND",
    },
    {
      id: 2,
      parkingLot: "Bãi đỗ xe Landmark 81",
      date: "08/04/2024",
      duration: "3 giờ",
      fee: "75,000 VND",
    },
    {
      id: 3,
      parkingLot: "Bãi đỗ xe Trung tâm",
      date: "02/04/2024",
      duration: "45 phút",
      fee: "15,000 VND",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Active parking section */}
        <View style={styles.activeParkingContainer}>
          <View style={styles.activeParkingHeader}>
            <Text style={styles.activeParkingTitle}>Đang gửi xe</Text>
            <View style={styles.activeParkingStatus}>
              <Text style={styles.activeParkingStatusText}>Đang hoạt động</Text>
            </View>
          </View>

          <View style={styles.parkingCard}>
            <View style={styles.parkingCardHeader}>
              <Car size={24} color="#4F46E5" />
              <Text style={styles.licensePlate}>
                {activeParkingData.licensePlate}
              </Text>
            </View>

            <View style={styles.parkingDetails}>
              <Text style={styles.parkingLotName}>
                {activeParkingData.parkingLot}
              </Text>
              <View style={styles.detailRow}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  {activeParkingData.address}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  Vào lúc: {activeParkingData.entryTime}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  Thời gian: {activeParkingData.duration}
                </Text>
              </View>
            </View>

            <View style={styles.feeContainer}>
              <Text style={styles.feeLabel}>Phí ước tính:</Text>
              <Text style={styles.feeAmount}>
                {activeParkingData.estimatedFee}
              </Text>
            </View>

            <TouchableOpacity style={styles.qrButton}>
              <QrCode size={16} color="#ffffff" />
              <Text style={styles.qrButtonText}>Hiển thị mã QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Parking history section */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Lịch sử gửi xe</Text>

          {parkingHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyParkingName}>{item.parkingLot}</Text>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyDuration}>
                  Thời gian: {item.duration}
                </Text>
              </View>
              <View style={styles.historyItemRight}>
                <Text style={styles.historyFee}>{item.fee}</Text>
              </View>
            </View>
          ))}
        </View>
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
  activeParkingContainer: {
    marginBottom: 24,
  },
  activeParkingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activeParkingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  activeParkingStatus: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeParkingStatusText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "bold",
  },
  parkingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  parkingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  licensePlate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  parkingDetails: {
    marginBottom: 16,
  },
  parkingLotName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  feeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginBottom: 16,
  },
  feeLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  qrButton: {
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  qrButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  historyContainer: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyParkingName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  historyDuration: {
    fontSize: 14,
    color: "#6B7280",
  },
  historyItemRight: {
    justifyContent: "center",
  },
  historyFee: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4F46E5",
  },
});
