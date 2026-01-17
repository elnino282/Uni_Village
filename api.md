# VNU Guide Backend API (React Native Integration)

Tài liệu này mô tả chi tiết REST API và WebSocket của VNU Guide backend để đội React Native có thể tích hợp nhanh, hạn chế hỏi lại.

## 1) Base URL và môi trường
- Local dev: `http://localhost:8080`
- Production: cung cấp theo môi trường triển khai (tham khảo cấu hình OpenAPI trong backend).

Tất cả REST endpoints bên dưới đều có prefix `/api/v1` (trừ các endpoint OAuth2/SWAGGER).

## 2) Authentication
### 2.1 JWT Bearer Token
Các endpoint cần xác thực yêu cầu header:
```
Authorization: Bearer <access_token>
```

Access token nhận được từ:
- `POST /api/v1/auth/verify-otp-register`
- `POST /api/v1/auth/verify-otp-forget-password`
- `POST /api/v1/auth/authenticate`
- `POST /api/v1/auth/refresh-token` (dùng refresh token)

### 2.2 Refresh Token
`POST /api/v1/auth/refresh-token` yêu cầu **Authorization header chứa refresh token** (Bearer). Response trả ra **raw JSON AuthenticationResponse**, không bọc `ApiResponse`.

## 3) Response Format
### 3.1 Success Response (ApiResponse)
Hầu hết REST endpoints trả:
```json
{
  "code": 200,
  "message": "Message text",
  "result": { }
}
```

### 3.2 Error Response
Khi lỗi, backend trả `ErrorResponse`:
```json
{
  "status": 400,
  "errorCode": "BAD_REQUEST",
  "error": "Bad Request",
  "message": "Human readable message",
  "path": "/api/v1/..."
}
```

### 3.3 Validation Errors
Khi validation fail (400):
```json
{
  "status": 400,
  "error": "Validation Failed",
  "path": "/api/v1/...",
  "errors": [
    { "field": "email", "message": "must not be blank" }
  ]
}
```

## 4) Pagination
Backend sử dụng Spring Data `Page` hoặc `Slice`.

### 4.1 Page
Ví dụ fields phổ biến:
- `content`: mảng dữ liệu
- `totalElements`, `totalPages`
- `size`, `number` (page index bắt đầu từ 0)
- `first`, `last`, `empty`

### 4.2 Slice
Tương tự Page nhưng **không có** `totalElements`, `totalPages`.
- `content`, `size`, `number`, `first`, `last`, `empty`

## 5) File Upload
Một số endpoint dùng `multipart/form-data`. Kích thước file tối đa: **20MB** (theo cấu hình Spring).

## 6) WebSocket (STOMP)
### 6.1 Endpoint
- Native WebSocket: `ws://<host>/ws`
- SockJS fallback: `http://<host>/ws`

### 6.2 Authentication
Khi CONNECT, phải gửi header:
```
Authorization: Bearer <access_token>
```

Nếu thiếu hoặc token invalid, server từ chối kết nối.

### 6.3 Prefix
- App destination prefix: `/app`
- Topic: `/topic`
- User queue: `/user/queue`

### 6.4 Message Envelope
Mọi message realtime được wrap bởi:
```json
{
  "eventType": "SEND|EDIT|UNSEND|SEEN|DELIVERED|TYPING|CHANNEL_CHANGED|COMMENT_CHANGED|REACTION_CHANGED|POST_CHANGED|SEND_JOIN_REQUEST|ACCEPT_JOIN_REQUEST|REJECT_JOIN_REQUEST",
  "data": { }
}
```

### 6.5 Topics sử dụng
- Conversation: `/topic/conversation.{conversationId}`
- Channel: `/topic/channel.{conversationId}`
- Post comments: `/topic/post.{postId}.comments`
- Post reactions: `/topic/post.{postId}.reactions`
- User queue: `/user/queue/message`, `/user/queue/join-conversation`, `/user/queue/typing`

