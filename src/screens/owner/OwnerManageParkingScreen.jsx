import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Edit,
  Trash2,
  MapPin,
  Clock,
  Car,
  DollarSign,
  ChevronRight,
  UsersRound,
} from "lucide-react-native";

import { db } from "../../../firebaseConfig";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { useSelector } from "react-redux";
import { selectUser } from "../../redux/authSlice";

export default function OwnerManageParkingScreen() {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const user = useSelector(selectUser);

  // Hàm lấy dữ liệu từ Firestore
  const fetchParkingLots = async () => {
    setLoading(true);
    try {
      const parkingLotsRef = collection(db, "parkingLots");
      const q = query(parkingLotsRef, where("ownerId", "==", user.uid));

      const querySnapshot = await getDocs(q);
      const lots = [];
      querySnapshot.forEach((doc) => {
        lots.push({ id: doc.id, ...doc.data() });
      });
      setParkingLots(lots);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bãi đỗ xe");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchParkingLots();
    }, [])
  );

  const handleDeleteParkingLot = async (id) => {
    const lotRef = doc(db, "parkingLots", id);
    const lotSnap = await getDoc(lotRef);
    if (!lotSnap.exists()) {
      Alert.alert("Lỗi", "Không tìm thấy bãi đỗ này.");
      return;
    }
    const lotData = lotSnap.data();

    if (
      (lotData.activeVehicles && lotData.activeVehicles.length > 0) ||
      (lotData.staffs && lotData.staffs.length > 0)
    ) {
      Alert.alert(
        "Không thể xóa",
        "Bãi đỗ vẫn còn nhân viên đang làm việc hoặc xe đang gửi."
      );
      return;
    }
    Alert.alert(
      "Xác nhận xóa",
      "Ban có chắc chắn muốn xóa bãi đỗ này không?",
      [
        {
          text: "Hủy",
          onPress: () => console.log("Hủy xóa"),
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDoc(doc(db, "parkingLots", id));
              Alert.alert("Thành công", "Bãi đỗ đã được xóa thành công");
              // Cap nhat danh sach sau khi xoa
              fetchParkingLots();
            } catch (error) {
              console.error("Lỗi khi xóa bãi đỗ xe: ", error);
              Alert.alert(
                "Lỗi",
                "Không thể xóa bãi đỗ xe này, vui lòng thử lại"
              );
              setLoading(false);
            }
          },
          style: "default",
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {parkingLots.map((lot) => (
          <View key={lot.id} style={styles.parkingLotCard}>
            <View style={styles.cardHeader}>
              <Image
                source={{ uri: lot.images[0] }}
                style={styles.parkingImage}
              />
              <View style={styles.headerInfo}>
                <Text style={styles.parkingName}>{lot.name}</Text>
                <View style={styles.addressContainer}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.addressText}>{lot.address}</Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal={true}
              contentContainerStyle={styles.statsContainer}
            >
              <View style={styles.statItem}>
                <Car size={16} color="#4F46E5" />
                <Text style={styles.statText}>
                  {lot.availableSpots}/{lot.totalSpots} chỗ trống
                </Text>
              </View>

              {/* <View style={styles.statItem}>
                <Clock size={16} color="#4F46E5" />
                <Text style={styles.statText}>
                  {lot.openTime} - {lot.closeTime}
                </Text>
              </View> */}

              <View style={styles.statItem}>
                <DollarSign size={16} color="#4F46E5" />
                <Text style={styles.statText}>{lot.pricePerHour}/giờ</Text>
              </View>

              <View style={styles.statItem}>
                <UsersRound size={16} color="#4F46E5" />
                <Text style={styles.statText}>
                  {lot.staffs ? lot.staffs.length : 0} nhân viên
                </Text>
              </View>
            </ScrollView>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("EditParking", { lot })}
              >
                <Edit size={16} color="#4F46E5" />
                <Text style={styles.actionText}>Chỉnh sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteParkingLot(lot.id)}
              >
                <Trash2 size={16} color="#EF4444" />
                <Text style={[styles.actionText, styles.deleteText]}>Xóa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.detailsButton]}
                onPress={() => navigation.navigate("ParkingDetail", { lot })}
              >
                <Text style={styles.detailsText}>Chi tiết</Text>
                <ChevronRight size={16} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("RegisterParking")}
        >
          <Text style={styles.addButtonText}>+ Thêm bãi đỗ xe mới</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  parkingLotCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  parkingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  parkingName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    padding: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    color: "#4F46E5",
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
  },
  deleteText: {
    color: "#EF4444",
  },
  detailsButton: {
    marginLeft: "auto",
  },
  detailsText: {
    fontSize: 14,
    color: "#4F46E5",
  },
  addButton: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#4F46E5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4F46E5",
  },
});
