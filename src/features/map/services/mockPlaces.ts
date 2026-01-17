import type { CategoryChip, MapRegion, Place } from '../types';

export const DEFAULT_REGION: MapRegion = {
    latitude: 10.7626,
    longitude: 106.6824,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};

export const CATEGORY_CHIPS: CategoryChip[] = [
    { id: 'all', label: 'Tất cả', icon: 'apps' },
    { id: 'home', label: 'Nhà', icon: 'home' },
    { id: 'restaurant', label: 'Nhà hàng', icon: 'restaurant' },
    { id: 'hotel', label: 'Khách sạn', icon: 'hotel' },
    { id: 'shopping', label: 'Mua sắm', icon: 'shopping-bag' },
    { id: 'cafe', label: 'Quán cà phê', icon: 'local-cafe' },
    { id: 'entertainment', label: 'Giải trí', icon: 'sports-esports' },
];

const MOCK_REVIEWS = [
    {
        id: 'r1',
        authorName: 'Nguyễn Văn A',
        rating: 5,
        text: 'Địa điểm tuyệt vời, nhân viên thân thiện.',
        relativeTimeDescription: '2 ngày trước'
    },
    {
        id: 'r2',
        authorName: 'Trần Thị B',
        rating: 4,
        text: 'Không gian đẹp nhưng hơi ồn vào giờ cao điểm.',
        relativeTimeDescription: '1 tuần trước'
    },
    {
        id: 'r3',
        authorName: 'Lê Văn C',
        rating: 5,
        text: 'Đồ uống ngon, giá cả hợp lý.',
        relativeTimeDescription: '3 tuần trước'
    }
];

export const MOCK_PLACES: Place[] = [
    {
        id: '1',
        name: 'The Coffee House - Đại học',
        category: 'cafe',
        rating: 4.5,
        ratingCount: 234,
        distanceKm: 0.3,
        tags: ['Yên tĩnh', 'Wifi tốt', 'Sống ảo'],
        thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
        lat: 10.7630,
        lng: 106.6830,
        address: '123 Đường Nguyễn Văn Cừ, Q.5',
        description: 'Quán cà phê yên tĩnh, không gian rộng rãi phù hợp học tập',
        isOpen: true,
        priceLevel: 2,
        reviews: MOCK_REVIEWS,
    },
    {
        id: '2',
        name: 'Phở Hùng',
        category: 'restaurant',
        rating: 4.3,
        ratingCount: 456,
        distanceKm: 0.5,
        tags: ['Đông khách', 'Giá rẻ'],
        thumbnail: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
        lat: 10.7620,
        lng: 106.6820,
        address: '45 Đường Lê Hồng Phong, Q.10',
        description: 'Phở truyền thống Sài Gòn, mở cửa từ 6h sáng',
        isOpen: true,
        priceLevel: 1,
        reviews: [MOCK_REVIEWS[0], MOCK_REVIEWS[2]],
    },
    {
        id: '3',
        name: 'Vincom Center',
        category: 'shopping',
        rating: 4.6,
        ratingCount: 1205,
        distanceKm: 1.2,
        tags: ['Mua sắm', 'Điện ảnh', 'Ẩm thực'],
        thumbnail: 'https://images.unsplash.com/photo-1567449303183-ae0d6ed1498e?w=400',
        lat: 10.7650,
        lng: 106.6850,
        address: '72 Lê Thánh Tôn, Q.1',
        description: 'Trung tâm thương mại lớn với nhiều thương hiệu quốc tế',
        isOpen: true,
        priceLevel: 3,
    },
    {
        id: '4',
        name: 'Highlands Coffee',
        category: 'cafe',
        rating: 4.2,
        ratingCount: 189,
        distanceKm: 0.4,
        tags: ['Cà phê ngon', 'View đẹp'],
        thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        lat: 10.7615,
        lng: 106.6810,
        address: '88 Nguyễn Trãi, Q.5',
        description: 'Chuỗi cà phê nổi tiếng với không gian hiện đại',
        isOpen: true,
        priceLevel: 2,
    },
    {
        id: '5',
        name: 'Cơm tấm Sài Gòn',
        category: 'restaurant',
        rating: 4.4,
        ratingCount: 312,
        distanceKm: 0.6,
        tags: ['Ngon', 'Đặc sản'],
        thumbnail: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
        lat: 10.7640,
        lng: 106.6815,
        address: '56 Võ Văn Tần, Q.3',
        description: 'Cơm tấm sườn bì chả chuẩn vị Sài Gòn',
        isOpen: true,
        priceLevel: 1,
    },
    {
        id: '6',
        name: 'Khách sạn Rex',
        category: 'hotel',
        rating: 4.7,
        ratingCount: 678,
        distanceKm: 2.1,
        tags: ['Sang trọng', '5 sao'],
        thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        lat: 10.7735,
        lng: 106.7010,
        address: '141 Nguyễn Huệ, Q.1',
        description: 'Khách sạn 5 sao biểu tượng của Sài Gòn',
        isOpen: true,
        priceLevel: 4,
    },
    {
        id: '7',
        name: 'CGV Cinemas',
        category: 'entertainment',
        rating: 4.5,
        ratingCount: 890,
        distanceKm: 1.5,
        tags: ['Phim hay', 'IMAX'],
        thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
        lat: 10.7680,
        lng: 106.6900,
        address: 'Vincom Center, Q.1',
        description: 'Rạp chiếu phim hiện đại với công nghệ IMAX',
        isOpen: true,
        priceLevel: 2,
    },
    {
        id: '8',
        name: 'Ký túc xá Đại học',
        category: 'home',
        rating: 3.8,
        ratingCount: 156,
        distanceKm: 0.1,
        tags: ['Gần trường', 'An ninh'],
        thumbnail: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
        lat: 10.7625,
        lng: 106.6822,
        address: 'Khu A, Ký túc xá ĐH',
        description: 'Ký túc xá sinh viên với đầy đủ tiện nghi',
        isOpen: true,
        priceLevel: 1,
    },
];

export function getPlacesByCategory(category: string): Place[] {
    if (category === 'all') {
        return MOCK_PLACES;
    }
    return MOCK_PLACES.filter(place => place.category === category);
}

export function getPlaceById(id: string): Place | undefined {
    return MOCK_PLACES.find(place => place.id === id);
}

export function searchPlaces(query: string): Place[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return MOCK_PLACES;
    
    return MOCK_PLACES.filter(place => 
        place.name.toLowerCase().includes(lowerQuery) ||
        place.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        place.category.toLowerCase().includes(lowerQuery)
    );
}
