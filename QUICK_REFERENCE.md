# Real-time Chat - Quick Reference Guide

## 🚀 What Was Fixed

| Issue | Status | Impact |
|-------|--------|--------|
| Messages not appearing in real-time | ✅ FIXED | HIGH |
| Wrong message alignment (sender/receiver) | ✅ FIXED | HIGH |
| Missing sender identification | ✅ FIXED | MEDIUM |
| No presence system (online/offline) | ✅ IMPLEMENTED | HIGH |
| Performance (query invalidations) | ✅ OPTIMIZED | MEDIUM |

---

## 📁 New Files Created

### Frontend (Uni_Village)
```
src/features/chat/hooks/useGlobalWebSocketSubscriptions.ts
TESTING_GUIDE.md
IMPLEMENTATION_SUMMARY.md
QUICK_REFERENCE.md
```

### Backend (vnuguideapp)
```
src/main/java/com/example/vnuguideapp/dto/event/ChatAndActivity/UserPresenceEvent.java
src/main/java/com/example/vnuguideapp/service/ChatAndActivity/PresenceService.java
src/main/java/com/example/vnuguideapp/ws/WebSocketEventListener.java
```

---

## 🔧 Key Changes

### 1. Global WebSocket Subscriptions

**Before:**
```typescript
// Only subscribed when viewing specific conversation
subscribeToConversation(conversationId, handler);
```

**After:**
```typescript
// Always subscribed to user queues
subscribeToAllUserQueues({
  onMessage: handleIncomingMessage,      // /user/queue/messages
  onAck: handleAckEvent,                 // /user/queue/ack
  onConversationEvent: handleEvent       // /user/queue/events
});
```

**Result:** Messages appear instantly even when not viewing the conversation.

---

### 2. Message Alignment Fix

**Before:**
```typescript
const isSentByMe = String(msg.senderId) === currentUserId; // ❌ Type mismatch
```

**After:**
```typescript
const isSentByMe = currentUserId ? msg.senderId === Number(currentUserId) : false; // ✅
```

**Result:** Messages correctly aligned (sender right, receiver left).

---

### 3. Presence System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │         │   Backend   │         │   Client    │
│  (User A)   │         │   Spring    │         │  (User B)   │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │                       │
       │  WS Connect           │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │  Bulk Presence        │                       │
       │<──────────────────────┤                       │
       │  (All friends status) │                       │
       │                       │                       │
       │                       │  USER_ONLINE          │
       │                       ├──────────────────────>│
       │                       │                       │
       │  Heartbeat (every 30s)│                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │  Disconnect           │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │                       │  USER_OFFLINE         │
       │                       ├──────────────────────>│
       │                       │                       │
```

**Components:**
- **Frontend:** `presenceService.ts` sends heartbeat every 30s
- **Backend:** `PresenceService.java` tracks users, times out after 60s
- **Event Listeners:** Auto-detect connect/disconnect

---

## 🔑 Key Methods

### Frontend

#### WebSocket Service
```typescript
// Subscribe to presence updates
websocketService.subscribeToPresence(handler);

// Send heartbeat
websocketService.sendPresenceHeartbeat();

// Subscribe to all user queues
websocketService.subscribeToAllUserQueues({ onMessage, onAck, onConversationEvent });
```

#### Presence Service
```typescript
// Initialize (called automatically)
presenceService.initialize();

// Subscribe to user's presence
presenceService.subscribeToUserPresence(userId, (isOnline) => {
  console.log(`User ${userId} is ${isOnline ? 'online' : 'offline'}`);
});

// Cleanup (called automatically)
presenceService.cleanup();
```

### Backend

#### Presence Service
```java
// Mark user online
presenceService.markUserOnline(userId);

// Mark user offline
presenceService.markUserOffline(userId);

// Update heartbeat
presenceService.updateHeartbeat(userId);

// Check if online
boolean isOnline = presenceService.isUserOnline(userId);

// Get friends' presence
Map<Long, Boolean> presence = presenceService.getFriendsPresence(userId);
```

#### WebSocket Controller
```java
// Handle heartbeat
@MessageMapping("/presence.heartbeat")
public void handleHeartbeat(Principal principal) {
    User user = extractUser(principal);
    presenceService.updateHeartbeat(user.getId());
}
```

---

## 🎯 WebSocket Destinations

### Client → Server

| Destination | Purpose | Payload |
|-------------|---------|---------|
| `/app/chat.send` | Send message | `ChatSendPayload` |
| `/app/presence.heartbeat` | Maintain online status | `{}` |
| `/app/typing/{conversationId}` | Typing indicator | `TypingEvent` |

### Server → Client

| Destination | Purpose | Event Type |
|-------------|---------|-----------|
| `/user/queue/messages` | Incoming messages | `ChatMessageEvent` |
| `/user/queue/ack` | Message acknowledgment | `AckEvent` |
| `/user/queue/events` | Conversation events | `ConversationUpgradedEvent` |
| `/user/queue/presence` | Presence updates | `UserPresenceEvent` |
| `/topic/message.{id}` | Broadcast to conversation | `MessageEvent` |

---

## 🐛 Debugging

### Enable Debug Logs

**Frontend Console:**
```javascript
// Add this to see all logs
console.log('[Global WS]');     // Global subscriptions
console.log('[PresenceService]'); // Presence events
```

**Backend application.yml:**
```yaml
logging:
  level:
    com.example.vnuguideapp.ws: DEBUG
    com.example.vnuguideapp.service.ChatAndActivity: DEBUG
