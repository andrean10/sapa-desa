import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...nilai: ClassValue[]) {
  return twMerge(clsx(nilai))
}
