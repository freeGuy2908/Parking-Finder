import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { Search, Navigation, Filter } from "lucide-react-native";

import { getUserLocation } from "../../services/getUserLocation";

import { db } from "../../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { openGoogleMapsDirections } from "../../utils/openGoogleMapsDirections";
import { getDistance } from "../../utils/getDistance";

export default function CustomerMapScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [parkingLots, setParkingLots] = useState([]);
  const [parkingLotsWithDistance, setParkingLotsWithDistance] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Hàm lấy dữ liệu từ Firestore
  const fetchParkingLots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "parkingLots"));
      const lots = [];
      querySnapshot.forEach((doc) => {
        lots.push({ id: doc.id, ...doc.data() });
      });
      setParkingLots(lots);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingLots();
  }, []);

  const [userLocation, setUserLocation] = useState(null);
  useEffect(() => {
    (async () => {
      const location = await getUserLocation();
      if (location) {
        console.log("Vị trí người dùng:", location);
        setUserLocation(location);
      }
    })();
  }, []);

  // Tinh toan khoang cach tu vi tri user den bai do xe
  useEffect(() => {
    const fetchDistances = async () => {
      if (!userLocation || parkingLots.length === 0) return;

      const updatedLots = await Promise.all(
        parkingLots.map(async (lot) => {
          const distance = await getDistance(userLocation, lot.address);
          return {
            ...lot,
            distanceText: distance.text,
            distanceValue: distance.value,
          };
        })
      );

      //updatedLots.sort((a, b) => a.distanceValue - b.distanceValue);
      updatedLots.sort((a, b) => {
        const aAvailable = (a.availableSpots || 0) > 0 ? 0 : 1;
        const bAvailable = (b.availableSpots || 0) > 0 ? 0 : 1;
        if (aAvailable !== bAvailable) return aAvailable - bAvailable;
        return a.distanceValue - b.distanceValue;
      });
      setParkingLotsWithDistance(updatedLots);
    };

    fetchDistances();
  }, [userLocation, parkingLots]);

  const filteredParkingLots = parkingLotsWithDistance.filter(
    (lot) =>
      lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userLocation) {
    return <Text>Đang tải vị trí...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
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
        <MapView
          style={styles.mapPlaceholder}
          region={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {filteredParkingLots.map(
            (lot) =>
              lot.location &&
              lot.location.latitude &&
              lot.location.longitude && (
                <Marker
                  key={lot.id}
                  coordinate={{
                    latitude: lot.location.latitude,
                    longitude: lot.location.longitude,
                  }}
                  title={lot.name}
                  description={lot.address}
                />
              )
          )}
        </MapView>
      </View>

      <View style={styles.nearbyContainer}>
        <Text style={styles.nearbyTitle}>Bãi đỗ xe gần đây</Text>
        <ScrollView style={styles.parkingList}>
          {filteredParkingLots.map((lot) => (
            <TouchableOpacity
              key={lot.id}
              style={styles.parkingItem}
              onPress={() => {
                setSelectedLot(lot);
                setShowModal(true);
              }}
            >
              <View style={styles.parkingInfo}>
                <Text style={styles.parkingName}>{lot.name}</Text>
                <Text style={styles.parkingAddress}>{lot.address}</Text>
                <View style={styles.parkingDetails}>
                  <Text style={styles.parkingDistance}>
                    <Navigation size={14} color="#6B7280" /> {lot.distanceText}
                  </Text>
                  <Text style={styles.parkingSpots}>
                    {lot.availableSpots} chỗ trống
                  </Text>
                  <Text style={styles.parkingPrice}>{lot.pricePerHour}đ/h</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.directionButton}
                onPress={() =>
                  openGoogleMapsDirections(
                    `${userLocation?.latitude}, ${userLocation?.longitude}`,
                    `${lot.location.latitude}, ${lot.location.longitude}`
                  )
                }
              >
                <Text style={styles.directionButtonText}>Chỉ đường</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <Modal visible={showModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              width: "90%",
              padding: 16,
              alignItems: "center",
            }}
          >
            {selectedLot?.images?.length > 0 && (
              <Image
                source={{ uri: selectedLot.images[0] }}
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 12,
                  marginBottom: 16,
                }}
                resizeMode="cover"
              />
            )}
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
              {selectedLot?.name}
            </Text>
            <View style={{ alignSelf: "stretch" }}>
              <Text
                style={{
                  color: "#6B7280",
                  fontWeight: "bold",
                  marginBottom: 2,
                }}
              >
                Địa chỉ:
              </Text>
              <Text
                style={{ color: "#6B7280", marginBottom: 8, marginLeft: 8 }}
              >
                {selectedLot?.address}
              </Text>

              <Text
                style={{
                  color: "#4F46E5",
                  fontWeight: "bold",
                  marginBottom: 2,
                }}
              >
                Giá theo giờ:
              </Text>
              <Text
                style={{ color: "#4F46E5", marginBottom: 8, marginLeft: 8 }}
              >
                {selectedLot?.pricePerHour?.toLocaleString()}đ/giờ
              </Text>

              <Text
                style={{
                  color: "#1F2937",
                  fontWeight: "bold",
                  marginBottom: 2,
                }}
              >
                Chỗ trống:
              </Text>
              <Text
                style={{ color: "#1F2937", marginBottom: 8, marginLeft: 8 }}
              >
                {selectedLot?.availableSpots} / {selectedLot?.totalSpots} chỗ
                trống
              </Text>

              <Text
                style={{
                  color: "#374151",
                  fontWeight: "bold",
                  marginBottom: 2,
                }}
              >
                Mô tả:
              </Text>
              <Text
                style={{
                  color: "#374151",
                  marginBottom: 16,
                  marginLeft: 8,
                  textAlign: "left",
                }}
              >
                {selectedLot?.description}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: "#4F46E5",
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 8,
                marginTop: 8,
              }}
              onPress={() => setShowModal(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Đóng</Text>
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
    color: "#10B981",
    fontWeight: "bold",
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