```

### Check WebSocket Connection

**Browser DevTools:**
1. Open Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection to `/ws`
4. Check "Messages" sub-tab for traffic

**Expected Messages:**
```
← CONNECT (from server)
→ SUBSCRIBE /user/queue/messages
→ SUBSCRIBE /user/queue/ack
→ SUBSCRIBE /user/queue/presence
→ SEND /app/presence.heartbeat (every 30s)
```

### Verify Presence

**Frontend Console:**
```
[PresenceService] Initialized
[PresenceService] Subscribed to presence events
[PresenceService] Heartbeat started
[PresenceService] Heartbeat sent
[PresenceService] Received presence event: {...}
```

**Backend Logs:**
```
User 123 connected via WebSocket
Heartbeat received from user 123
User 123 is now online
Broadcasted presence update for user 123 (online=true) to 5 friends
```

---

## ⚡ Performance Tips

### 1. Debouncing
Query invalidations are debounced:
- Conversations: 500ms
- Messages: 300ms

**Don't worry about rapid events** - they're batched automatically.

### 2. Memory Management
```typescript
// Presence service auto-cleans up
useEffect(() => {
  presenceService.initialize();
  return () => presenceService.cleanup(); // Auto cleanup
}, [isConnected]);
```

### 3. Heartbeat Optimization
- Interval: 30 seconds (optimal for mobile)
- Timeout: 60 seconds (2x heartbeat)
- Only sends when connected

---

## 🧪 Quick Testing

### Test Message Delivery
```bash
# Terminal 1: User A
curl -X POST http://localhost:8080/api/messages \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"recipientId": 2, "content": "Test"}'

# Terminal 2: Check User B's console
# Should see: [Global WS] Incoming message: {...}
```

### Test Presence
```bash
# Login User A
# Check console: [PresenceService] Initialized

# Wait 35 seconds
# Check console: [PresenceService] Heartbeat sent (appears)

# Logout User A
# Check User B's console: USER_OFFLINE event received
```

---

## 📊 Monitoring

### Key Metrics to Track

1. **Message Latency**
   - Target: < 500ms
   - Measure: Time from send to receive

2. **WebSocket Uptime**
   - Target: > 99.9%
   - Track: Connection/disconnection events

3. **Heartbeat Success Rate**
   - Target: > 99%
   - Track: Successful heartbeats vs timeouts

4. **Presence Accuracy**
   - Target: < 3s lag
   - Track: Time from status change to UI update

---

## 🔐 Security Notes

### Production Checklist

- [ ] Update CORS to allow only production domains
- [ ] Enable WSS (WebSocket Secure) over HTTPS
- [ ] Validate authentication tokens on every WS message
- [ ] Rate limit heartbeat messages (prevent spam)
- [ ] Sanitize all message content
- [ ] Log suspicious activities (rapid connects/disconnects)

### WebSocket Security

```java
// Already implemented in WebSocketAuthInterceptor
@Override
public void preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
    
    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
        String token = extractToken(accessor);
        Authentication auth = validateToken(token);
        accessor.setUser(auth);
    }
}
```

---

## 📚 Additional Resources

- **Full Documentation:** `IMPLEMENTATION_SUMMARY.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Original Plan:** `.cursor/plans/fix_real-time_chat_issues_*.plan.md`

---

## ❓ FAQ

**Q: Why 30 seconds for heartbeat?**
A: Balance between real-time accuracy and battery/bandwidth usage. Can be adjusted.

**Q: What happens if heartbeat fails?**
A: User is marked offline after 60 seconds (2x heartbeat interval).

**Q: Can I disable presence for some users?**
A: Yes, modify `PresenceService.java` to check user preferences.

**Q: How to scale across multiple servers?**
A: Replace in-memory maps with Redis for distributed presence tracking.

**Q: Messages appearing twice?**
A: Check deduplication logic in `useChatSubscription.ts` - uses message ID.

---

**Last Updated:** 2026-01-20
**Version:** 1.0.0
