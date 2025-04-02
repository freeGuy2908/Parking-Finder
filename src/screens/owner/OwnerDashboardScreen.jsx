import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Car,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronRight,
} from "lucide-react-native";

export default function OwnerDashboardScreen() {
  // Mock data for parking lots
  const parkingLots = [
    {
      id: 1,
      name: "Bãi đỗ xe Trung tâm",
      totalSpots: 50,
      availableSpots: 15,
      occupiedSpots: 35,
    },
    {
      id: 2,
      name: "Bãi đỗ xe Vincom",
      totalSpots: 80,
      availableSpots: 32,
      occupiedSpots: 48,
    },
  ];

  // Mock data for statistics
  const statistics = {
    totalRevenue: "5,250,000 VND",
    totalVehicles: 210,
    averageDuration: "2.5 giờ",
  };

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      licensePlate: "51F-123.45",
      action: "Vào bãi",
      time: "15:30, 15/04/2024",
      parkingLot: "Bãi đỗ xe Trung tâm",
    },
    {
      id: 2,
      licensePlate: "59A-678.90",
      action: "Ra bãi",
      time: "15:15, 15/04/2024",
      parkingLot: "Bãi đỗ xe Trung tâm",
    },
    {
      id: 3,
      licensePlate: "51G-246.80",
      action: "Vào bãi",
      time: "14:45, 15/04/2024",
      parkingLot: "Bãi đỗ xe Vincom",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Parking lots section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bãi đỗ xe của tôi</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {parkingLots.map((lot) => (
            <TouchableOpacity key={lot.id} style={styles.parkingLotCard}>
              <Text style={styles.parkingLotName}>{lot.name}</Text>
              <View style={styles.parkingLotStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{lot.totalSpots}</Text>
                  <Text style={styles.statLabel}>Tổng số chỗ</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#10B981" }]}>
                    {lot.availableSpots}
                  </Text>
                  <Text style={styles.statLabel}>Còn trống</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#EF4444" }]}>
                    {lot.occupiedSpots}
                  </Text>
                  <Text style={styles.statLabel}>Đang sử dụng</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(lot.occupiedSpots / lot.totalSpots) * 100}%` },
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Statistics section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê tháng này</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <DollarSign size={24} color="#4F46E5" />
              <Text style={styles.statCardValue}>
                {statistics.totalRevenue}
              </Text>
              <Text style={styles.statCardLabel}>Doanh thu</Text>
            </View>

            <View style={styles.statCard}>
              <Car size={24} color="#4F46E5" />
              <Text style={styles.statCardValue}>
                {statistics.totalVehicles}
              </Text>
              <Text style={styles.statCardLabel}>Lượt xe</Text>
            </View>

            <View style={styles.statCard}>
              <Clock size={24} color="#4F46E5" />
              <Text style={styles.statCardValue}>
                {statistics.averageDuration}
              </Text>
              <Text style={styles.statCardLabel}>Thời gian trung bình</Text>
            </View>

            <View style={styles.statCard}>
              <TrendingUp size={24} color="#4F46E5" />
              <TouchableOpacity style={styles.viewReportButton}>
                <Text style={styles.viewReportText}>Xem báo cáo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent activities section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityLeft}>
                <Text style={styles.licensePlate}>{activity.licensePlate}</Text>
                <Text style={styles.activityDetails}>
                  {activity.action} • {activity.time}
                </Text>
                <Text style={styles.activityLocation}>
                  {activity.parkingLot}
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  seeAllText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
  },
  parkingLotCard: {
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
  parkingLotName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  parkingLotStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  viewReportButton: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  viewReportText: {
    color: "#4F46E5",
    fontWeight: "bold",
    fontSize: 12,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  activityLeft: {
    flex: 1,
  },
  licensePlate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  activityDetails: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  activityLocation: {
    fontSize: 14,
    color: "#6B7280",
  },
});
