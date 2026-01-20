/**
 * Gemini AI Service
 * 
 * CURRENT STATUS: Using REAL GEMINI AI ✅
 * This service provides AI-generated itinerary suggestions
 * using Google's Gemini API
 * 
 * API Key configured in .env file
 * Falls back to mock data if API fails or key is missing
 */

import { env } from '@/config/env';


export interface ItineraryRequest {
  activity: 'deadline' | 'food-tour' | 'date-chill' | 'hangout';
  transport: 'walking-bus' | 'motorbike';
  budget: 'low' | 'high';
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  time: string;
  duration?: string;
  category: string;
  budget?: string;
  place: {
    name: string;
    address: string;
    rating: number;
    lat: number;
    lng: number;
  };
  isCheckedIn: boolean;
  isSkipped: boolean;
}

export interface ItineraryResponse {
  title: string;
  destinations: Destination[];
}

/**
 * Generate an itinerary based on user preferences
 * Uses real Gemini AI API with retry logic and fallback to mock data
 */
export async function generateItinerary(request: ItineraryRequest): Promise<ItineraryResponse> {
  try {
    const apiKey = env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found. Using mock data.');
      return generateMockItinerary(request);
    }

    // Build the prompt based on user preferences
    const prompt = buildPrompt(request);

    console.log('🤖 Calling Gemini AI...');

    // Try with retry logic (max 3 attempts with exponential backoff)
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📡 Attempt ${attempt}/${maxRetries}...`);

        // Call Gemini API with the v1 API (v1beta doesn't support gemini-1.5-flash)
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              }
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
          
          // If 503 (overloaded) or 429 (rate limit), retry with backoff
          if (response.status === 503 || response.status === 429) {
            lastError = error;
            if (attempt < maxRetries) {
              const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
              console.warn(`⏳ Model overloaded, retrying in ${waitTime / 1000}s...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }
          
          throw error;
        }

        const data = await response.json();
        
        // Parse the AI response
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiText) {
          throw new Error('No response from Gemini AI');
        }

        console.log('✅ Gemini AI response received');

        // Parse the JSON response from AI
        const itinerary = parseAIResponse(aiText, request);
        
        return itinerary;

      } catch (error) {
        lastError = error as Error;
        
        // If not a retryable error, throw immediately
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('503') && !errorMessage.includes('429')) {
          throw error;
        }
        
        // Last attempt failed, throw
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }

    throw lastError || new Error('Failed after retries');
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    // Fallback to mock data if API fails
    console.warn('⚠️ Using mock data as fallback');
    return generateMockItinerary(request);
  }
}

/**
 * Build a detailed prompt for Gemini AI
 */
function buildPrompt(request: ItineraryRequest): string {
  const activityDescriptions: Record<string, string> = {
    'deadline': 'chạy deadline, cần nơi yên tĩnh để làm việc và học tập',
    'food-tour': 'đi ăn uống, khám phá ẩm thực',
    'date-chill': 'hẹn hò, cần không gian riêng tư và lãng mạn',
    'hangout': 'tụ tập bạn bè, vui chơi giải trí',
  };

  const transportDescriptions: Record<string, string> = {
    'walking-bus': 'đi bộ hoặc xe buýt, các địa điểm nên gần nhau',
    'motorbike': 'xe máy, có thể đi xa hơn',
  };

  const budgetDescriptions: Record<string, string> = {
    'low': 'ngân sách thấp, các địa điểm giá rẻ, sinh viên',
    'high': 'ngân sách cao hơn, có thể đến các nơi cao cấp',
  };

  return `
Bạn là trợ lý AI chuyên tạo lịch trình du lịch cho sinh viên ở Sài Gòn.

Yêu cầu của người dùng:
- Mục đích: ${activityDescriptions[request.activity]}
- Phương tiện: ${transportDescriptions[request.transport]}
- Ngân sách: ${budgetDescriptions[request.budget]}

Hãy đề xuất một lịch trình từ 2-4 địa điểm phù hợp ở khu vực Đại học Quốc Gia TP.HCM hoặc các khu vực gần đó.

Trả về kết quả dưới dạng JSON với format sau:
{
  "title": "Tên lịch trình ngắn gọn",
  "destinations": [
    {
      "id": "1",
      "name": "Tên địa điểm",
      "description": "Mô tả ngắn gọn 10-15 từ",
      "time": "14:00",
      "duration": "~30 phút",
      "category": "Học tập/Ăn uống/Giải trí",
      "budget": "~50k",
      "place": {
        "name": "Tên địa điểm đầy đủ",
        "address": "Địa chỉ cụ thể",
        "rating": 4.5,
        "lat": 10.7630,
        "lng": 106.6830
      },
      "isCheckedIn": false,
      "isSkipped": false
    }
  ]
}

Lưu ý:
- Thời gian bắt đầu từ 14:00
- Khoảng cách giữa các điểm phù hợp với phương tiện di chuyển
- Mô tả ngắn gọn, có emoji phù hợp
- Tọa độ chính xác của địa điểm thực tế
`;
}

/**
 * Parse AI response and convert to ItineraryResponse
 */
function parseAIResponse(aiText: string, request: ItineraryRequest): ItineraryResponse {
  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = aiText.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonText = jsonMatch ? jsonMatch[1] : aiText;
    
    const parsed = JSON.parse(jsonText);
    
    // Validate the response structure
    if (!parsed.title || !Array.isArray(parsed.destinations)) {
      throw new Error('Invalid response structure');
    }
    
    return parsed as ItineraryResponse;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Return fallback mock data
    return generateMockItinerary(request);
  }
}

/**
 * Generate mock itinerary as fallback
 */
function generateMockItinerary(request: ItineraryRequest): ItineraryResponse {
  // Same as the mock response above
  const mockDestinations: Destination[] = [
    {
      id: '1',
      name: 'Thư Viện Tổng Hợp',
      description: 'Vừa học bài vừa có điểm tốt lành Bạt Học',
      time: '14:00',
      duration: 'Hoàn tất',
      category: 'Học tập',
      budget: request.budget === 'low' ? '~50k' : '~100k',
      place: {
        name: 'Thư Viện Tổng Hợp',
        address: 'Khu A, Đại học Quốc Gia',
        rating: 4.5,
        lat: 10.7630,
        lng: 106.6830,
      },
      isCheckedIn: false,
      isSkipped: false,
    },
    {
      id: '2',
      name: 'Canteen Khu A',
      description: 'Căn tin ăn vừa, cơm tấm 25k ngon',
      time: '18:30',
      duration: '250m tới Thư ngm',
      category: 'Ăn uống',
      budget: request.budget === 'low' ? '~30k' : '~80k',
      place: {
        name: 'Canteen Khu A',
        address: 'Khu A, Đại học Quốc Gia',
        rating: 4.0,
        lat: 10.7640,
        lng: 106.6840,
      },
      isCheckedIn: false,
      isSkipped: false,
    },
  ];

  const activityTitles: Record<string, string> = {
    'deadline': 'Chạy deadline cực căng 🔥',
    'food-tour': 'Tour ăn ngon Sài Gòn 😋',
    'date-chill': 'Hẹn hò lãng mạn 💖',
    'hangout': 'Tụ tập bạn bè vui vẻ 🎮',
  };

  return {
    title: activityTitles[request.activity] || 'Lịch trình gợi ý',
    destinations: mockDestinations,
  };
}
