import React, { useState, useRef, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";

export default function VehicleTracking() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const cameraRef = useRef(null);

  // Request camera permissions if not already granted
  useEffect(() => {
    if (!permission) return; // Permissions still loading
    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCapture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: false,
        });

        const resizedPhoto = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }], // Resize to 800px width (height auto-scales)
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress to 70% quality, save as JPEG
        );

        console.log("Original image URI:", photo.uri);
        console.log("Resized image URI:", resizedPhoto.uri);

        recognizeLicensePlate(resizedPhoto.uri);
      } catch (error) {
        console.error("Error taking or resizing picture:", error);
        Alert.alert(
          "Error",
          "Failed to take or resize picture. Please try again."
        );
      }
    } else {
      Alert.alert(
        "Error",
        "Camera is not ready. Please wait a moment and try again."
      );
    }
  };

  const recognizeLicensePlate = async (imageUri) => {
    const apiKey = "7cf426ba1d4fa86ca9ba1457215e5498cee251c4"; // Replace with your Plate Recognizer API key
    const apiUrl = "https://api.platerecognizer.com/v1/plate-reader/";

    if (!apiKey) {
      Alert.alert("Error", "Please provide a valid Plate Recognizer API key.");
      return;
    }

    const formData = new FormData();
    formData.append("upload", {
      uri: imageUri,
      name: "license-plate.jpg",
      type: "image/jpeg",
    });

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("License plate recognition response:", response.data);

      if (response.data.results.length > 0) {
        const plate = response.data.results[0].plate;
        setLicensePlate(plate);
        Alert.alert("License Plate Detected", `Plate: ${plate}`);
      } else {
        Alert.alert("No License Plate Found", "Please try again.");
      }
    } catch (error) {
      console.error("Error recognizing license plate:", error);
      Alert.alert("Error", "Failed to recognize the license plate.");
    }
  };

  // Handle permission states
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      />
      <Button title="Capture License Plate" onPress={handleCapture} />
      {licensePlate ? (
        <Text style={styles.plateText}>Detected Plate: {licensePlate}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  message: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  plateText: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
});