### 6.6 Typing API (STOMP)
- Client gửi typing event đến: `/app/typing/{conversationId}`
- Payload: `TypingEvent`
```json
{
  "userId": 1,
  "userName": "Nguyen Van A",
  "conversationId": "abc-123",
  "isTyping": true
}
```

## 7) API Endpoints

### 7.1 Authentication
**POST `/api/v1/auth/register`** (Public)  
Request: `RegisterRequest`
- `firstname` (string, required)
- `lastname` (string, required)
- `email` (string, required, email)
- `username` (string, required)
- `password` (string, required)
Response: `ApiResponse` (message: OTP sent)

**POST `/api/v1/auth/forget-password`** (Public)  
Request: `ForgetPasswordRequest`
- `email` (string, required, email)
- `newPassword` (string)
- `confirmPassword` (string)
Response: `ApiResponse` (message: OTP sent)

**POST `/api/v1/auth/verify-otp-register`** (Public)  
Request: `VerifyRequest` (`email`, `otp`)  
Response: `ApiResponse<AuthenticationResponse>`

**POST `/api/v1/auth/verify-otp-forget-password`** (Public)  
Request: `VerifyRequest`  
Response: `ApiResponse<AuthenticationResponse>`

**POST `/api/v1/auth/authenticate`** (Public)  
Request: `AuthenticationRequest` (`email`, `password`)  
Response: `ApiResponse<AuthenticationResponse>`

**POST `/api/v1/auth/refresh-token`** (Public)  
Header: `Authorization: Bearer <refresh_token>`  
Response body (raw):
```json
{
  "access_token": "new_access_token",
  "refresh_token": "refresh_token"
}
```

### 7.2 User
**POST `/api/v1/users/changepassword`** (Auth)  
Request: `ChangePasswordRequest`
- `oldPassword` (string, required)
- `newPassword` (string, required)
- `confirmPassword` (string, required)
Response: `ApiResponse<String>`

### 7.3 Areas
**GET `/api/v1/areas`** (Public)  
Response: `ApiResponse<List<AreaResponse>>`

**POST `/api/v1/admin/areas`** (Admin)  
Request: `AreaRequest`  
Response: `ApiResponse<AreaResponse>` (201)

**PATCH `/api/v1/admin/areas/{id}`** (Admin)  
Request: `AreaRequest`  
Response: `ApiResponse<AreaResponse>`

### 7.4 Place Types
**GET `/api/v1/place-types`** (Public)  
Response: `ApiResponse<List<PlaceTypeResponse>>`

**POST `/api/v1/admin/place-types`** (Admin)  
Request: `PlaceTypeRequest`  
Response: `ApiResponse<PlaceTypeResponse>` (201)

**PATCH `/api/v1/admin/place-types/{id}`** (Admin)  
Request: `PlaceTypeRequest`  
Response: `ApiResponse<PlaceTypeResponse>`

### 7.5 Locations
**GET `/api/v1/locations/provinces`** (Public)  
Response: `ApiResponse<List<ProvinceResponse>>`

**GET `/api/v1/locations/districts?provinceId={id}`** (Public)  
Response: `ApiResponse<List<DistrictResponse>>`

**GET `/api/v1/locations/wards?districtId={id}`** (Public)  
Response: `ApiResponse<List<WardResponse>>`

### 7.6 Places
**GET `/api/v1/places`** (Public)  
Query:
- `keyword` (string)
- `typeId` (long)
- `provinceId` (long)
- `districtId` (long)
- `wardId` (long)
- `status` (PlaceStatus: ACTIVE|TEMP_CLOSED|CLOSED)
- `lat`, `lng`, `radius` (double)  
- `page` (int, default 0), `size` (int, default 10)

Lưu ý: Nếu truyền đủ `lat`, `lng`, `radius`, backend **trả `result: null`** và chỉ ghi thông tin trong `message`. Để lấy list đầy đủ, nên dùng endpoint `/places/nearby`.

