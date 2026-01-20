# Real-time Chat Testing Guide

This guide provides comprehensive testing procedures for the real-time chat implementation fixes.

## Prerequisites

- Two devices/browsers/tabs logged in as different users
- Backend server running with WebSocket support
- Frontend app running on both devices

## Test 1: Real-time Message Delivery

### Objective
Verify that messages appear instantly on recipient's device without page refresh.

### Steps

1. **Setup**
   - Device A: Login as User A
   - Device B: Login as User B
   - Both: Navigate to the messages/chat screen

2. **Test Scenario 1: New Message**
   - Device A: Open chat with User B (or start new conversation)
   - Device A: Send message "Hello from A"
   - **Expected Result**: 
     - Device A: Message appears instantly with checkmark (optimistic UI)
     - Device B: Message appears instantly in conversation list and chat screen
     - Both: Message correctly aligned (A: right/blue, B: left/gray)

3. **Test Scenario 2: Multiple Messages**
   - Device A: Send 3 messages quickly
   - **Expected Result**: 
     - All messages appear on Device B in correct order
     - No duplicate messages
     - All messages have correct sender identification

4. **Test Scenario 3: Background App**
   - Device B: Move app to background
   - Device A: Send message "Test background"
   - Device B: Return to foreground
   - **Expected Result**: 
     - Device B: Message appears immediately when returning to app
     - Conversation list shows unread count

5. **Console Verification**
   - Check browser console for:
     ```
     [Global WS] Global subscriptions initialized
     [Global WS] Incoming message: {...}
     [Global WS] ACK received: {...}
     ```

### Success Criteria
- ✅ Messages appear within 500ms on recipient device
- ✅ No manual refresh needed
- ✅ Correct message alignment (sender right, recipient left)
- ✅ Sender name/avatar displayed correctly
- ✅ No duplicate messages

---

## Test 2: UI Message Alignment

### Objective
Verify that messages from current user appear on right (blue) and others on left (gray).

### Steps

1. **Setup**
   - Device A: Login as User A
   - Open chat with User B

2. **Send Messages**
   - Device A: Send message "I am User A"
   - Device B: Send message "I am User B"

3. **Verify Device A**
   - "I am User A" should be:
     - Aligned to RIGHT
     - BLUE bubble
     - NO sender name above (in DM)
   - "I am User B" should be:
     - Aligned to LEFT
     - GRAY bubble
     - Shows User B's name (in group chat)

4. **Verify Device B** (opposite alignment)
   - "I am User B" → RIGHT/BLUE
   - "I am User A" → LEFT/GRAY

### Success Criteria
- ✅ Current user messages: right-aligned, blue bubble
- ✅ Other user messages: left-aligned, gray bubble
- ✅ Sender identification matches actual sender
- ✅ No UI layout issues or overlaps

---

## Test 3: Presence System (Online/Offline)

### Objective
Verify that online status updates correctly in real-time.

### Steps

1. **Initial State**
   - Device A: Login as User A
   - Device B: User B NOT logged in
   - Device A: Check User B's online status → Should show OFFLINE

2. **User Goes Online**
   - Device B: Login as User B
   - **Expected Result**:
     - Device A: User B status changes to ONLINE (green badge)
     - Device B: Receives bulk presence update showing User A is online

3. **Heartbeat Verification**
   - Keep both devices idle for 35 seconds
   - Check console logs:
     ```
     [PresenceService] Heartbeat sent
     ```
   - **Expected Result**: 
     - Both users remain ONLINE
     - Heartbeat sent every 30 seconds

4. **User Goes Offline**
   - Device B: Close app/logout/disconnect WebSocket
   - Wait 5 seconds
   - **Expected Result**:
     - Device A: User B status changes to OFFLINE (gray badge)
     - Shows "Last seen" timestamp

5. **Heartbeat Timeout**
   - Device B: Login again
   - Device B: Kill network connection (airplane mode)
   - Wait 65 seconds (beyond 60s timeout)
   - **Expected Result**:
     - Device A: User B status changes to OFFLINE after ~60s
     - Backend marks user offline due to heartbeat timeout

### Console Verification

**Device A Console:**
```
[PresenceService] Initialized
[PresenceService] Subscribed to presence events
[PresenceService] Heartbeat started
[PresenceService] Heartbeat sent
[PresenceService] Received presence event: USER_ONLINE
```

**Backend Logs:**
```
User 123 connected via WebSocket
Heartbeat received from user 123
User 123 is now online
Broadcasted presence update for user 123 (online=true) to 5 friends
User 456 disconnected from WebSocket
User 456 is now offline
```

### Success Criteria
- ✅ Online badge appears when user connects
- ✅ Offline badge appears when user disconnects
- ✅ Heartbeat maintains online status
- ✅ Timeout after 60s without heartbeat
- ✅ Bulk presence update on connect
- ✅ No memory leaks (check with DevTools)

---

## Test 4: Optimistic UI

### Objective
Verify that sent messages appear immediately with proper status indicators.

### Steps

