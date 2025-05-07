import { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapPicker({ navigation, route }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <View style={{ flex: 1 }}>
      {/* Bản đồ */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: route.params?.initialLat || 10.762622, // Mặc định Hà Nội
          longitude: route.params?.initialLng || 106.660172,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>

      {/* Nút xác nhận */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          if (selectedLocation) {
            navigation.goBack();
            route.params?.onSelectLocation(selectedLocation);
          }
        }}
      >
        <Text style={styles.confirmButtonText}>Xác nhận vị trí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  confirmButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 8,
  },
  confirmButtonText: { color: "white", fontWeight: "bold" },
});
