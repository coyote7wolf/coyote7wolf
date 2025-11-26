import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

/**
 * Avatar component variants using class-variance-authority
 */
const avatarVariants = cva(
  [
    'relative inline-flex items-center justify-center overflow-hidden',
    'bg-neutral-100 font-medium text-neutral-600',
    'select-none shrink-0',
  ],
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
        '2xl': 'w-20 h-20 text-xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string
  /** Alt text for image */
  alt?: string
  /** Fallback text (usually initials) */
  fallback?: string
  /** Whether image failed to load */
  onImageError?: () => void
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size = 'md',
      shape = 'circle',
      src,
      alt,
      fallback,
      onImageError,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false)

    const handleImageError = () => {
      setImageError(true)
      onImageError?.()
    }

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, shape }), className)}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="uppercase">{fallback || alt?.charAt(0) || '?'}</span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export { avatarVariants }
