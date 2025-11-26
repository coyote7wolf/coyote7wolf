/**
 * Common types for UI components
 * Based on Design Token system for easy Design System migration
 */

// Size variants based on design tokens
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Color variants based on design token colors
export type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'

// Visual variants for different component states
export type VisualVariant = 'solid' | 'outline' | 'ghost' | 'subtle' | 'link'

// Common component states
export type ComponentState =
  | 'default'
  | 'hover'
  | 'active'
  | 'disabled'
  | 'loading'

// Border radius variants based on design tokens
export type RadiusVariant = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Shadow variants based on design tokens
export type ShadowVariant = 'none' | 'sm' | 'md' | 'lg' | 'xl'

// Animation variants based on design tokens
export type AnimationVariant = 'none' | 'fast' | 'normal' | 'slow'

// Common props that most UI components will share
export interface BaseComponentProps {
  /** Custom CSS classes */
  className?: string
  /** Component size variant */
  size?: SizeVariant
  /** Component color variant */
  variant?: ColorVariant
  /** Visual style variant */
  visualVariant?: VisualVariant
  /** Border radius variant */
  radius?: RadiusVariant
  /** Whether component is disabled */
  disabled?: boolean
  /** Whether component is in loading state */
  loading?: boolean
  /** Component data-testid for testing */
  'data-testid'?: string
}

// Polymorphic component props for components that can render as different elements
export type PolymorphicProps<T extends React.ElementType> = {
  as?: T
} & Omit<React.ComponentPropsWithoutRef<T>, 'as'>

// Forward ref type for polymorphic components
export type PolymorphicRef<T extends React.ElementType> =
  React.ComponentPropsWithRef<T>['ref']