Response: `ApiResponse<Page<PlaceResponse>>`

**GET `/api/v1/places/nearby`** (Public)  
Query: `lat`, `lng` (required), `radius` (default 5), `keyword`, `typeId`, `status`  
Response: `ApiResponse<List<PlaceResponse>>`

**GET `/api/v1/places/{id}`** (Public)  
Response: `ApiResponse<PlaceResponse>`

**POST `/api/v1/admin/places`** (Admin)  
Request: `PlaceRequest`  
Response: `ApiResponse<PlaceResponse>` (201)

**PATCH `/api/v1/admin/places/{id}`** (Admin)  
Request: `PlaceRequest`  
Response: `ApiResponse<PlaceResponse>`

**PATCH `/api/v1/admin/places/{id}/status`** (Admin)  
Request: `PlaceStatusRequest`  
Response: `ApiResponse<PlaceResponse>`

### 7.7 Place Suggestions
**POST `/api/v1/place-suggestions`** (Auth)  
Request: `PlaceSuggestionRequest`  
Response: `ApiResponse<PlaceSuggestionResponse>` (201)

**GET `/api/v1/me/place-suggestions`** (Auth)  
Query: `status` (PlaceSuggestionStatus), `page`, `size`  
Response: `ApiResponse<Page<PlaceSuggestionResponse>>`

**GET `/api/v1/admin/place-suggestions`** (Admin)  
Query: `status`, `page`, `size`  
Response: `ApiResponse<Page<PlaceSuggestionResponse>>`

**PATCH `/api/v1/admin/place-suggestions/{id}/review`** (Admin)  
Request: `PlaceSuggestionReviewRequest`  
Response: `ApiResponse<PlaceSuggestionResponse>`

### 7.8 Personal Pins
**GET `/api/v1/me/personal-pins`** (Auth)  
Query: `page`, `size`  
Response: `ApiResponse<Page<PersonalPinResponse>>`

**POST `/api/v1/me/personal-pins`** (Auth)  
Request: `PersonalPinRequest`  
Response: `ApiResponse<PersonalPinResponse>` (201)

**PATCH `/api/v1/me/personal-pins/{id}`** (Auth)  
Request: `PersonalPinRequest`  
Response: `ApiResponse<PersonalPinResponse>`

**DELETE `/api/v1/me/personal-pins/{id}`** (Auth)  
Response: `ApiResponse<String>` (HTTP 204)

### 7.9 Tours
**GET `/api/v1/me/tours`** (Auth)  
Query: `status` (TourStatus), `page`, `size`  
Response: `ApiResponse<Page<TourResponse>>`

**GET `/api/v1/me/tours/current`** (Auth)  
Response: `ApiResponse<TourResponse>` (`result` có thể `null`)

**POST `/api/v1/me/tours`** (Auth)  
Request: `TourRequest`  
Response: `ApiResponse<TourResponse>` (201)

**GET `/api/v1/tours/{id}`** (Public theo SecurityConfig, có thể gửi token để personalize)  
Response: `ApiResponse<TourResponse>`

**PATCH `/api/v1/me/tours/{id}`** (Auth)  
Request: `TourRequest`  
Response: `ApiResponse<TourResponse>`

**POST `/api/v1/me/tours/{id}/complete`** (Auth)  
Response: `ApiResponse<TourResponse>`

**POST `/api/v1/me/tours/{id}/cancel`** (Auth)  
Response: `ApiResponse<TourResponse>`

**POST `/api/v1/me/tours/{id}/share-as-post`** (Auth)  
Request: `TourShareRequest`  
Response: `ApiResponse<TourResponse>`

**POST `/api/v1/tours/{id}/copy`** (Auth)  
Response: `ApiResponse<TourResponse>` (201)

### 7.10 Tour Stops
**GET `/api/v1/tours/{id}/stops`** (Auth)  
Response: `ApiResponse<List<TourStopResponse>>`

