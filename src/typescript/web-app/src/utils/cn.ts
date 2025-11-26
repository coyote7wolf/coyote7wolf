/**
 * 類名合併工具
 *
 * 用於合併 Tailwind CSS 類名
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
