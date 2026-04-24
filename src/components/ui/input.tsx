import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-md border border-white/10 bg-surface-container/60 px-3 py-2 text-sm placeholder:text-on-surface-variant/60',
          'focus:outline-none focus:border-transparent focus:ring-2 focus:ring-primary/60 focus:shadow-[0_0_0_4px_rgba(123,255,238,0.18)]',
          'disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
