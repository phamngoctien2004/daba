# Chat Load More Scroll Jump Fix

## Ngày: 2025-10-27

## Vấn đề

Khi bấm "Xem thêm" để load tin nhắn cũ:
1. ✅ Tin nhắn cũ được load
2. ✅ Scroll position được restore (giữ vị trí user đang xem)
3. ❌ **Nhưng ngay sau đó scroll nhảy xuống cuối**

### Root Cause

Race condition giữa 2 useEffect:

```typescript
// useEffect 1: Restore scroll position (trong onSuccess)
requestAnimationFrame(() => {           // RAF 1
  requestAnimationFrame(() => {         // RAF 2
    scrollContainer.scrollTop = ...     // Restore position
  })
})

// useEffect 2: Auto-scroll on new messages
useEffect(() => {
  if (hasInitialScrolled.current && !isLoadingMoreRef.current) {
    // Auto-scroll to bottom
  }
}, [messagesData?.messages.length])
```

**Timeline vấn đề**:
```
1. User clicks "Xem thêm"
2. isLoadingMoreRef.current = true
3. Load messages API call
4. onSuccess starts
5. onSettled executes → isLoadingMoreRef.current = false ❌
6. messages.length changes → triggers auto-scroll useEffect
7. RAF 1 → RAF 2 → restore scroll position (nhưng đã muộn)
8. Result: Scroll xuống cuối, rồi nhảy lên (giật)
```

## Giải pháp

### Delay reset `isLoadingMoreRef` đến SAU KHI scroll đã restore

```typescript
onSuccess: () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (scrollContainer) {
        // Restore scroll position
        scrollContainer.scrollTop = scrollTopBefore + heightDiff
        
        // ✅ Reset flag AFTER scroll restored
        requestAnimationFrame(() => {
          isLoadingMoreRef.current = false
        })
      }
    })
  })
}
```

**Timeline fixed**:
```
1. User clicks "Xem thêm"
2. isLoadingMoreRef.current = true
3. Load messages API call
4. onSuccess starts
5. messages.length changes → auto-scroll useEffect checks
6. isLoadingMoreRef.current still = true ✅ → SKIP auto-scroll
7. RAF 1 → RAF 2 → restore scroll position
8. RAF 3 → isLoadingMoreRef.current = false
9. Result: Scroll position giữ nguyên ✅
```

## Code Changes

### Before (Có bug)

```typescript
loadMoreMessages(
  { conversationId, beforeId },
  {
    onSuccess: () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollTopBefore + heightDiff
        })
      })
    },
    onSettled: () => {
      // ❌ Reset quá sớm - trước khi scroll restore
      isLoadingMoreRef.current = false
    }
  }
)
```

**Problem**: `onSettled` chạy ngay lập tức, trước khi RAF hoàn thành

### After (Fixed)

```typescript
loadMoreMessages(
  { conversationId, beforeId },
  {
    onSuccess: () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollTopBefore + heightDiff
          
          // ✅ Reset sau khi scroll đã restore
          requestAnimationFrame(() => {
            isLoadingMoreRef.current = false
          })
        })
      })
    },
    onError: () => {
      // Reset flag on error
      isLoadingMoreRef.current = false
    }
  }
)
```

**Benefits**: 
- Reset flag chỉ sau khi scroll position đã được restore
- Thêm 1 RAF nữa để chắc chắn

## Request Animation Frame (RAF) Cascade

### Triple RAF Sequence

```typescript
// RAF 1: Wait for DOM update
requestAnimationFrame(() => {
  
  // RAF 2: Wait for layout calculation
  requestAnimationFrame(() => {
    // Update scroll position
    scrollContainer.scrollTop = newPosition
    
    // RAF 3: Wait for scroll complete
    requestAnimationFrame(() => {
      // NOW safe to reset flag
      isLoadingMoreRef.current = false
    })
  })
})
```

### Why 3 RAF?

1. **RAF 1**: DOM updated với tin nhắn mới
2. **RAF 2**: Browser calculated new scroll height
3. **RAF 3**: Scroll position applied

Mỗi RAF đảm bảo operation trước đã hoàn thành.

## Auto-Scroll Logic

### useEffect Check

```typescript
useEffect(() => {
  if (
    hasInitialScrolled.current &&     // ✅ After initial load
    !isLoadingMoreRef.current &&      // ✅ NOT loading more
    messagesData?.messages.length > 0 // ✅ Has messages
  ) {
    // Auto-scroll to bottom
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    })
  }
}, [messagesData?.messages.length])
```

### When Auto-Scroll Triggers

| Scenario | `hasInitialScrolled` | `isLoadingMore` | Auto-Scroll? |
|----------|---------------------|-----------------|--------------|
| Initial load | `false` | `false` | ❌ No (separate logic) |
| New message arrives | `true` | `false` | ✅ Yes |
| Loading more messages | `true` | `true` | ❌ No (preserve position) |
| After load more | `true` | `false` | ✅ Yes (if new message) |

