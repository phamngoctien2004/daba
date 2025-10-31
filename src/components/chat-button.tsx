import { Link } from '@tanstack/react-router'
import { MessagesSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/auth-store'
import { useUnreadStore } from '@/stores/unread-store'
import { UserRole } from '@/types/auth'

export function ChatButton() {
  const { user } = useAuthStore()
  // Subscribe to unreadMap to trigger re-render on changes
  const unreadMap = useUnreadStore((state) => state.unreadMap)

  // Only show for LE_TAN role
  if (user?.role !== UserRole.LE_TAN) {
    return null
  }

  // Calculate total unread from the map
  let totalUnread = 0
  unreadMap.forEach((unread) => {
    totalUnread += unread.count
  })

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='relative h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors'
            asChild
          >
            <Link to='/chats'>
              <MessagesSquare className='h-[1.2rem] w-[1.2rem]' />
              {totalUnread > 0 && (
                <span className='absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full' />
              )}
              <span className='sr-only'>Tin nhắn</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tin nhắn</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
