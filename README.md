# Ứng dụng Tìm kiếm và quản lý Bãi Đỗ Xe

---

## Yêu cầu hệ thống

Để cài đặt và chạy, bạn cần đảm bảo hệ thống của mình đáp ứng các yêu cầu sau:

- **Node.js**: Phiên bản 16.x trở lên
- **npm**: Phiên bản 8.x trở lên, hoặc bạn có thể sử dụng `yarn`
- **Expo CLI**: Cài đặt thông qua npm: `npm install -g expo-cli`
- **Tài khoản Firebase**: Cần thiết cho các dịch vụ Firestore (cơ sở dữ liệu) và Authentication (xác thực người dùng).
- **API Key Google Maps**: Dùng cho các tính năng Geocoding (chuyển đổi địa chỉ sang tọa độ) và Distance Matrix (tính toán khoảng cách).
- **API Key Plate Recognizer**: Dùng cho nhận diện biển số xe.
- **Tài khoản Cloudinary**: Dùng cho việc tải lên và quản lý hình ảnh.

---

## Cài đặt

Thực hiện theo các bước dưới đây để thiết lập và chạy ứng dụng ParkingFinder trên máy của bạn:

1.  **Giải nén zip**:

2.  **Cài đặt Dependencies**:
    Sau khi di chuyển vào thư mục dự án, cài đặt tất cả các gói phụ thuộc cần thiết:

    ```sh
    npm install
    ```

3.  **Cấu hình Firebase**:
    Mở file `firebaseConfig.js` và điền thông tin cấu hình dự án Firebase của bạn vào đó. Bạn có thể tìm thấy các thông tin này trong bảng điều khiển Firebase của mình.

4.  **Cấu hình API Key**:

    - **Google Maps**: Điền API key của bạn vào các file sau:
      - `app.json`
      - `src/utils/getLatLngFromAddress.js`
      - `src/utils/getDistance.js`
    - **Plate Recognizer**: Điền API key vào file:
      - `src/screens/owner/VehicleTracking.jsx`
    - **Cloudinary**: Điền `CLOUD_NAME` của bạn vào file:
      - `src/services/cloudinary.js`

5.  **Chạy ứng dụng**:
    Bắt đầu ứng dụng bằng cách chạy lệnh:

    ```sh
    npx expo start
    ```

    Sau khi chạy lệnh bạn có thể quét mã QR bằng ứng dụng Expo Go trên điện thoại của mình để xem ứng dụng trực tiếp, hoặc chạy trên trình giả lập. **Hiện tại, ứng dụng hoạt động tốt nhất trên Android.**
