import { Client, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { Message } from '@/features/chats/types'

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws'

export interface PaymentSuccessEvent {
    event: 'PAYMENT_SUCCESS'
    message: string
    invoiceId: number
}

export type PaymentEventCallback = (event: PaymentSuccessEvent) => void
export type ChatMessageCallback = (message: Message) => void

class WebSocketClient {
    private client: Client | null = null
    private isConnecting = false
    private subscriptions: Map<string, any> = new Map()

    /**
     * Connect to WebSocket server
     */
    connect(): Promise<void> {
        if (this.client?.connected) {
            console.log('🔵 [WebSocket] Already connected')
            return Promise.resolve()
        }

        if (this.isConnecting) {
            console.log('🔵 [WebSocket] Connection in progress...')
            return Promise.resolve()
        }

        this.isConnecting = true

        return new Promise((resolve, reject) => {
            try {
                this.client = new Client({
                    webSocketFactory: () => new SockJS(WS_BASE_URL) as any,
                    debug: (str) => {
                        if (import.meta.env.DEV) {
                            console.log('🔵 [WebSocket Debug]', str)
                        }
                    },
                    reconnectDelay: 5000,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    onConnect: () => {
                        console.log('✅ [WebSocket] Connected successfully')
                        this.isConnecting = false
                        resolve()
                    },
                    onStompError: (frame) => {
                        console.error('❌ [WebSocket] STOMP error:', frame.headers['message'])
                        console.error('❌ [WebSocket] Details:', frame.body)
                        this.isConnecting = false
                        reject(new Error(frame.headers['message'] || 'WebSocket connection error'))
                    },
                    onWebSocketClose: () => {
                        console.log('⚠️ [WebSocket] Connection closed')
                        this.isConnecting = false
                    },
                    onWebSocketError: (error) => {
                        console.error('❌ [WebSocket] Error:', error)
                        this.isConnecting = false
                        reject(error)
                    },
                })

                this.client.activate()
            } catch (error) {
                console.error('❌ [WebSocket] Failed to create client:', error)
                this.isConnecting = false
                reject(error)
            }
        })
    }

    /**
     * Subscribe to payment events for a specific invoice
     */
    subscribeToInvoicePayment(
        invoiceId: number,
        callback: PaymentEventCallback
    ): () => void {
        const topic = `/topic/invoice.${invoiceId}`

        if (!this.client?.connected) {
            console.warn('⚠️ [WebSocket] Not connected. Call connect() first.')
            return () => { }
        }

        // Unsubscribe if already subscribed
        if (this.subscriptions.has(topic)) {
            console.log(`🔵 [WebSocket] Already subscribed to ${topic}`)
            return this.subscriptions.get(topic).unsubscribe
        }

        console.log(`🔵 [WebSocket] Subscribing to ${topic}`)

        const subscription = this.client.subscribe(topic, (message: IMessage) => {
            try {
                const event = JSON.parse(message.body) as PaymentSuccessEvent
                console.log(`✅ [WebSocket] Received event from ${topic}:`, event)

                if (event.event === 'PAYMENT_SUCCESS') {
                    callback(event)
                }
            } catch (error) {
                console.error('❌ [WebSocket] Failed to parse message:', error)
            }
        })

        // Store subscription
        this.subscriptions.set(topic, subscription)

        // Return unsubscribe function
        return () => {
            console.log(`🔵 [WebSocket] Unsubscribing from ${topic}`)
            subscription.unsubscribe()
            this.subscriptions.delete(topic)
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.client?.connected) {
            console.log('🔵 [WebSocket] Disconnecting...')

            // Unsubscribe all
            this.subscriptions.forEach((subscription) => {
                subscription.unsubscribe()
            })
            this.subscriptions.clear()

            this.client.deactivate()
            this.client = null
        }
    }

    /**
     * Subscribe to chat messages for a specific conversation
     * Topic: /topic/chat/{conversationId}
     */
    subscribeToChatConversation(
        conversationId: string,
        callback: ChatMessageCallback
    ): () => void {
        const topic = `/topic/chat/${conversationId}`

        if (!this.client?.connected) {
            console.warn('⚠️ [WebSocket] Not connected. Call connect() first.')
            return () => { }
        }

        // Unsubscribe if already subscribed
        if (this.subscriptions.has(topic)) {
            console.log(`🔵 [WebSocket] Already subscribed to ${topic}`)
            return this.subscriptions.get(topic).unsubscribe
        }

        console.log(`🔵 [WebSocket] Subscribing to ${topic}`)

        const subscription = this.client.subscribe(topic, (message: IMessage) => {
            try {
                const chatMessage = JSON.parse(message.body) as Message
                console.log(`✅ [WebSocket] Received message from ${topic}:`, chatMessage)
                callback(chatMessage)
            } catch (error) {
                console.error('❌ [WebSocket] Failed to parse chat message:', error)
            }
        })

        // Store subscription
        this.subscriptions.set(topic, subscription)

        // Return unsubscribe function
        return () => {
            console.log(`🔵 [WebSocket] Unsubscribing from ${topic}`)
            subscription.unsubscribe()
            this.subscriptions.delete(topic)
        }
    }

    /**
     * Send a chat message via WebSocket
     * Destination: /app/chat.send
     */
    sendChatMessage(messageDTO: {
        conversationId: number
        senderId: number
        message: string
        sentTime: string
        urls: string[]
    }, token: string): void {
        if (!this.client?.connected) {
            console.warn('⚠️ [WebSocket] Not connected. Cannot send message.')
            throw new Error('WebSocket not connected')
        }

        console.log('🔵 [WebSocket] Sending chat message with token:', messageDTO)

        this.client.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(messageDTO),
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.client?.connected ?? false
    }
}

// Singleton instance
export const wsClient = new WebSocketClient()
