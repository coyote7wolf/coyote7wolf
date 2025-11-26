/**
 * UI Components Index
 *
 * This file exports all UI components for easy importing throughout the application.
 * All components are built with Design Token integration for easy Design System migration.
 */

// Core UI Components
export { Button, buttonVariants } from './Button'
export type { ButtonProps } from './Button'

export { Input, inputVariants } from './Input'
export type { InputProps } from './Input'

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  cardVariants,
  cardHeaderVariants,
  cardFooterVariants,
} from './Card'
export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from './Card'

export { Label, labelVariants } from './Label'
export type { LabelProps } from './Label'

export { Badge, badgeVariants } from './Badge'
export type { BadgeProps } from './Badge'

export { Spinner, spinnerVariants } from './Spinner'
export type { SpinnerProps } from './Spinner'

// Extended UI Components
export { Avatar, avatarVariants } from './Avatar'
export type { AvatarProps } from './Avatar'

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsVariants,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
} from './Tabs'
export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from './Tabs'

export { Separator, separatorVariants } from './Separator'
export type { SeparatorProps } from './Separator'

export { Switch, switchVariants, switchThumbVariants } from './Switch'
export type { SwitchProps } from './Switch'

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  selectTriggerVariants,
  selectContentVariants,
  selectItemVariants,
  selectLabelVariants,
  selectSeparatorVariants,
} from './Select'
export type {
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectContentProps,
  SelectItemProps,
  SelectLabelProps,
  SelectSeparatorProps,
} from './Select'

// Layout Components
export { Container, Stack, Grid } from '../layout'
export type { ContainerProps, StackProps, GridProps } from '../layout'

// Re-export utilities and types for convenience
export { cn } from '../utils'
export type * from '../types'
