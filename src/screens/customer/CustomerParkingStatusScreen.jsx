import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Clock,
  MapPin,
  Car,
  QrCode,
  Search,
  CircleParking,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

export default function CustomerParkingStatusScreen() {
  const [licensePlate, setLicensePlate] = useState("");
  const [activeParking, setActiveParking] = useState(null);
  const [parkingHistory, setParkingHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!licensePlate.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập biển số xe");
      return;
    }

    setLoading(true);
    try {
      // Fetch active parking ticket
      const parkingLotsRef = collection(db, "parkingLots");
      const parkingLotsSnap = await getDocs(parkingLotsRef);

      let found = false;

      for (const parkingLotDoc of parkingLotsSnap.docs) {
        const ticketsRef = collection(parkingLotDoc.ref, "tickets");
        const q = query(
          ticketsRef,
          where("licensePlate", "==", licensePlate.trim().toUpperCase()),
          where("status", "==", "active")
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          found = true;
          const ticketData = snapshot.docs[0].data();
          const entryTime = ticketData.entryTime.toDate();
          const now = new Date();
          const duration = Math.floor((now - entryTime) / (1000 * 60)); // minutes
          const estimatedFee = Math.ceil(duration / 60) * ticketData.price;

          setActiveParking({
            parkingLot: parkingLotDoc.data().name,
            address: parkingLotDoc.data().address,
            entryTime: entryTime.toLocaleString(),
            duration: `${Math.floor(duration / 60)} giờ ${duration % 60} phút`,
            estimatedFee: `${estimatedFee.toLocaleString()} VND`,
            licensePlate: ticketData.licensePlate,
          });
          break;
        }
      }

      if (!found) {
        setActiveParking(null);
      }

      // Fetch parking history
      let history = [];
      for (const parkingLotDoc of parkingLotsSnap.docs) {
        const ticketsRef = collection(parkingLotDoc.ref, "tickets");
        const q = query(
          ticketsRef,
          where("licensePlate", "==", licensePlate.trim().toUpperCase()),
          where("status", "==", "completed")
        );

        const ticketsSnap = await getDocs(q);
        ticketsSnap.forEach((doc) => {
          const data = doc.data();
          console.log("Ticket data:", data);
          const duration = Math.floor(
            (data.exitTime.toDate() - data.entryTime.toDate()) / (1000 * 60)
          );

          history.push({
            id: doc.id,
            parkingLot: parkingLotDoc.data().name,
            //date: data.entryTime.toDate().toLocaleDateString(),
            entryTime: data.entryTime.toDate().toLocaleString(),
            exitTime: data.exitTime.toDate().toLocaleString(),
            duration: `${Math.floor(duration / 60)} giờ ${duration % 60} phút`,
            fee: `${data.totalAmount.toLocaleString()} VND`,
          });
        });
      }

      setParkingHistory(
        history.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime))
      );
    } catch (error) {
      console.error("Error searching:", error);
      Alert.alert("Lỗi", "Không thể tìm kiếm thông tin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập biển số xe (VD: 30A-12345)"
            value={licensePlate}
            onChangeText={setLicensePlate}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Search size={16} color="#ffffff" />
                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Active parking section */}
        {activeParking ? (
          <View style={styles.activeParkingContainer}>
            <View style={styles.activeParkingHeader}>
              {/* <Text style={styles.activeParkingTitle}>Đang gửi xe</Text> */}
              <View style={styles.activeParkingStatus}>
                <Text style={styles.activeParkingStatusText}>Đang gửi xe</Text>
              </View>
            </View>

            <View style={styles.parkingCard}>
              <View style={styles.parkingCardHeader}>
                <Car size={24} color="#4F46E5" />
                <Text style={styles.licensePlate}>
                  {activeParking.licensePlate}
                </Text>
              </View>

              <View style={styles.parkingDetails}>
                <Text style={styles.parkingLotName}>
                  {activeParking.parkingLot}
                </Text>
                <View style={styles.detailRow}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{activeParking.address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    Vào lúc: {activeParking.entryTime}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    Thời gian: {activeParking.duration}
                  </Text>
                </View>
              </View>

              <View style={styles.feeContainer}>
                <Text style={styles.feeLabel}>Phí ước tính:</Text>
                <Text style={styles.feeAmount}>
                  {activeParking.estimatedFee}
                </Text>
              </View>

              {/* <TouchableOpacity style={styles.qrButton}>
              <QrCode size={16} color="#ffffff" />
              <Text style={styles.qrButtonText}>Hiển thị mã QR</Text>
            </TouchableOpacity> */}
            </View>
          </View>
        ) : (
          <View style={styles.noActiveParkingContainer}>
            <Text style={styles.noActiveParkingText}>
              {licensePlate
                ? "Không tìm thấy xe đang gửi"
                : "Nhập biển số xe để tra cứu"}
            </Text>
          </View>
        )}

        {/* Parking history section */}
        {licensePlate && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Lịch sử gửi xe</Text>
            {parkingHistory.length > 0 ? (
              parkingHistory.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyItemLeft}>
                    <Text style={styles.historyParkingName}>
                      {item.parkingLot}
                    </Text>
                    <Text style={styles.historyDate}>
                      Vào lúc: {item.entryTime}
                    </Text>
                    <Text style={styles.historyDate}>
                      Ra lúc: {item.exitTime}
                    </Text>
                    <Text style={styles.historyDuration}>
                      Thời gian: {item.duration}
                    </Text>
                  </View>
                  <View style={styles.historyItemRight}>
                    <Text style={styles.historyFee}>{item.fee}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noHistoryText}>Chưa có lịch sử gửi xe</Text>
            )}
          </View>
        )}
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
    fontSize: 14,
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
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchButton: {
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  noActiveParkingContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  noActiveParkingText: {
    fontSize: 16,
    color: "#6B7280",
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
  noHistoryText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
  },
});
