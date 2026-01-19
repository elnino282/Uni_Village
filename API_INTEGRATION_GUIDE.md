# Hướng dẫn tích hợp API Keys

## ✅ Đã hoàn thành

Đã tích hợp thành công 2 API keys vào module itinerary:

### 1. **Gemini AI API** 🤖
- **File cấu hình**: `.env`
- **Service**: `src/lib/ai/geminiService.ts`
- **Chức năng**: Tạo lịch trình tự động bằng AI
- **Trạng thái**: ✅ Đã kích hoạt Real API
- **Fallback**: Tự động dùng mock data nếu API lỗi

### 2. **Google Maps API** 🗺️
- **File cấu hình**: `.env`
- **Service**: `src/lib/maps/googleMapsService.ts`
- **Chức năng**: Chỉ đường, turn-by-turn navigation
- **Trạng thái**: ✅ Đã kích hoạt Real API
- **Fallback**: Tự động dùng mock data nếu API lỗi

---

## 🚀 Cách chạy sau khi tích hợp

### **Bắt buộc: Restart app với cache clear**

```bash
# Dừng app hiện tại (Ctrl + C)
# Sau đó chạy lại với --clear để load .env file mới
npm start -- --clear
```

Hoặc:

```bash
# Xóa cache và restart
npx expo start --clear
```

---

## 📋 Kiểm tra hoạt động

### **1. Test Gemini AI**
- Vào màn hình Itinerary
- Nhấn nút **"Gợi ý lịch trình bằng AI"**
- Chọn activity, transport, budget
- Xem console logs:
  - `🤖 Calling Gemini AI...` → Đang gọi API
  - `✅ Gemini AI response received` → Thành công
  - `⚠️ Using mock data as fallback` → Lỗi, dùng mock

### **2. Test Google Maps**
- Vào lịch trình đang diễn ra
- Nhấn nút **"Chỉ đường"** ở bất kỳ địa điểm nào
- Xem console logs:
  - `🗺️ Calling Google Maps Directions API...` → Đang gọi API
  - `✅ Google Maps response received` → Thành công
  - `⚠️ Using mock data as fallback` → Lỗi, dùng mock

---

## 🔍 Debug nếu có lỗi

### **Lỗi: API key không được load**
```bash
# Đảm bảo đã restart với --clear
npm start -- --clear

# Kiểm tra file .env có đúng format:
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyBXWL8zv1kODvwQYfuWrZAryLGGr6xoBJ0
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCZe2e7rS3v2e6NfcDUrTLcTgr6ECfkxZc
```

### **Lỗi: API trả về 403/401**
- Kiểm tra API key còn hạn không
- Đảm bảo đã enable APIs trên Google Cloud Console:
  - Gemini AI: https://ai.google.dev/
  - Google Maps Directions API: https://console.cloud.google.com/

### **Lỗi: API trả về OVER_QUERY_LIMIT**
- Bạn đã dùng hết quota miễn phí
- App sẽ tự động fallback về mock data

---

## 📝 Thay đổi đã thực hiện

### **File mới:**
- `.env` → Chứa API keys

### **Files đã sửa:**

1. **src/lib/ai/geminiService.ts**
   - ✅ Thêm import env
   - ✅ Chuyển từ mock sang real API
   - ✅ Thêm error handling với fallback
   - ✅ Thêm console logs để debug

2. **src/lib/maps/googleMapsService.ts**
   - ✅ Thêm console logs để debug
   - ✅ Cải thiện error messages
   - ✅ Xác nhận đã sử dụng real API

---

## 🎯 Kết luận

**Trả lời câu hỏi của bạn: Đã đủ dữ liệu! ✅**

Với 2 API keys này, module itinerary đã được tích hợp đầy đủ:
- ✅ AI wizard tạo lịch trình tự động
- ✅ Navigation với Google Maps
- ✅ Fallback thông minh khi API lỗi
- ✅ Console logs để monitor API calls

**Chỉ cần restart app với `npm start -- --clear` là có thể dùng được!**
