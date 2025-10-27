import { get } from '@/lib/api-client'
import {
  type ApiResponse,
  type Conversation,
  type MessageHistoryResponse,
  type LoadMoreMessagesResponse,
} from '../types'

/**
 * Type guard for checking if value is a record
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard for Conversation
 */
function isConversation(value: unknown): value is Conversation {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.patientName === 'string' &&
    typeof value.responder === 'string' &&
    typeof value.newMessage === 'boolean'
  )
}

/**
 * Type guard for MessageHistoryResponse
 */
function isMessageHistoryResponse(
  value: unknown
): value is MessageHistoryResponse {
  if (!isRecord(value)) return false
  return (
    Array.isArray(value.messages) &&
    typeof value.lastReadId === 'number' &&
    typeof value.totalUnread === 'number' &&
    typeof value.totalMessage === 'number' &&
    typeof value.hasMoreOld === 'boolean'
  )
}

/**
 * Fetch all conversations for the current user
 * GET /api/conversations
 */
export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const response = await get<ApiResponse<Conversation[]>>('/conversations')
    console.log('🔵 [fetchConversations] Raw response:', response)

    const { data } = response

    // Handle direct array response
    if (Array.isArray(data)) {
      return data.filter(isConversation)
    }

    // Handle wrapped response {data: [...]}
    if (isRecord(data)) {
      const rawData = data.data
      if (Array.isArray(rawData)) {
        return rawData.filter(isConversation)
      }
    }

    console.warn('⚠️ [fetchConversations] Unexpected response structure:', data)
    return []
  } catch (error) {
    console.error('❌ [fetchConversations] Error:', error)
    throw error
  }
}

/**
 * Fetch message history for a conversation
 * GET /api/conversations/{id}/messages
 */
export async function fetchMessages(
  conversationId: string
): Promise<MessageHistoryResponse> {
  try {
    const response = await get<ApiResponse<MessageHistoryResponse>>(
      `/conversations/${conversationId}/messages`
    )
    console.log('🔵 [fetchMessages] Raw response:', response)

    const { data } = response

    // Handle direct response
    if (isMessageHistoryResponse(data)) {
      return data
    }

    // Handle wrapped response {data: {...}}
    if (isRecord(data) && isMessageHistoryResponse(data.data)) {
      return data.data
    }

    console.warn('⚠️ [fetchMessages] Unexpected response structure:', data)
    return {
      messages: [],
      lastReadId: 0,
      totalUnread: 0,
      totalMessage: 0,
      hasMoreOld: false,
    }
  } catch (error) {
    console.error('❌ [fetchMessages] Error:', error)
    throw error
  }
}

/**
 * Load more old messages
 * GET /api/conversations/{id}/messages/more?beforeId={messageId}
 */
export async function fetchMoreMessages(
  conversationId: string,
  beforeId: number
): Promise<LoadMoreMessagesResponse> {
  try {
    const response = await get<ApiResponse<LoadMoreMessagesResponse>>(
      `/conversations/${conversationId}/messages/more?beforeId=${beforeId}`
    )
    console.log('🔵 [fetchMoreMessages] Raw response:', response)

    const { data } = response

    // Handle direct response
    if (isMessageHistoryResponse(data)) {
      return data
    }

    // Handle wrapped response {data: {...}}
    if (isRecord(data) && isMessageHistoryResponse(data.data)) {
      return data.data
    }

    console.warn('⚠️ [fetchMoreMessages] Unexpected response structure:', data)
    return {
      messages: [],
      lastReadId: 0,
      totalUnread: 0,
      totalMessage: 0,
      hasMoreOld: false,
    }
  } catch (error) {
    console.error('❌ [fetchMoreMessages] Error:', error)
    throw error
  }
}