**POST `/api/v1/me/tours/{id}/stops`** (Auth)  
Request: `TourStopRequest`  
Response: `ApiResponse<TourStopResponse>` (201)

**PUT `/api/v1/me/tours/{id}/stops/reorder`** (Auth)  
Request: `TourStopReorderRequest`  
Response: `ApiResponse<List<TourStopResponse>>`

**DELETE `/api/v1/me/tours/{id}/stops/{stopId}`** (Auth)  
Response: `ApiResponse<String>` (HTTP 204)

### 7.11 Check-ins
**POST `/api/v1/check-ins`** (Auth)  
Request: `CheckInRequest`  
Response: `ApiResponse<CheckInResponse>` (201)

**GET `/api/v1/me/check-ins`** (Auth)  
Query: `placeId`, `tourId`, `from`, `to` (ISO-8601), `page`, `size`  
Response: `ApiResponse<Page<CheckInResponse>>`

### 7.12 AI Itinerary
**POST `/ai/itineraries/suggest`** (Public)  
Request: `ItinerarySuggestRequest`  
Response: `SuggestedItinerary` (không bọc ApiResponse)

### 7.13 Posts
**POST `/api/v1/posts/create`** (Auth, multipart/form-data)  
Fields:
- `content` (string, optional)
- `postType` (string, required: PostType)
- `visibility` (string, required: Visibility)
- `tourId` (string, optional)
- `files` (file[], optional)
Response: `ApiResponse<PostResponse>` (201)

**GET `/api/v1/posts/{postId}`** (Auth)  
Response: `ApiResponse<PostResponse>`

**GET `/api/v1/posts/{postId}/comments`** (Auth)  
Query: `page`, `size`  
Response: `ApiResponse<Slice<CommentResponse>>`

**GET `/api/v1/posts`** (Auth)  
Query: `page`, `size`  
Response: `ApiResponse<Slice<PostResponse>>`

**GET `/api/v1/posts/me`** (Auth)  
Query: `page`, `size`  
Response: `ApiResponse<Slice<PostResponse>>`

**POST `/api/v1/posts/{postId}/save`** (Auth)  
Response: `ApiResponse<SavedPostResponse>`

**POST `/api/v1/posts/{postId}/share`** (Auth)  
Request: `SharePostRequest`  
Response: `ApiResponse<SharePostResponse>`

**GET `/api/v1/posts/me/saved-posts`** (Auth)  
Query: `page`, `size`  
Response: `ApiResponse<Slice<PostResponse>>`

**DELETE `/api/v1/posts/{post_id}`** (Auth)  
Response: `ApiResponse<Void>` (HTTP 204)

**PUT `/api/v1/posts/{post_id}`** (Auth, multipart/form-data)  
Fields: giống `create`  
Response: `ApiResponse<PostResponse>`

### 7.14 Comments
**POST `/api/v1/comments`** (Auth)  
Request: `CommentRequest`  
Response: `ApiResponse<CommentResponse>` (201)

**PUT `/api/v1/comments/{commentId}`** (Auth)  
Request: `CommentRequest`  
Response: `ApiResponse<CommentResponse>`

**GET `/api/v1/comments/{commentId}/replies`** (Auth)  
Query: `page`, `size`  
Response: `ApiResponse<Slice<CommentResponse>>`

**DELETE `/api/v1/comments/{commentId}`** (Auth)  
Response: `ApiResponse<Void>` (HTTP 204)

### 7.15 Reactions
**POST `/api/v1/likes/post/{postId}`** (Auth)  
Response: `ApiResponse<LikeResponse>`

**POST `/api/v1/likes/comment/{commentId}`** (Auth)  
Response: `ApiResponse<LikeResponse>`

### 7.16 Conversations
**POST `/api/v1/conversations/create`** (Auth)  
Request: `ConversationPrivateRequest` (`receiverId`)  
Response: `ApiResponse<String>` (conversationId)