1. **Slow Network Simulation**
   - Device A: Open DevTools → Network tab
   - Set throttling to "Slow 3G"

2. **Send Message**
   - Device A: Type and send "Testing optimistic UI"
   - **Expected Result**:
     - Message appears IMMEDIATELY in chat (gray status)
     - Shows "sending" indicator
     - After ACK: Shows checkmark

3. **Network Failure**
   - Device A: Go offline
   - Send message "This will fail"
   - **Expected Result**:
     - Message appears with "sending" status
     - After timeout: Shows error/retry icon
     - Message NOT sent to recipient

4. **Recovery**
   - Device A: Go back online
   - Retry failed message
   - **Expected Result**:
     - Message successfully sent
     - Shows checkmark
     - Recipient receives message

### Success Criteria
- ✅ Messages appear instantly (optimistic)
- ✅ Status indicators accurate (sending → sent → delivered)
- ✅ Error handling for failed sends
- ✅ Retry mechanism works
- ✅ No duplicate messages after retry

---

## Test 5: Group Chat

### Objective
Verify sender identification in group chats with multiple users.

### Steps

1. **Setup**
   - Create group chat with Users A, B, C
   - All devices in the same group chat

2. **Send Messages**
   - Device A (User A): Send "Message from A"
   - Device B (User B): Send "Message from B"
   - Device C (User C): Send "Message from C"

3. **Verify Each Device**
   - Each device should show:
     - Own messages: RIGHT/BLUE, NO name label
     - Others' messages: LEFT/GRAY, WITH name label and avatar

### Success Criteria
- ✅ Correct alignment for each user
- ✅ Sender name displayed for others
- ✅ No sender name for own messages
- ✅ Avatar images displayed correctly

---

## Common Issues & Troubleshooting

### Issue: Messages not appearing in real-time

**Symptoms:**
- Messages only appear after page refresh
- Recipient doesn't receive messages

**Check:**
1. Console: Look for `[Global WS] Global subscriptions initialized`
2. Network tab: Verify WebSocket connection is established
3. Backend logs: Check if message is sent to `/user/queue/messages`
4. Check if `useGlobalWebSocketSubscriptions` is called in `WebSocketProvider`

**Fix:**
- Ensure WebSocket is connected before sending
- Verify `subscribeToAllUserQueues` is called
- Check authentication token is valid

### Issue: Wrong message alignment

**Symptoms:**
- User's own messages appear on left
- Other user's messages appear on right

**Check:**
1. Console: Log `currentUserId` and `msg.senderId`
2. Verify types match (both number or both string)
3. Check `mapMessageResponse` function

**Fix:**
- Ensure `currentUserId` is correctly retrieved from auth store
- Fix type comparison: `msg.senderId === Number(currentUserId)`

### Issue: Presence not updating

**Symptoms:**
- Users stuck as offline/online
- Status doesn't change on disconnect

**Check:**
1. Console: Look for `[PresenceService] Heartbeat sent`
2. Backend logs: Check for `User X connected via WebSocket`
3. Network tab: Verify heartbeat requests every 30s

**Fix:**
- Ensure `presenceService.initialize()` is called
- Check WebSocket event listeners are registered
- Verify backend `PresenceService` is a `@Component`

### Issue: Duplicate messages

**Symptoms:**
- Same message appears multiple times

**Check:**
1. Check if multiple subscriptions to same conversation
2. Verify deduplication logic in `useChatSubscription`

**Fix:**
- Unsubscribe from old subscriptions before creating new ones
- Use `clientMessageId` for deduplication

---

## Performance Testing

### Load Test

1. **Multiple Conversations**
   - Open 10+ conversations simultaneously
   - Send messages in multiple conversations
   - Verify no memory leaks

2. **Rapid Messages**
   - Send 50 messages rapidly
   - Verify all appear correctly
   - Check console for errors

3. **Long-Running Session**
   - Keep app open for 1 hour
   - Verify heartbeat continues
   - Check memory usage remains stable

---

## Success Metrics

After all tests pass, the system should achieve:

- **Latency**: < 500ms message delivery
- **Uptime**: 99.9% WebSocket connection stability
- **Accuracy**: 100% correct message alignment
- **Presence**: < 3s status update delay
- **Performance**: < 100MB memory usage
- **Error Rate**: < 0.1% message failures

---

## Testing Checklist

- [ ] Real-time message delivery (Test 1)
- [ ] UI message alignment (Test 2)
- [ ] Presence system online/offline (Test 3)
- [ ] Optimistic UI and error handling (Test 4)
- [ ] Group chat sender identification (Test 5)
- [ ] No console errors
- [ ] No memory leaks
- [ ] Stable WebSocket connection
- [ ] Correct heartbeat interval (30s)
- [ ] Timeout after 60s without heartbeat

---

## Next Steps

After successful testing:

1. Monitor production logs for errors
2. Set up alerts for WebSocket disconnections
3. Track message delivery latency
4. Implement analytics for presence accuracy
5. Add automated E2E tests using Playwright/Cypress

---

**Last Updated:** 2026-01-20
