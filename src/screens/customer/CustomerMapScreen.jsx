import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Navigation, Filter } from "lucide-react-native";

export default function CustomerMapScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for nearby parking lots
  const nearbyParkingLots = [
    {
      id: 1,
      name: "Bãi đỗ xe Trung tâm",
      address: "123 Đường Lê Lợi, Quận 1",
      distance: "0.5 km",
      availableSpots: 15,
      price: "15,000 VND/giờ",
    },
    {
      id: 2,
      name: "Bãi đỗ xe Vincom",
      address: "456 Đường Đồng Khởi, Quận 1",
      distance: "1.2 km",
      availableSpots: 8,
      price: "20,000 VND/giờ",
    },
    {
      id: 3,
      name: "Bãi đỗ xe Landmark 81",
      address: "789 Đường Điện Biên Phủ, Bình Thạnh",
      distance: "2.5 km",
      availableSpots: 25,
      price: "25,000 VND/giờ",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm bãi đỗ xe</Text>
      </View> */}

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm địa điểm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {/* Map placeholder - in a real app, you would use a map component here */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Bản đồ bãi đỗ xe</Text>
        </View>
      </View>

      <View style={styles.nearbyContainer}>
        <Text style={styles.nearbyTitle}>Bãi đỗ xe gần đây</Text>

        <ScrollView style={styles.parkingList}>
          {nearbyParkingLots.map((lot) => (
            <TouchableOpacity key={lot.id} style={styles.parkingItem}>
              <View style={styles.parkingInfo}>
                <Text style={styles.parkingName}>{lot.name}</Text>
                <Text style={styles.parkingAddress}>{lot.address}</Text>
                <View style={styles.parkingDetails}>
                  <Text style={styles.parkingDistance}>
                    <Navigation size={14} color="#6B7280" /> {lot.distance}
                  </Text>
                  <Text style={styles.parkingSpots}>
                    {lot.availableSpots} chỗ trống
                  </Text>
                  <Text style={styles.parkingPrice}>{lot.price}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.directionButton}>
                <Text style={styles.directionButtonText}>Chỉ đường</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  mapContainer: {
    height: 300,
    backgroundColor: "#E5E7EB",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: "#6B7280",
  },
  nearbyContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1F2937",
  },
  parkingList: {
    flex: 1,
  },
  parkingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  parkingInfo: {
    flex: 1,
  },
  parkingName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  parkingAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  parkingDetails: {
    flexDirection: "row",
    marginTop: 6,
  },
  parkingDistance: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 12,
  },
  parkingSpots: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "bold",
    marginRight: 12,
  },
  parkingPrice: {
    fontSize: 12,
    color: "#6B7280",
  },
  directionButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  directionButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
