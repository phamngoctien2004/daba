import { create } from 'zustand'

interface ActiveConversationStore {
    activeConversationId: string | null
    setActiveConversation: (id: string | null) => void
    clearActiveConversation: () => void
}

export const useActiveConversationStore = create<ActiveConversationStore>((set) => ({
    activeConversationId: null,
    setActiveConversation: (id: string | null) => set(() => ({ activeConversationId: id })),
    clearActiveConversation: () => set(() => ({ activeConversationId: null })),
}))