**GET `/api/v1/conversations/private`** (Auth)  
Query: `page`, `size`  
Response: `ApiResponse<Slice<ConversationResponse>>`

**GET `/api/v1/conversations/channels`** (Auth)  
Query: `page`, `size`  
Response: `ApiResponse<Slice<ConversationResponse>>`

**DELETE `/api/v1/conversations/delete-conversation/{conversationId}`** (Auth)  
Response: `ApiResponse<String>`

**GET `/api/v1/conversations/{conversationId}/media`** (Auth)  
Query: `fileType` (FileType)  
Response: `ApiResponse<List<MediaAttachmentResponse>>`

### 7.17 Channels
**POST `/api/v1/channels`** (Auth, multipart/form-data)  
Fields:
- `name` (string, required)
- `description` (string, optional)
- `privacy` (ChannelPrivacy, optional)
- `channelType` (ChannelType, optional)
- `participantIds` (string JSON array, optional, ví dụ: `[1,2,3]`)
- `avatar` (file, optional)
Response: `ApiResponse<ChannelResponse>` (201)

**GET `/api/v1/channels/{channelId}`** (Auth)  
Response: `ApiResponse<ChannelResponse>`

**GET `/api/v1/channels/conversation/{conversationId}`** (Auth)  
Response: `ApiResponse<ChannelResponse>`

**PATCH `/api/v1/channels/{channelId}`** (Auth, multipart/form-data)  
Fields: `name`, `description`, `avatar`  
Response: `ApiResponse<ChannelResponse>`

**GET `/api/v1/channels/{channelId}/members`** (Auth)  
Response: `ApiResponse<List<ChannelMemberResponse>>`

**POST `/api/v1/channels/{channelId}/members`** (Auth, ADMIN)  
Request: `AddChannelMemberRequest`  
Response: `ApiResponse<ChannelResponse>` (201)

**DELETE `/api/v1/channels/{channelId}/members/{memberId}`** (Auth, ADMIN)  
Response: `ApiResponse<ChannelResponse>`

**GET `/api/v1/channels/{channelId}/join-requests`** (Auth, ADMIN)  
Response: `ApiResponse<List<JoinConversationResponse>>`

### 7.18 Join Conversation
**POST `/api/v1/conversations/join/{conversationId}`** (Auth)  
Response: `ApiResponse<JoinConversationResponse>`

**POST `/api/v1/conversations/join/accept/{joinRequestId}`** (Auth, ADMIN)  
Response: `ApiResponse<JoinConversationResponse>`

**PATCH `/api/v1/conversations/join/reject/{joinRequestId}`** (Auth, ADMIN)  
Response: `ApiResponse<JoinConversationResponse>`

### 7.19 Messages
**POST `/api/v1/messages/send`** (Auth)  
Request: `MessageRequest`
- `content` (string)
- `replyToId` (long)
- `ConversationId` (string, lưu ý tên field viết hoa C)
Response: `ApiResponse<MessageResponse>`

**POST `/api/v1/messages/upload-file`** (Auth, multipart/form-data)  
Fields:
- `files` (file[], required)
- `conversationId` (string, required)
- `content` (string, optional)
- `replyToId` (long, optional)
Response: `ApiResponse<FileMessageResponse>`

**GET `/api/v1/messages`** (Auth)  
Query: `conversationId` (required), `page`, `size`  
Response: `ApiResponse<Slice<MessageResponse>>`

**DELETE `/api/v1/messages/{messageId}`** (Auth)  
Response: `ApiResponse<String>`

**PUT `/api/v1/messages/{messageId}`** (Auth)  
Body: raw string (new content)  
Response: `ApiResponse<MessageResponse>`

**POST `/api/v1/messages/mark-read`** (Auth)  
Request: `MarkReadRequest`  
Response: `ApiResponse<Void>`

