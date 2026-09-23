import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vscode-accent disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const variants = {
      default: 'bg-vscode-accent text-white hover:bg-vscode-accentHover shadow-sm',
      secondary: 'bg-vscode-card text-vscode-fg hover:bg-opacity-80 border border-vscode-border shadow-xs',
      outline: 'border border-vscode-border bg-transparent hover:bg-vscode-card text-vscode-fg',
      ghost: 'hover:bg-vscode-card hover:text-vscode-fg text-vscode-muted',
      destructive: 'bg-red-600 text-white hover:bg-red-700'
    };

    const sizes = {
      sm: 'h-7 px-2.5 text-xs gap-1.5',
      md: 'h-8 px-3 text-sm gap-2',
      lg: 'h-10 px-4 text-base gap-2.5',
      icon: 'h-7 w-7 p-0'
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
