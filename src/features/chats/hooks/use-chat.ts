import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  fetchConversations,
  fetchMessages,
  fetchMoreMessages,
} from '../api/chat'
import { uploadChatImages } from '../api/upload'
import { wsClient } from '@/lib/websocket-client'
import type { Message } from '../types'
import type { Conversation } from '../types'

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 30000,
    retry: 2,
  })
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 10000,
    retry: 2,
  })
}

export function useLoadMoreMessages() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      conversationId,
      beforeId,
    }: {
      conversationId: string
      beforeId: number
    }) => fetchMoreMessages(conversationId, beforeId),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ['messages', variables.conversationId],
        (oldData: any) => {
          if (!oldData) return data
          return {
            ...data,
            messages: [...data.messages, ...oldData.messages],
          }
        }
      )
    },
    onError: (error) => {
      console.error('Failed to load more messages:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thêm tin nhắn',
        variant: 'destructive',
      })
    },
  })
}

export function useUploadChatImages() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: uploadChatImages,
    onError: (error) => {
      console.error('Upload error:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải ảnh lên',
        variant: 'destructive',
      })
    },
  })
}

export function useSendMessage() {
  const { toast } = useToast()

  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      conversationId,
      senderId,
      message,
      urls,
      token,
    }: {
      conversationId: number
      senderId: number
      message: string
      urls: string[]
      token: string
    }) => {
      if (!wsClient.isConnected()) {
        await wsClient.connect()
      }
      const sentTime = new Date().toISOString()
      wsClient.sendChatMessage({
        conversationId,
        senderId,
        message,
        sentTime,
        urls,
      }, token)
      return { conversationId, senderId, message, sentTime, urls }
    },
    onSuccess: (data) => {
      // Optimistic update: tự thêm tin nhắn vào danh sách
      queryClient.setQueryData(['messages', String(data.conversationId)], (oldData: any) => {
        const newMsg = {
          id: Date.now(), // Tạm thời, backend sẽ trả id thật qua WebSocket
          conversationId: data.conversationId,
          senderId: data.senderId,
          message: data.message,
          sentTime: data.sentTime,
          urls: data.urls,
        }
        if (!oldData) {
          return { messages: [newMsg], hasMoreOld: false }
        }
        return {
          ...oldData,
          messages: [...oldData.messages, newMsg],
        }
      })
      console.log('Message sent successfully:', data)
    },
    onError: (error) => {
      console.error('Failed to send message:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi tin nhắn',
        variant: 'destructive',
      })
    },
  })
}

export function useChatSubscription(
  conversationId: string | null,
  enabled: boolean,
  onMessageReceived?: (message: Message) => void
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !conversationId) {
      return
    }

    let unsubscribe: (() => void) | null = null

    const setupSubscription = async () => {
      try {
        if (!wsClient.isConnected()) {
          await wsClient.connect()
        }

        unsubscribe = wsClient.subscribeToChatConversation(conversationId, (message: Message) => {
          console.log('Received message via WebSocket:', message)

          // Call callback if provided (for unread tracking)
          if (onMessageReceived) {
            onMessageReceived(message)
          }

          queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
            if (!oldData) {
              return { messages: [message], hasMoreOld: false }
            }
            const exists = oldData.messages.some((msg: any) => msg.id === message.id)
            if (exists) {
              return oldData
            }
            return {
              ...oldData,
              messages: [...oldData.messages, message],
            }
          })
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
        })

        console.log('Chat subscription established for conversation:', conversationId)
      } catch (error) {
        console.error('Failed to subscribe to chat:', error)
      }
    }

    setupSubscription()

    return () => {
      if (unsubscribe) {
        unsubscribe()
        console.log('Chat subscription closed for conversation:', conversationId)
      }
    }
  }, [conversationId, enabled, queryClient, onMessageReceived])
}

/**
 * Hook to subscribe to ALL conversations for unread tracking
 * Subscribe to all conversations at once when user is logged in
 */
export function useAllConversationsSubscription(
  conversations: Conversation[] | undefined,
  currentConversationId: string | null,
  onNewMessage: (conversationId: string, message: Message) => void
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!conversations || conversations.length === 0) {
      return
    }

    const unsubscribers: (() => void)[] = []

    const setupAllSubscriptions = async () => {
      try {
        if (!wsClient.isConnected()) {
          await wsClient.connect()
        }

        // Subscribe to each conversation
        conversations.forEach((conv) => {
          const unsubscribe = wsClient.subscribeToChatConversation(
            conv.id,
            (message: Message) => {
              // Only track as unread if NOT currently viewing this conversation
              if (conv.id !== currentConversationId) {
                console.log(`📩 New message from conversation ${conv.id} (not current)`)
                onNewMessage(conv.id, message)
              }

              // Update conversations list (for last message preview)
              queryClient.invalidateQueries({ queryKey: ['conversations'] })
            }
          )
          unsubscribers.push(unsubscribe)
        })

        console.log(`✅ Subscribed to ${conversations.length} conversations for unread tracking`)
      } catch (error) {
        console.error('❌ Failed to subscribe to all conversations:', error)
      }
    }

    setupAllSubscriptions()

    return () => {
      // Cleanup all subscriptions
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      console.log('🔌 Unsubscribed from all conversations')
    }
  }, [conversations, currentConversationId, onNewMessage, queryClient])
}
