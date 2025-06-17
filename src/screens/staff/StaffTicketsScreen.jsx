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
  Modal,
  Image,
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
  getDoc,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  arrayRemove,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/authSlice";

export default function StaffTicketsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTickets, setActiveTickets] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [parkingLot, setParkingLot] = useState(null);
  const [selectedTab, setSelectedTab] = useState("active"); // chia tab cho Vé
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInfo, setQrInfo] = useState(null); // { ticket, amount, qrUrl }

  const user = useSelector(selectUser);
  const navigation = useNavigation();
  const route = useRoute();

  // Fetch parking lot info and all tickets (active + completed)
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
        // Lấy data của document tương ứng trong parkingLots collection
        const parkingLotDoc = await getDoc(
          doc(db, "parkingLots", parkingLotId)
        );
        if (parkingLotDoc.exists()) {
          setParkingLot({
            id: parkingLotId,
            ...parkingLotDoc.data(),
          });
        } else {
          setParkingLot({
            id: parkingLotId,
          });
        }

        // Subscribe to all tickets (active + completed)
        const ticketsRef = collection(
          db,
          "parkingLots",
          parkingLotId,
          "tickets"
        );
        const q = query(ticketsRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const tickets = [];
          snapshot.forEach((doc) => {
            tickets.push({
              id: doc.id,
              ...doc.data(),
              entryTimestamp: doc.data().entryTime?.toDate(),
              exitTimestamp: doc.data().exitTime?.toDate?.() || null,
              totalAmount: doc.data().totalAmount,
            });
          });
          setActiveTickets(tickets);
          setIsLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error(
          "Error fetching data at fetchParkingLotAndTickets:",
          error
        );
        setIsLoading(false);
      }
    };
    if (user?.uid) {
      fetchParkingLotAndTickets();
    }
  }, [user?.uid]);

  // Xử lý logic trả xe
  const handleCheckout = async (ticketId) => {
    try {
      if (!parkingLot?.id) return;

      const ticket = activeTickets.find((t) => t.id === ticketId);
      if (!ticket) {
        Alert.alert("Lỗi", "Không tìm thấy vé");
        return;
      }

      const now = new Date();
      const entryTime = ticket.entryTime?.toDate
        ? ticket.entryTime.toDate()
        : null;
      if (!entryTime) {
        Alert.alert("Lỗi", "Vé không có thời gian vào.");
        return;
      }
      const durationInHours = Math.ceil((now - entryTime) / (1000 * 60 * 60)); // giờ tròn
      const totalAmount = durationInHours * ticket.price;

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
        totalAmount,
      });

      // Tăng số chỗ trống
      const parkingLotRef = doc(db, "parkingLots", parkingLot.id);
      const parkingLotDoc = await getDoc(parkingLotRef);
      if (parkingLotDoc.exists()) {
        const lotData = parkingLotDoc.data();
        if (lotData.availableSpots !== undefined) {
          await updateDoc(parkingLotRef, {
            availableSpots: lotData.availableSpots + 1,
            activeVehicles: arrayRemove(ticket.licensePlate.toUpperCase()),
          });
        }
      }

      Alert.alert("Thành công", "Đã trả xe thành công");
    } catch (error) {
      console.error("Error checking out:", error);
      Alert.alert("Lỗi", "Không thể xử lý trả xe");
    }
  };

  // Xử lý hiện mã VietQr
  const handleShowQR = (ticket) => {
    const amount = calculateRealtimeAmount(ticket);
    const bankId = parkingLot.bankId;
    const bankAccount = parkingLot.bankAccount;
    const description = `Thanh toan ve xe ${ticket.licensePlate}`;
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      description
    )}`;
    console.log("Lot", parkingLot);
    console.log("QR URL:", qrUrl);
    setQrInfo({ ticket, amount, qrUrl, description, bankAccount, bankId });
    setShowQRModal(true);
  };

  /** Group logic cho THỜI GIAN GỬI và TÍNH TIỀN */

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

  // Hàm tính phí tạm tính realtime
  const calculateRealtimeAmount = (ticket) => {
    const now = currentTime;
    const entryTime = ticket.entryTime?.toDate
      ? ticket.entryTime.toDate()
      : null;
    if (!entryTime || !ticket.price) return 0;
    const diffMs = now - entryTime;
    const hours = Math.ceil(diffMs / (1000 * 60 * 60)); // Luôn làm tròn lên
    return hours * ticket.price;
  };

  /** END GROUP */

  // Lọc vé theo tab và tìm kiếm
  const ticketsActive = activeTickets.filter(
    (ticket) =>
      ticket.status === "active" &&
      ticket.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const ticketsCompleted = activeTickets.filter(
    (ticket) =>
      ticket.status === "completed" &&
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

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "active" && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "active" && styles.tabTextActive,
            ]}
          >
            Vé đang gửi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "completed" && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "completed" && styles.tabTextActive,
            ]}
          >
            Vé đã trả
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === "active" && (
          <>
            <Text style={styles.sectionTitle}>
              Vé đang gửi ({ticketsActive.length})
            </Text>
            {ticketsActive.length === 0 && !isLoading ? (
              <Text style={styles.emptyText}>Không có vé nào.</Text>
            ) : (
              ticketsActive.map((ticket) => {
                const { date: entryDate, time: entryTime } = formatDateTime(
                  ticket.entryTimestamp
                );
                const duration = calculateDuration(ticket.entryTimestamp);
                const amount = calculateRealtimeAmount(ticket);
                return (
                  <TouchableOpacity key={ticket.id} style={styles.ticketCard}>
                    <View style={styles.ticketHeader}>
                      <Car size={20} color="#4F46E5" />
                      <Text style={styles.licensePlate}>
                        {ticket.licensePlate}
                      </Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Đang gửi</Text>
                      </View>
                    </View>
                    <View style={styles.ticketDetails}>
                      <View style={styles.detailItem}>
                        <Clock size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                          Giờ vào: {entryTime}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Calendar size={16} color="#6B7280" />
                        <Text style={styles.detailText}>Ngày: {entryDate}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Clock size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                          Thời gian: {duration}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailText}>
                          Phí tạm tính: {amount.toLocaleString()}đ
                        </Text>
                      </View>
                    </View>
                    <View style={styles.ticketActions}>
                      <TouchableOpacity
                        style={styles.checkoutButton}
                        onPress={() => handleShowQR(ticket)}
                      >
                        <Text style={styles.checkoutButtonText}>Trả xe</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
        {selectedTab === "completed" && (
          <>
            <Text style={styles.sectionTitle}>
              Vé đã trả ({ticketsCompleted.length})
            </Text>
            {ticketsCompleted.length === 0 && !isLoading ? (
              <Text style={styles.emptyText}>Không có vé nào.</Text>
            ) : (
              ticketsCompleted.map((ticket) => {
                const { date: entryDate, time: entryTime } = formatDateTime(
                  ticket.entryTimestamp
                );
                const { date: exitDate, time: exitTime } = ticket.exitTimestamp
                  ? formatDateTime(ticket.exitTimestamp)
                  : { date: "-", time: "-" };
                const duration = ticket.exitTimestamp
                  ? calculateDuration(
                      ticket.entryTimestamp,
                      ticket.exitTimestamp
                    )
                  : "-";
                const amount = ticket.totalAmount || 0;
                return (
                  <View key={ticket.id} style={styles.ticketCard}>
                    <View style={styles.ticketHeader}>
                      <Car size={20} color="#4F46E5" />
                      <Text style={styles.licensePlate}>
                        {ticket.licensePlate}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: "#E5E7EB" },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: "#6B7280" }]}>
                          Đã trả xe
                        </Text>
                      </View>
                    </View>
                    <View style={styles.ticketDetails}>
                      <View style={styles.detailItem}>
                        <Clock size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                          Giờ vào: {entryTime}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Calendar size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                          Ngày vào: {entryDate}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Clock size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                          Giờ ra: {exitTime}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Calendar size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                          Ngày ra: {exitDate}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailText}>
                          Tổng phí: {amount.toLocaleString()}đ
                        </Text>
                      </View>
                    </View>
                    <View style={styles.ticketActions}>
                      <TouchableOpacity
                        style={[styles.checkoutButton, { opacity: 0.5 }]}
                        disabled={true}
                      >
                        <Text style={styles.checkoutButtonText}>Đã trả xe</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showQRModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* <Text style={styles.modalTitle}>Thanh toán VietQR</Text> */}
            <Image
              source={{ uri: qrInfo?.qrUrl }}
              style={{
                width: 250,
                height: 350,
                alignSelf: "center",
              }}
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={async () => {
                setShowQRModal(false);
                await handleCheckout(qrInfo.ticket.id);
              }}
            >
              <Text style={styles.confirmButtonText}>
                Xác nhận đã thanh toán
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowQRModal(false)}>
              <Text
                style={{
                  color: "#EF4444",
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                Huỷ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },
  tabButtonActive: {
    backgroundColor: "#4F46E5",
  },
  tabText: {
    fontSize: 15,
    color: "#4F46E5",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
});