**GET `/api/v1/messages/search`** (Auth)  
Query: `conversationId`, `keyword`, `page`, `size`  
Response: `ApiResponse<Slice<MessageSearchResponse>>`

## 8) Data Models (Schemas)

### 8.1 Authentication
**AuthenticationResponse**
```json
{ "access_token": "string", "refresh_token": "string" }
```

### 8.2 Place & Mapping
**AreaRequest**: `code` (string, max 50), `name` (string, max 150), `description`  
**AreaResponse**: `id`, `code`, `name`, `description`, `createdAt`, `updatedAt`  
**PlaceTypeRequest**: `code`, `name`, `description`  
**PlaceTypeResponse**: `id`, `code`, `name`, `description`  
**PlaceRequest**:
- `name` (string, required)
- `typeId` (long, required)
- `areaId`, `provinceId`, `districtId`, `wardId` (long, optional)
- `addressDetail`, `description` (string)
- `latitude`, `longitude` (double)
- `status` (PlaceStatus)
- `isOfficial` (boolean)
- `ownerUserId` (long)
**PlaceResponse**:
- `id`, `name`, `placeType`, `province`, `district`, `ward`
- `addressDetail`, `latitude`, `longitude`, `description`
- `status`, `isOfficial`, `ownerUserId`
- `createdAt`, `updatedAt`
**PlaceSuggestionRequest**: `placeName` (required), `typeId`, `areaId`, `provinceId`, `districtId`, `wardId`, `addressDetail`, `latitude`, `longitude`, `description`
**PlaceSuggestionReviewRequest**: `status` (required), `rejectionReason`, `createPlace`
**PlaceSuggestionResponse**: `id`, `suggestedById`, `suggestedByName`, `placeName`, `placeType`, `province`, `district`, `ward`, `addressDetail`, `latitude`, `longitude`, `description`, `status`, `rejectionReason`, `reviewedById`, `reviewedAt`, `createdAt`
**PersonalPinRequest**: `name` (required), `latitude`, `longitude`, `note`
**PersonalPinResponse**: `id`, `name`, `latitude`, `longitude`, `note`, `createdAt`, `updatedAt`
**ProvinceResponse**: `id`, `name`
**DistrictResponse**: `id`, `name`, `provinceId`
**WardResponse**: `id`, `name`, `districtId`

### 8.3 Tours & Check-ins
**TourRequest**: `name` (required), `description`, `startTime`, `endTime`  
**TourShareRequest**: `postTitle` (required), `visibility`  
**TourStopRequest**: `placeId` (required), `note`, `sequenceOrder`  
**TourStopReorderRequest**: `stops` = array of `{ stopId, sequenceOrder }`  
**CheckInRequest**: `placeId` (required), `tourId`, `note`, `checkedInAt`
**TourResponse**: `id`, `userId`, `userName`, `name`, `description`, `startTime`, `endTime`, `status`, `sharedAsPost`, `originalTourId`, `stops`, `staticMapUrl`, `createdAt`, `updatedAt`
**TourStopResponse**: `id`, `tourId`, `placeId`, `placeName`, `sequenceOrder`, `note`, `place`
**CheckInResponse**: `id`, `userId`, `tourId`, `placeId`, `placeName`, `checkedInAt`, `note`

### 8.4 Posts & Interactions
**CommentRequest**: `content`, `postId`, `parentCommentId`  
**SharePostRequest**: `conversationId` (required), `message`  
**PostResponse**: `id`, `content`, `postType`, `visibility`, `authorId`, `authorName`, `authorAvatarUrl`, `mediaUrls`, `createdAt`, `updatedAt`
**CommentResponse**: `id`, `content`, `authorId`, `authorName`, `authorAvatarUrl`, `postId`, `parentCommentId`, `likeCount`, `timeStamp`
**SavedPostResponse**: `postId`, `userId`, `isSaved`
**SharePostResponse**: `messageId`, `postId`, `conversationId`, `senderId`, `senderName`, `message`, `messageType`, `timestamp`
**LikeResponse**: `postId`, `commentId`, `userId`, `isLiked`, `likeCount`

