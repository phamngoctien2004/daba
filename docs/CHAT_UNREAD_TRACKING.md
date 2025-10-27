# Chat Unread Messages Tracking (Client-Side)

## Ngày: 2025-10-27

## Tổng quan

Implement client-side tracking để hiển thị badge "tin nhắn mới" khi có tin nhắn từ conversation khác. Đơn giản nhất, không cần backend API.

## Yêu cầu

✅ Đang ở phòng chat B → Phòng A có tin nhắn mới → Hiển thị badge số lượng tin nhắn chưa đọc
✅ Click vào conversation → Clear badge
✅ Realtime tracking qua WebSocket
✅ Client-side only (không cần API backend)

## Kiến trúc

### 1. Zustand Store (`unread-store.ts`)

```typescript
interface UnreadMessage {
  conversationId: string
  count: number
  lastMessageTime: string
}

interface UnreadStore {
  unreadMap: Map<string, UnreadMessage>
  addUnreadMessage: (conversationId, messageTime) => void
  clearUnread: (conversationId) => void
  getUnreadCount: (conversationId) => number
  getTotalUnread: () => number
}
```

**Features**:
- `Map<string, UnreadMessage>` - O(1) lookup
- Track count per conversation
- Track last message time
- Methods để add, clear, get count

### 2. WebSocket Subscription Hook

```typescript
useAllConversationsSubscription(
  conversations,           // All conversations
  currentConversationId,  // Currently viewing
  onNewMessage            // Callback when new message
)
```

**Logic**:
- Subscribe to ALL conversations at once
- Khi nhận message → Check if conversation is current
- If NOT current → Call `onNewMessage` callback
- If IS current → Skip (user already viewing)

### 3. Integration trong Chat Page

```typescript
// Track unread
useAllConversationsSubscription(
  conversations,
  selectedConversation?.id || null,
  (conversationId, message) => {
    addUnreadMessage(conversationId, message.sentTime)
  }
)

// Clear unread when switching conversation
useEffect(() => {
  if (selectedConversation?.id) {
    clearUnread(selectedConversation.id)
  }
}, [selectedConversation?.id])
```

## Implementation Details

### Store: `src/stores/unread-store.ts`

```typescript
export const useUnreadStore = create<UnreadStore>((set, get) => ({
  unreadMap: new Map(),

  addUnreadMessage: (conversationId, messageTime) => {
    set((state) => {
      const newMap = new Map(state.unreadMap)
      const existing = newMap.get(conversationId)

      if (existing) {
        // Increment count
        newMap.set(conversationId, {
          conversationId,
          count: existing.count + 1,
          lastMessageTime: messageTime,
        })
      } else {
        // First unread
        newMap.set(conversationId, {
          conversationId,
          count: 1,
          lastMessageTime: messageTime,
        })
      }

      return { unreadMap: newMap }
    })
  },

  clearUnread: (conversationId) => {
    set((state) => {
      const newMap = new Map(state.unreadMap)
      newMap.delete(conversationId)
      return { unreadMap: newMap }
    })
  },

  getUnreadCount: (conversationId) => {
    return get().unreadMap.get(conversationId)?.count || 0
  },

  getTotalUnread: () => {
    let total = 0
    get().unreadMap.forEach((unread) => {
      total += unread.count
    })
    return total
  },
}))
```

### Hook: `useAllConversationsSubscription`

```typescript
export function useAllConversationsSubscription(
  conversations: Conversation[] | undefined,
  currentConversationId: string | null,
  onNewMessage: (conversationId: string, message: Message) => void
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!conversations || conversations.length === 0) return

    const unsubscribers: (() => void)[] = []

    const setupAllSubscriptions = async () => {
      if (!wsClient.isConnected()) {
        await wsClient.connect()
      }

      // Subscribe to EACH conversation
      conversations.forEach((conv) => {
        const unsubscribe = wsClient.subscribeToChatConversation(
          conv.id,
          (message: Message) => {
            // Only track if NOT currently viewing
            if (conv.id !== currentConversationId) {
              console.log(`📩 New message from ${conv.id}`)
              onNewMessage(conv.id, message)
            }

            // Update conversation list
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
          }
        )
        unsubscribers.push(unsubscribe)
      })

      console.log(`✅ Subscribed to ${conversations.length} conversations`)
    }

    setupAllSubscriptions()

    return () => {
      unsubscribers.forEach((unsub) => unsub())
      console.log('🔌 Unsubscribed from all conversations')
    }
  }, [conversations, currentConversationId, onNewMessage, queryClient])
}
```

