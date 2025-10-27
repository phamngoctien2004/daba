import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UnreadMessage {
    conversationId: string
    count: number
    lastMessageTime: string
}

interface UnreadStore {
    unreadMap: Map<string, UnreadMessage>
    addUnreadMessage: (conversationId: string, messageTime: string) => void
    clearUnread: (conversationId: string) => void
    getUnreadCount: (conversationId: string) => number
    getTotalUnread: () => number
}

export const useUnreadStore = create<UnreadStore>()(
    persist(
        (set, get) => ({
            unreadMap: new Map(),

            addUnreadMessage: (conversationId: string, messageTime: string) => {
                set((state) => {
                    const newMap = new Map(state.unreadMap)
                    const existing = newMap.get(conversationId)

                    if (existing) {
                        newMap.set(conversationId, {
                            conversationId,
                            count: existing.count + 1,
                            lastMessageTime: messageTime,
                        })
                    } else {
                        newMap.set(conversationId, {
                            conversationId,
                            count: 1,
                            lastMessageTime: messageTime,
                        })
                    }

                    return { unreadMap: newMap }
                })
            },

            clearUnread: (conversationId: string) => {
                set((state) => {
                    const newMap = new Map(state.unreadMap)
                    newMap.delete(conversationId)
                    return { unreadMap: newMap }
                })
            },

            getUnreadCount: (conversationId: string) => {
                return get().unreadMap.get(conversationId)?.count || 0
            },

            getTotalUnread: () => {
                let total = 0
                get().unreadMap.forEach((unread) => {
                    total += unread.count
                })
                return total
            },
        }),
        {
            name: 'chat-unread-storage',
            partialize: (state) => ({
                // Map không thể lưu trực tiếp, cần chuyển thành array
                unreadMap: Array.from(state.unreadMap.entries()),
            }),
            merge: (persistedState: any, currentState) => {
                // Chuyển array về Map, nếu không có thì trả về Map rỗng
                const map = new Map<string, UnreadMessage>(
                    Array.isArray(persistedState?.unreadMap)
                        ? persistedState.unreadMap as [string, UnreadMessage][]
                        : []
                )
                return {
                    ...currentState,
                    unreadMap: map,
                }
            },
        }
    )
)
