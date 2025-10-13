import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export interface TimePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onValueChange?: (value: string) => void
}

/**
 * TimePicker component
 * Supports HH:mm format (24-hour)
 */
const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, value, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      onValueChange?.(newValue)
      onChange?.(event)
    }

    return (
      <Input
        type="time"
        ref={ref}
        className={cn('w-full', className)}
        value={value || ''}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

TimePicker.displayName = 'TimePicker'

export { TimePicker }