### UI: Badge trong Conversation List

```tsx
{getUnreadCount(conversation.id) > 0 && (
  <span className='bg-primary text-primary-foreground text-xs font-semibold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5'>
    {getUnreadCount(conversation.id)}
  </span>
)}
```

**Styling**:
- `min-w-[20px]` - Minimum width for single digit
- `h-5` - Height 20px
- `rounded-full` - Circle/pill shape
- `px-1.5` - Padding for double/triple digits
- `bg-primary` - Brand color
- `text-xs font-semibold` - Small, bold text

## Data Flow

### Scenario 1: User đang ở Conversation A, Conversation B có tin nhắn mới

```
1. User viewing Conversation A
   └─ currentConversationId = A

2. WebSocket receives message for Conversation B
   └─ wsClient.subscribeToChatConversation(B, callback)

3. Callback checks:
   └─ if (B !== A) ✅ TRUE

4. Call onNewMessage(B, message)
   └─ addUnreadMessage(B, message.sentTime)

5. Store updates:
   └─ unreadMap.set(B, { count: 1, ... })

6. UI re-renders:
   └─ Badge appears on Conversation B: "1"

7. User clicks Conversation B:
   └─ setSelectedConversation(B)
   └─ useEffect triggers
   └─ clearUnread(B)
   └─ unreadMap.delete(B)
   └─ Badge disappears
```

### Scenario 2: Multiple messages từ cùng conversation

```
1. Message 1 arrives from B
   └─ addUnreadMessage(B) → count = 1

2. Message 2 arrives from B
   └─ addUnreadMessage(B) → count = 2

3. Message 3 arrives from B
   └─ addUnreadMessage(B) → count = 3

4. Badge shows: "3"
```

### Scenario 3: User switch conversation

```
1. User viewing A, B has 3 unread
2. User clicks B
   └─ setSelectedConversation(B)
3. useEffect triggers:
   └─ clearUnread(B)
4. Badge disappears
5. New messages in B while viewing:
   └─ if (B === currentConversationId) → Skip tracking
   └─ No badge appears (user is viewing)
```

## Lifecycle

### Mount (User opens chat)
```
1. conversations load
2. useAllConversationsSubscription triggers
3. Subscribe to all conversations
4. Ready to receive messages
```

### Receive Message (Not current conversation)
```
1. WebSocket receives message
2. Check: conversationId !== currentConversationId
3. Call onNewMessage callback
4. Store: addUnreadMessage
5. UI: Badge appears/increments
```

### Switch Conversation
```
1. User clicks conversation
2. setSelectedConversation
3. useEffect (clearUnread) triggers
4. Store: delete unread entry
5. UI: Badge disappears
```

### Unmount (User leaves chat page)
```
1. useAllConversationsSubscription cleanup
2. Unsubscribe from all conversations
3. Store persists (Zustand state remains)
```

## Persistence

### Zustand Store
- ✅ In-memory state (fast)
- ❌ Lost on page reload
- ❌ Not synced across tabs

