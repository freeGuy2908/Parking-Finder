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
  Search,
  Car,
  Clock,
  Calendar,
  ChevronRight,
} from "lucide-react-native";

export default function StaffTicketsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for active tickets
  const activeTickets = [
    {
      id: 1,
      licensePlate: "51F-123.45",
      entryTime: "14:30",
      entryDate: "15/04/2024",
      duration: "2 giờ 15 phút",
    },
    {
      id: 2,
      licensePlate: "59A-678.90",
      entryTime: "13:45",
      entryDate: "15/04/2024",
      duration: "3 giờ",
    },
    {
      id: 3,
      licensePlate: "51G-246.80",
      entryTime: "11:20",
      entryDate: "15/04/2024",
      duration: "5 giờ 25 phút",
    },
  ];

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
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
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

        <Text style={styles.sectionTitle}>Vé đang hoạt động</Text>

        {activeTickets.map((ticket) => (
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
                <Text style={styles.detailText}>
                  Giờ vào: {ticket.entryTime}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.detailText}>Ngày: {ticket.entryDate}</Text>
              </View>

              <View style={styles.detailItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  Thời gian: {ticket.duration}
                </Text>
              </View>
            </View>

            <View style={styles.ticketActions}>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                <ChevronRight size={16} color="#4F46E5" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.checkoutButton}>
                <Text style={styles.checkoutButtonText}>Trả xe</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.historyButton}>
          <Text style={styles.historyButtonText}>Xem lịch sử vé</Text>
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
    height: 40,
    marginLeft: 8,
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
    borderColor: "#4F46E5",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4F46E5",
    marginLeft: 8,
  },
  scanButton: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
    marginRight: 0,
    marginLeft: 8,
  },
  scanButtonText: {
    color: "#ffffff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  ticketCard: {
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
  ticketHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  licensePlate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "bold",
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
  ticketActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
  },
  checkoutButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  checkoutButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  historyButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  historyButtonText: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
  },
});
