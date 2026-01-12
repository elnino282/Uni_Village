# Google Maps Integration Guide

## 📋 Overview

NavigationScreen hiện đang sử dụng **mock data**. Để sử dụng Google Maps API thật, làm theo hướng dẫn bên dưới.

---

## 🔑 Bước 1: Lấy Google Maps API Key

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable các APIs sau:
   - **Directions API** - Cho turn-by-turn navigation
   - **Distance Matrix API** - Tính khoảng cách và thời gian
   - **Geocoding API** - Convert địa chỉ thành tọa độ
   - **Maps SDK for Android** (nếu build Android)
   - **Maps SDK for iOS** (nếu build iOS)

4. Tạo API credentials:
   - Vào **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy API key

5. **Bảo mật API key:**
   - Click vào API key vừa tạo
   - Thêm restrictions:
     - **Application restrictions**: Chọn iOS/Android apps
     - **API restrictions**: Chỉ chọn các APIs đã enable ở trên

---

## ⚙️ Bước 2: Cấu hình trong Project

### 2.1. Thêm API Key vào `.env` file

Tạo file `.env` ở root của project (nếu chưa có):

```bash
# .env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**⚠️ QUAN TRỌNG:** Thêm `.env` vào `.gitignore` để không commit API key lên Git!

```bash
# .gitignore
.env
.env.local
```

### 2.2. Restart Expo

Sau khi thêm API key, restart Expo dev server:

```bash
npm start -- --clear
```

---

## 🔧 Bước 3: Enable Real API Calls

### 3.1. Mở file `googleMapsService.ts`

File: `src/lib/maps/googleMapsService.ts`

### 3.2. Uncomment code thật

Tìm function `getDirections()` và uncomment phần này:

```typescript
export async function getDirections(
  origin: Location,
  destination: Location
): Promise<NavigationRoute> {
  // UNCOMMENT THIS BLOCK:
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${origin.latitude},${origin.longitude}` +
      `&destination=${destination.latitude},${destination.longitude}` +
      `&mode=driving` +
      `&language=vi` +
      `&key=${env.GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch directions');
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Directions API error: ${data.status}`);
    }
    
    return parseDirectionsResponse(data);
  } catch (error) {
    console.error('Error fetching directions:', error);
    throw error;
  }

  // DELETE OR COMMENT OUT MOCK DATA:
  // return new Promise((resolve) => { ... });
}
```

---

## ✅ Bước 4: Test

1. Build lại app:
   ```bash
   npm run android
   # hoặc
   npm run ios
   ```

2. Vào **ActiveTripScreen** → bấm **"Chỉ đường"**

3. NavigationScreen sẽ:
   - Gọi Google Directions API
   - Hiển thị route thật trên map
   - Show turn-by-turn instructions thật
   - Cập nhật distance/duration từ Google

---

## 🎯 Features khi có API Key

### Hiện tại (Mock Data):
- ✅ UI giống Google Maps
- ✅ Route visualization
- ✅ Turn-by-turn instructions (hardcoded)
- ❌ Route không chính xác
- ❌ Instructions không real-time

### Với API Key:
- ✅ Route thật từ Google Maps
- ✅ Turn-by-turn instructions chi tiết
- ✅ Real-time traffic data
- ✅ Alternative routes
- ✅ Accurate ETA
- ✅ Rerouting khi đi sai đường

---

## 🔒 Security Best Practices

### 1. Không hardcode API key trong code
❌ BAD:
```typescript
const API_KEY = 'AIzaSyD...';
```

✅ GOOD:
```typescript
import { env } from '@/config/env';
const API_KEY = env.GOOGLE_MAPS_API_KEY;
```

### 2. Restrict API key
- Chỉ allow từ app bundle ID của bạn
- Chỉ enable APIs cần thiết
- Set usage limits để tránh overcharge

### 3. Monitor usage
- Vào Google Cloud Console → **APIs & Services** → **Dashboard**
- Check daily requests
- Set up billing alerts

---

## 💰 Pricing

Google Maps Platform **KHÔNG MIỄN PHÍ** nhưng có $200 free credit mỗi tháng.

### Directions API:
- **$5** per 1,000 requests
- Free credit: ~40,000 requests/tháng

### Distance Matrix API:
- **$5** per 1,000 elements
- Free credit: ~40,000 elements/tháng

### Tips tiết kiệm:
1. Cache routes đã query
2. Batch requests khi có thể
3. Sử dụng Places API Autocomplete thay vì Geocoding khi search

---

## 🐛 Troubleshooting

### Lỗi: "API key not valid"
- Check API key đã enable Directions API chưa
- Check restrictions của API key
- Restart Expo: `npm start -- --clear`

### Lỗi: "OVER_QUERY_LIMIT"
- Đã hết free credit
- Check billing trong Google Cloud Console

### Lỗi: "REQUEST_DENIED"
- API key bị restrict
- Check Application restrictions trong Cloud Console

### Route không hiển thị
- Check lat/lng có đúng không
- Check console logs
- Verify API response status

---

## 📚 Resources

- [Google Directions API Docs](https://developers.google.com/maps/documentation/directions)
- [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)
- [Best Practices](https://developers.google.com/maps/documentation/directions/best-practices)

---

## 💡 Future Enhancements

Sau khi có API key, có thể thêm:

1. **Real-time location tracking**
   - Sử dụng Expo Location API
   - Update current position mỗi 5 giây
   - Reroute nếu user đi sai

2. **Voice navigation**
   - Text-to-speech cho instructions
   - Background audio

3. **Alternative routes**
   - Show fastest/shortest/avoid tolls
   - Real-time traffic

4. **Offline maps**
   - Cache tiles cho offline use
   - Save favorite routes

5. **Place details**
   - Photos, reviews, opening hours
   - Call, share, save locations

---

**Happy Coding! 🚀**
