import { Link } from '@tanstack/react-router'
import { MessagesSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { UserRole } from '@/types/auth'

interface ChatButtonProps {
  showBadge?: boolean
  badgeCount?: number
}

export function ChatButton({ showBadge = false, badgeCount = 0 }: ChatButtonProps) {
  const { user } = useAuthStore()

  // Only show for LE_TAN role
  if (user?.role !== UserRole.LE_TAN) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='relative h-9 w-9'
            asChild
          >
            <Link to='/chats'>
              <MessagesSquare className='h-[1.2rem] w-[1.2rem]' />
              {showBadge && badgeCount > 0 && (
                <Badge
                  variant='destructive'
                  className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs'
                >
                  {badgeCount > 9 ? '9+' : badgeCount}
                </Badge>
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
