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
 * Uses real Gemini AI API with fallback to mock data
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

    // Call Gemini API with gemini-2.5-flash model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
            maxOutputTokens: 2048,  // Increased to prevent truncation
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
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

Hãy đề xuất một lịch trình từ 2-3 địa điểm phù hợp ở khu vực Đại học Quốc Gia TP.HCM hoặc các khu vực gần đó.

CHỈ TRẢ VỀ JSON OBJECT HOÀN CHỈNH, KHÔNG CÓ TEXT GIẢI THÍCH.

Format JSON bắt buộc:
{
  "title": "Tên lịch trình ngắn gọn",
  "destinations": [
    {
      "id": "1",
      "name": "Tên địa điểm",
      "description": "Mô tả ngắn 10 từ",
      "time": "14:00",
      "duration": "~30 phút",
      "category": "Học tập",
      "budget": "~50k",
      "place": {
        "name": "Tên địa điểm",
        "address": "Địa chỉ ngắn",
        "rating": 4.5,
        "lat": 10.7630,
        "lng": 106.6830
      },
      "isCheckedIn": false,
      "isSkipped": false
    }
  ]
}

QUY TẮC BẮT BUỘC:
- CHỈ trả về JSON object hoàn chỉnh từ { đến }
- KHÔNG code block, KHÔNG giải thích
- 2-3 destinations (tối đa 3)
- Mô tả và địa chỉ ngắn gọn
- Tọa độ chính xác
`;
}

/**
 * Parse AI response and convert to ItineraryResponse
 */
function parseAIResponse(aiText: string, request: ItineraryRequest): ItineraryResponse {
  try {
    console.log('🔍 Raw AI response:', aiText.substring(0, 200) + '...');
    
    // Try multiple extraction methods
    let jsonText = aiText;
    
    // Method 1: Extract from ```json code block
    const jsonMatch = aiText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
      console.log('📝 Extracted from ```json block');
    }
    
    // Method 2: Extract from ``` code block (no language specified)
    if (!jsonMatch) {
      const codeMatch = aiText.match(/```\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        jsonText = codeMatch[1];
        console.log('📝 Extracted from ``` block');
      }
    }
    
    // Method 3: Find JSON object directly (look for { ... })
    if (!jsonMatch) {
      const objectMatch = aiText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonText = objectMatch[0];
        console.log('📝 Extracted JSON object directly');
      }
    }
    
    // Clean up the text
    jsonText = jsonText.trim();
    
    // Validate JSON is complete (basic check)
    const openBraces = (jsonText.match(/\{/g) || []).length;
    const closeBraces = (jsonText.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      console.warn('⚠️ Incomplete JSON detected - braces mismatch');
      console.warn(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);
      throw new Error('Incomplete JSON response from AI - possibly truncated');
    }
    
    const parsed = JSON.parse(jsonText);
    
    // Validate the response structure
    if (!parsed.title || !Array.isArray(parsed.destinations)) {
      throw new Error('Invalid response structure - missing title or destinations');
    }
    
    // Validate destinations have required fields
    if (parsed.destinations.length === 0) {
      throw new Error('No destinations in response');
    }
    
    console.log('✅ Successfully parsed AI response:', parsed.title);
    return parsed as ItineraryResponse;
  } catch (error) {
    console.error('❌ Failed to parse AI response:', error);
    console.error('📄 Raw text that failed:', aiText.substring(0, 500));
    console.warn('⚠️ Using mock data as fallback');
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