### 8.5 Chat & Channels
**CreateChannelRequest**: `name` (required), `description`, `privacy`, `channelType`, `participantIds`  
**UpdateChannelRequest**: `name`, `description`  
**AddChannelMemberRequest**: `userIds` (required, array)  
**ConversationPrivateRequest**: `receiverId`  
**MessageRequest**: `content`, `replyToId`, `ConversationId`  
**MarkReadRequest**: `conversationId`, `messageId`  
**ChannelResponse**: `id`, `name`, `description`, `privacy`, `channelType`, `avatarUrl`, `conversationId`, `creatorId`, `memberCount`, `createdAt`  
**ChannelMemberResponse**: `userId`, `userName`, `avatarUrl`, `role`, `joinedAt`  
**ConversationResponse**: `id`, `name`, `avatarUrl`, `unreadCount`, `lastMessage`, `lastMessageTime`  
**JoinConversationResponse**: `id`, `conversationId`, `userId`, `status`, `createdAt`  
**MessageResponse**: `id`, `senderId`, `conversationId`, `senderName`, `senderAvatarUrl`, `content`, `messageType`, `readBy`, `isActive`, `replyToId`, `timestamp`  
**FileMessageResponse**: `id`, `senderId`, `conversationId`, `senderName`, `senderAvatarUrl`, `content`, `fileUrls`, `messageType`, `readBy`, `isActive`, `replyToId`, `timestamp`  
**MessageSearchResponse**: `id`, `conversationId`, `conversationName`, `senderId`, `senderName`, `senderAvatar`, `content`, `messageType`, `fileUrls`, `timestamp`  
**MediaAttachmentResponse**: `id`, `messageId`, `fileId`, `fileUrl`, `fileType`, `fileSize`, `uploadedAt`  
**ReadReceiptResponse**: `userId`, `fullName`, `avatarUrl`

### 8.6 AI
**ItinerarySuggestRequest**:
- `mood` (string)
- `startLatitude` (double, required)
- `startLongitude` (double, required)
- `radiusKm` (double)
- `maxStops` (int)
- `maxDurationHours` (int)
- `placeTypes` (string[])
**SuggestedItinerary**:
- `name`, `mood`, `stops`, `totalDistanceKm`, `totalDurationMinutes`, `routePolyline`, `mapPreviewUrl`
**SuggestedStop**:
- `sequenceOrder`, `googlePlaceId`, `placeName`, `address`, `latitude`, `longitude`, `rating`, `suggestedDurationMinutes`, `aiReason`

## 9) Enums
**PlaceStatus**: `ACTIVE`, `TEMP_CLOSED`, `CLOSED`  
**PlaceSuggestionStatus**: `PENDING`, `APPROVED`, `REJECTED`  
**TourStatus**: `ONGOING`, `COMPLETED`, `CANCELLED`  
**PostType**: `EXPERIENCE`, `ITINERARY`, `GROUP_INVITE`, `TOUR`, `TOUR_SHARE`  
**Visibility**: `PUBLIC`, `FRIENDS`, `PRIVATE`  
**ChannelPrivacy**: `PUBLIC`, `PRIVATE`  
**ChannelType**: `TEXT`, `VOICE`, `VIDEO`, `ANNOUNCEMENT`  
**ParticipantRole**: `ADMIN`, `MEMBER`  
**ConversationType**: `CHANNEL`, `PRIVATE`, `YOURSELF`  
**JoinRequestStatus**: `PENDING`, `ACCEPTED`, `REJECTED`  
**MessageType**: `TEXT`, `IMAGE`, `VIDEO`, `AUDIO`, `DOCUMENT`, `SHARED_POST`  
**FileType**: `IMAGE`, `VIDEO`, `AUDIO`, `DOCUMENT`
