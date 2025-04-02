import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
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
} from "lucide-react-native";

export default function OwnerManageParkingScreen() {
  // Mock data for parking lots
  const [parkingLots, setParkingLots] = useState([
    {
      id: 1,
      name: "Bãi đỗ xe Trung tâm",
      address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
      totalSpots: 50,
      availableSpots: 15,
      pricePerHour: "15,000 VND",
      openTime: "07:00",
      closeTime: "22:00",
      image: "https://placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      name: "Bãi đỗ xe Vincom",
      address: "456 Đường Đồng Khởi, Quận 1, TP.HCM",
      totalSpots: 80,
      availableSpots: 32,
      pricePerHour: "20,000 VND",
      openTime: "08:00",
      closeTime: "23:00",
      image: "https://placeholder.svg?height=100&width=100",
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {parkingLots.map((lot) => (
          <View key={lot.id} style={styles.parkingLotCard}>
            <View style={styles.cardHeader}>
              <Image source={{ uri: lot.image }} style={styles.parkingImage} />
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

              <View style={styles.statItem}>
                <Clock size={16} color="#4F46E5" />
                <Text style={styles.statText}>
                  {lot.openTime} - {lot.closeTime}
                </Text>
              </View>

              <View style={styles.statItem}>
                <DollarSign size={16} color="#4F46E5" />
                <Text style={styles.statText}>{lot.pricePerHour}/giờ</Text>
              </View>
            </ScrollView>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Edit size={16} color="#4F46E5" />
                <Text style={styles.actionText}>Chỉnh sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Trash2 size={16} color="#EF4444" />
                <Text style={[styles.actionText, styles.deleteText]}>Xóa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.detailsButton]}
              >
                <Text style={styles.detailsText}>Chi tiết</Text>
                <ChevronRight size={16} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
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
