import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  text?: string;
  bg?: string; // tailwind token, e.g. 'avatar-bg', 'primary', 'bg-primary'
  textColor?: string; // tailwind token, e.g. 'avatar-text', 'text-primary'
  borderColor?: string; // tailwind token, e.g. 'avatar-border', 'border-primary'
  shadow?: string; // tailwind token, e.g. 'shadow-lg'
  rounded?: string; // tailwind token, e.g. 'rounded-full', 'rounded-md'
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  {
    src,
    alt,
    size = 'md',
    shape = 'circle',
    status,
    text,
    children,
    className = '',
    bg,
    textColor,
    borderColor,
    shadow,
    rounded,
    ...props
  },
  ref,
) {
  // Combine token classes
  const classes = [
    'avatar',
    `avatar-${size}`,
    `avatar-${shape}`,
    status ? `avatar-${status}` : '',
    bg ? (bg.startsWith('bg-') ? bg : `bg-${bg}`) : 'bg-primary',
    textColor ? (textColor.startsWith('text-') ? textColor : `text-${textColor}`) : 'text-white',
    borderColor
      ? borderColor.startsWith('border-')
        ? borderColor
        : `border-${borderColor}`
      : 'border-white',
    shadow || '',
    rounded || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      {src ? (
        <img src={src} alt={alt} className="avatar-img" />
      ) : text ? (
        <span className="avatar-text" aria-label={alt}>
          {text}
        </span>
      ) : (
        <span className="avatar-placeholder" aria-label={alt}>
          {children}
        </span>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';