## Edge Cases Handled

### 1. Error during load more
```typescript
onError: () => {
  isLoadingMoreRef.current = false
}
```
Flag reset ngay lập tức, không block future operations.

### 2. Scroll container null
```typescript
if (!scrollContainer) return
```
Early return nếu ref chưa mount.

### 3. No messages to restore
```typescript
if (!messagesData?.messages.length) return
```
Skip nếu không có tin nhắn.

### 4. Rapid clicks
`isLoadingMoreRef` prevents multiple concurrent loads:
```typescript
if (isLoadingMoreRef.current) return // Already loading
```

## Testing Scenarios

### ✅ Test 1: Basic load more
1. Open conversation với nhiều tin nhắn
2. Scroll to top
3. Click "Xem thêm"
4. ✅ Tin nhắn cũ load
5. ✅ Scroll giữ vị trí (không nhảy xuống cuối)

### ✅ Test 2: Load more + new message arrives
1. Load more tin nhắn cũ
2. Đang load → bệnh nhân gửi tin nhắn mới
3. ✅ Scroll vẫn giữ vị trí cũ (không bị new message kéo xuống)
4. Sau khi load xong → nếu có tin nhắn mới tiếp → mới scroll xuống

### ✅ Test 3: Multiple load more
1. Click "Xem thêm" lần 1
2. Đợi load xong
3. Click "Xem thêm" lần 2
4. ✅ Mỗi lần scroll position đều giữ đúng

### ✅ Test 4: Load more error
1. Disconnect network
2. Click "Xem thêm"
3. ✅ Error toast hiển thị
4. ✅ isLoadingMore reset
5. ✅ Có thể retry

### ✅ Test 5: Send message during load more
1. Click "Xem thêm"
2. Đang load → user gửi tin nhắn
3. ✅ Tin nhắn cũ load
4. ✅ Tin nhắn mới xuất hiện
5. ✅ Scroll giữ vị trí (không nhảy)

## Performance Impact

### RAF Count
- Before: 2 RAF (restore scroll)
- After: 3 RAF (restore scroll + reset flag)
- Impact: +1 frame (~16ms @ 60fps)
- User perception: None (imperceptible)

### Memory
- No additional memory allocation
- Same ref usage
- No memory leak

### CPU
- Minimal - just flag assignment
- No complex calculations
- Negligible impact

## Comparison with Alternatives

### ❌ Alternative 1: setTimeout
```typescript
setTimeout(() => {
  isLoadingMoreRef.current = false
}, 100)
```
**Problems**:
- Arbitrary delay
- Not synced with browser
- May be too early or too late

### ❌ Alternative 2: Disable auto-scroll temporarily
```typescript
const skipNextAutoScroll = useRef(false)

// In load more
skipNextAutoScroll.current = true

// In auto-scroll useEffect
if (skipNextAutoScroll.current) {
  skipNextAutoScroll.current = false
  return
}
```
**Problems**:
- Extra flag management
- More complex
- Edge cases with multiple triggers

### ✅ Current Solution: Triple RAF
- Synced with browser paint cycle
- Predictable timing
- Simple logic
- No arbitrary delays

## Visual Timeline

```
User clicks "Xem thêm"
     ↓
isLoadingMore = true
     ↓
API fetch old messages
     ↓
onSuccess callback
     ↓
RAF 1: DOM updated
     ↓
RAF 2: Layout calculated
     ↓
Scroll position restored
     ↓
RAF 3: Scroll applied
     ↓
isLoadingMore = false
     ↓
Auto-scroll check: isLoadingMore = false ✅
But no new message → Skip auto-scroll
     ↓
Done! Scroll giữ nguyên vị trí
```

## Related Files

- `src/features/chats/chat-page.tsx` - handleLoadMore logic
- `src/features/chats/hooks/use-chat.ts` - useLoadMoreMessages hook

## Related Documentation

- `CHAT_LOAD_MORE_SCROLL_FIX.md` - Initial scroll preservation implementation
- `CHAT_AUTO_SCROLL_NEW_MESSAGES.md` - Auto-scroll on new messages
- `CHAT_SCROLL_DEEP_FIX.md` - Original scroll implementation

## Lessons Learned

### 1. onSettled timing
`onSettled` in React Query runs BEFORE promise handlers complete. Not suitable for scroll operations.

### 2. RAF chaining
Multiple RAF needed for complex scroll operations:
- 1 RAF: DOM update
- 2 RAF: Layout calculation
- 3 RAF: Scroll application

### 3. Ref timing
Refs are synchronous but visual updates are async. Use RAF to sync.

### 4. Race conditions
Multiple useEffect + async operations = potential races. Use flags carefully.

---

**Status**: ✅ Completed & Tested
**Date**: 2025-10-27
**Version**: 1.2
**Bug**: Load more scroll jump
**Fix**: Triple RAF + delayed flag reset
