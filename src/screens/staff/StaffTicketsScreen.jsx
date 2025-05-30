import React, { useState, useEffect, useCallback } from "react";
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
  QrCode,
  Search,
  Car,
  Clock,
  Calendar,
  ChevronRight,
} from "lucide-react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { db } from "../../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/authSlice";

// Hàm helper để chuyển đổi ngày giờ từ mock data thành Date object
const parseEntryDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return new Date(); // Trả về ngày giờ hiện tại nếu thiếu
  const [day, month, year] = dateStr.split("/").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  // Lưu ý: tháng trong JavaScript Date object là 0-indexed (0 = January, 1 = February, ...)

  return new Date(year, month - 1, day, hours, minutes);
};

export default function StaffTicketsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTickets, setActiveTickets] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [parkingLot, setParkingLot] = useState(null);

  const user = useSelector(selectUser);
  const navigation = useNavigation();
  const route = useRoute();

  // Fetch parking lot info and active tickets
  useEffect(() => {
    const fetchParkingLotAndTickets = async () => {
      try {
        // First, get staff's parking lot
        const staffRef = collection(db, "staffAssignments");
        const staffQuery = query(staffRef, where("staffId", "==", user.uid));
        const staffSnapshot = await getDocs(staffQuery);

        if (staffSnapshot.empty) {
          console.log("No parking lot found for staff");
          setIsLoading(false);
          return;
        }

        const parkingLotId = staffSnapshot.docs[0].data().parkingLotId;
        setParkingLot({
          id: parkingLotId,
          ...staffSnapshot.docs[0].data(),
        });

        // Then, subscribe to active tickets
        const ticketsRef = collection(
          db,
          "parkingLots",
          parkingLotId,
          "tickets"
        );
        const q = query(ticketsRef, where("status", "==", "active"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const tickets = [];
          snapshot.forEach((doc) => {
            tickets.push({
              id: doc.id,
              ...doc.data(),
              entryTimestamp: doc.data().entryTime?.toDate(),
            });
          });
          setActiveTickets(tickets);
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (user?.uid) {
      fetchParkingLotAndTickets();
    }
  }, [user?.uid]);

  // Handle vehicle checkout
  const handleCheckout = async (ticketId) => {
    try {
      if (!parkingLot?.id) return;

      const ticketRef = doc(
        db,
        "parkingLots",
        parkingLot.id,
        "tickets",
        ticketId
      );
      await updateDoc(ticketRef, {
        exitTime: serverTimestamp(),
        status: "completed",
        totalAmount: calculateAmount(ticket),
      });

      Alert.alert("Thành công", "Đã trả xe thành công");
    } catch (error) {
      console.error("Error checking out:", error);
      Alert.alert("Lỗi", "Không thể xử lý trả xe");
    }
  };

  const calculateAmount = (ticket) => {
    const now = new Date();
    const entryTime = ticket.entryTimestamp;
    const duration = (now - entryTime) / (1000 * 60 * 60); // hours
    return Math.ceil(duration * ticket.price);
  };

  // Cập nhật currentTime mỗi phút để tính toán lại duration
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60000 ms = 1 phút

    return () => clearInterval(timerId); // Cleanup interval khi component unmount
  }, []);

  // Hàm định dạng ngày giờ
  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: "N/A", time: "N/A" };
    const dateObj = new Date(timestamp);
    const time = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = dateObj.toLocaleDateString("vi-VN"); // Định dạng dd/mm/yyyy
    return { date, time };
  };

  // Hàm tính toán thời gian gửi xe
  const calculateDuration = (entryTimestamp) => {
    if (!entryTimestamp) return "Đang tính...";
    const now = currentTime; // Sử dụng currentTime từ state
    const entry = new Date(entryTimestamp);
    const diffMs = now - entry;

    //if (diffMs < 0) return "Thời gian không hợp lệ"; // Trường hợp entryTimestamp trong tương lai

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    if (minutes > 0) {
      return `${minutes} phút`;
    }
    return "Vừa vào";
  };

  const filteredTickets = activeTickets.filter((ticket) =>
    ticket.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text>Đang tải dữ liệu vé...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm biển số xe..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Scan")} // Điều hướng đến màn hình chụp biển số
          >
            <QrCode size={24} color="#4F46E5" />
            <Text style={styles.actionButtonText}>Tạo vé mới</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.scanButton]}>
            <QrCode size={24} color="#ffffff" />
            <Text style={[styles.actionButtonText, styles.scanButtonText]}>
              Quét mã QR
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Vé đang hoạt động ({filteredTickets.length})
        </Text>

        {filteredTickets.length === 0 && !isLoading ? (
          <Text style={styles.emptyText}>Không có vé nào đang hoạt động.</Text>
        ) : (
          filteredTickets.map((ticket) => {
            const { date: entryDate, time: entryTime } = formatDateTime(
              ticket.entryTimestamp
            );
            const duration = calculateDuration(ticket.entryTimestamp);
            const amount = calculateAmount(ticket);

            return (
              <TouchableOpacity key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <Car size={20} color="#4F46E5" />
                  <Text style={styles.licensePlate}>{ticket.licensePlate}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Đang gửi</Text>
                  </View>
                </View>

                <View style={styles.ticketDetails}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Giờ vào: {entryTime}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Ngày: {entryDate}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Thời gian: {duration}</Text>
                  </View>

                  {/* <View style={styles.detailItem}>
                    <Text style={styles.detailText}>
                      Phí tạm tính: {amount.toLocaleString()}đ
                    </Text>
                  </View> */}
                </View>

                <View style={styles.ticketActions}>
                  <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => handleCheckout(ticket.id)}
                  >
                    <Text style={styles.checkoutButtonText}>Trả xe</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    // Style này không được sử dụng, có thể bỏ
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    // Style này không được sử dụng, có thể bỏ
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 44, // Tăng chiều cao một chút
    marginLeft: 8,
    fontSize: 16, // Tăng kích thước font
    color: "#1F2937",
  },
  content: {
    flex: 1,
    padding: 16,
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
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE", // Màu border nhạt hơn
    borderRadius: 8,
    paddingVertical: 14, // Tăng padding
    marginHorizontal: 4, // Thêm margin ngang nhỏ
  },
  actionButtonText: {
    fontSize: 13, // Điều chỉnh kích thước font
    fontWeight: "600", // Semi-bold
    color: "#4338CA", // Màu đậm hơn
    marginLeft: 8,
    textAlign: "center",
  },
  scanButton: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  scanButtonText: {
    color: "#ffffff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600", // Semi-bold
    color: "#1F2937",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 30,
  },
  ticketCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Tăng shadow offset
    shadowOpacity: 0.08, // Giảm opacity cho shadow mềm hơn
    shadowRadius: 4, // Tăng shadow radius
    elevation: 3, // Tăng elevation cho Android
  },
  ticketHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  licensePlate: {
    fontSize: 17, // Tăng kích thước font
    fontWeight: "600", // Semi-bold
    color: "#1F2937",
    marginLeft: 10, // Tăng margin
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#DCFCE7", // Màu xanh lá nhạt
    paddingHorizontal: 10, // Tăng padding
    paddingVertical: 5, // Tăng padding
    borderRadius: 16, // Bo tròn hơn
  },
  statusText: {
    color: "#047857", // Màu xanh lá đậm
    fontSize: 12,
    fontWeight: "600", // Semi-bold
  },
  ticketDetails: {
    paddingHorizontal: 16,
    paddingVertical: 12, // Điều chỉnh padding
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // Tăng margin
  },
  detailText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 10, // Tăng margin
  },
  ticketActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10, // Điều chỉnh padding
    paddingHorizontal: 16,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6, // Thêm padding
  },
  viewButtonText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
    marginRight: 4, // Thêm margin
  },
  checkoutButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20, // Tăng padding
    paddingVertical: 10, // Tăng padding
    borderRadius: 8, // Bo tròn hơn
  },
  checkoutButtonText: {
    fontSize: 14,
    fontWeight: "600", // Semi-bold
    color: "#ffffff",
  },
  historyButton: {
    backgroundColor: "#EEF2FF", // Màu nền nhạt
    borderWidth: 1,
    borderColor: "#C7D2FE", // Màu border nhạt
    borderRadius: 8,
    paddingVertical: 14, // Tăng padding
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8, // Thêm margin top
  },
  historyButtonText: {
    fontSize: 16,
    color: "#4338CA", // Màu đậm hơn
    fontWeight: "600", // Semi-bold
  },
});