### Future: LocalStorage Persistence
```typescript
export const useUnreadStore = create<UnreadStore>()(
  persist(
    (set, get) => ({
      // ... store logic
    }),
    {
      name: 'chat-unread-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

## Performance

### WebSocket Subscriptions
- Subscribe to ALL conversations at once
- Each conversation: 1 WebSocket subscription
- 10 conversations = 10 subscriptions
- Lightweight - only receives messages, no polling

### Store Updates
- Map operations: O(1)
- No array iterations
- Minimal re-renders (only affected conversations)

### UI Rendering
- Conditional rendering: `{count > 0 && <Badge />}`
- Only renders badges when needed
- No performance impact

## Advantages (Client-Side)

### ✅ Pros
1. **Simple**: No backend API needed
2. **Fast**: O(1) lookup with Map
3. **Realtime**: WebSocket instant updates
4. **Flexible**: Easy to modify logic
5. **No Server Load**: All tracking on client

### ❌ Cons
1. **Not Persistent**: Lost on page reload
2. **Not Synced**: Different tabs have different counts
3. **Initial State**: No unread count on first load
4. **Trust Client**: Can be manipulated (not critical for UX feature)

## Comparison with Alternatives

### ❌ Alternative 1: Backend Tracking
```
Pros: Persistent, multi-device sync
Cons: Need API, database, more complex
```

### ❌ Alternative 2: LocalStorage Only
```
Pros: Persist on reload
Cons: Not realtime, manual sync needed
```

### ✅ Current: Zustand + WebSocket
```
Pros: Simple, realtime, fast
Cons: Not persistent (acceptable trade-off)
```

## Testing Scenarios

### ✅ Test 1: Basic unread tracking
1. Open chat page (Conversation A selected)
2. Send message to Conversation B via another device
3. ✅ Badge "1" appears on Conversation B

### ✅ Test 2: Multiple unread messages
1. Viewing Conversation A
2. Send 3 messages to Conversation B
3. ✅ Badge shows "3"

### ✅ Test 3: Clear on view
1. Conversation B has badge "3"
2. Click Conversation B
3. ✅ Badge disappears immediately

### ✅ Test 4: Current conversation no badge
1. Viewing Conversation A
2. Receive new message in Conversation A
3. ✅ No badge (user already viewing)
4. ✅ Message appears in chat

### ✅ Test 5: Multiple conversations
1. Viewing A
2. B receives 2 messages → Badge "2"
3. C receives 1 message → Badge "1"
4. D receives 3 messages → Badge "3"
5. ✅ All badges independent

### ✅ Test 6: Switch between conversations
1. A has badge "2"
2. Click A → Badge clears
3. Switch to B → B has badge "1"
4. Click B → Badge clears
5. ✅ Each conversation badge clears on view

## Future Enhancements

### 1. LocalStorage Persistence
```typescript
persist(
  (set, get) => ({ ...store }),
  { name: 'chat-unread' }
)
```

### 2. Total Unread Badge (Chat Button)
```tsx
<ChatButton />
  {getTotalUnread() > 0 && (
    <Badge>{getTotalUnread()}</Badge>
  )}
```

### 3. Sound Notification
```typescript
onNewMessage: (conversationId, message) => {
  addUnreadMessage(conversationId, message.sentTime)
  playNotificationSound()
}
```

### 4. Desktop Notification
```typescript
if (Notification.permission === 'granted') {
  new Notification('Tin nhắn mới', {
    body: message.message,
  })
}
```

### 5. Unread Indicator on Sidebar
```tsx
<SidebarItem icon={<MessageSquare />}>
  Chat
  {getTotalUnread() > 0 && (
    <Badge variant="destructive">{getTotalUnread()}</Badge>
  )}
</SidebarItem>
```

## Related Files

- `src/stores/unread-store.ts` - Zustand store
- `src/features/chats/hooks/use-chat.ts` - useAllConversationsSubscription hook
- `src/features/chats/chat-page.tsx` - Integration & UI

## Related Documentation

- `CHAT_WEBSOCKET_AND_LAYOUT_FIX.md` - WebSocket implementation
- `CHAT_IMAGE_UPLOAD.md` - Image upload feature

---

**Status**: ✅ Completed & Tested
**Date**: 2025-10-27
**Version**: 1.0
**Approach**: Client-Side Tracking (Simple & Fast)
**Trade-off**: Not persistent across reloads (acceptable for MVP)
