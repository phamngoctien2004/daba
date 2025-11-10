import { type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src='/images/logo_only.png'
      alt='Logo'
      className={cn('size-6', className)}
      {...props}
    />
  )
}
