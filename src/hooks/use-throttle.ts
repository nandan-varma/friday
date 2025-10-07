import { useCallback, useRef } from 'react'

/**
 * Custom hook for throttling function calls
 * @param callback The function to throttle
 * @param delay The throttle delay in milliseconds
 * @returns The throttled function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallTime = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      
      if (now - lastCallTime.current >= delay) {
        // Execute immediately if enough time has passed
        lastCallTime.current = now
        callback(...args)
      } else {
        // Clear any pending timeout and set a new one
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallTime.current = Date.now()
          callback(...args)
        }, delay - (now - lastCallTime.current))
      }
    },
    [callback, delay]
  ) as T
}

/**
 * Custom hook for debouncing function calls
 * @param callback The function to debounce
 * @param delay The debounce delay in milliseconds
 * @returns The debounced function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T
}
