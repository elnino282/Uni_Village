export * from '@/lib/api/generated';

export type {
    AuthenticationRequest,
    AuthenticationResponse,
    RegisterRequest,
    ForgetPasswordRequest,
    VerifyRequest,
    ChangePasswordRequest,
} from '@/lib/api/generated';

export type {
    AreaRequest,
    AreaResponse,
    PlaceTypeRequest,
    PlaceTypeResponse,
    PlaceRequest,
    PlaceResponse,
    PlaceStatusRequest,
    PlaceStatus,
    PlaceSuggestionRequest,
    PlaceSuggestionResponse,
    PlaceSuggestionStatus,
    PlaceSuggestionReviewRequest,
    PersonalPinRequest,
    PersonalPinResponse,
    ProvinceResponse,
    DistrictResponse,
    WardResponse,
} from '@/lib/api/generated';

export type {
    TourRequest,
    TourResponse,
    TourStatus,
    TourShareRequest,
    TourStopRequest,
    TourStopResponse,
    TourStopReorderRequest,
    CheckInRequest,
    CheckInResponse,
} from '@/lib/api/generated';

export type {
    PostResponse,
    PostType,
    Visibility,
    CommentRequest,
    CommentResponse,
    SharePostRequest,
    SharePostResponse,
    SavedPostResponse,
    LikeResponse,
} from '@/lib/api/generated';

export type {
    ConversationResponse,
    ConversationPrivateRequest,
    MessageRequest,
    MessageResponse,
    FileMessageResponse,
    MessageType,
    MessageSearchResponse,
    MarkReadRequest,
    MediaAttachmentResponse,
    FileType,
    ReadReceiptResponse,
} from '@/lib/api/generated';

export type {
    ChannelResponse,
    ChannelMemberResponse,
    ChannelPrivacy,
    ChannelType,
    CreateChannelRequest,
    UpdateChannelRequest,
    AddChannelMemberRequest,
    ParticipantRole,
    JoinConversationResponse,
    JoinRequestStatus,
} from '@/lib/api/generated';

export type {
    ItinerarySuggestRequest,
    SuggestedItinerary,
    SuggestedStop,
} from '@/lib/api/generated';

export type {
    ApiResponseBase,
    ApiResponseVoid,
    ApiResponseString,
    ApiResponseAuthenticationResponse,
} from '@/lib/api/generated';

export type {
    PagePlaceResponse,
    PagePlaceSuggestionResponse,
    PagePersonalPinResponse,
    PageTourResponse,
    PageCheckInResponse,
    SlicePostResponse,
    SliceCommentResponse,
    SliceConversationResponse,
    SliceMessageResponse,
    SliceMessageSearchResponse,
    Pageable,
    Sort,
} from '@/lib/api/generated';
