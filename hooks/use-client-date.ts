"use client"

import { useState, useEffect } from "react"

/**
 * Hook to get the current date only on the client side to prevent hydration mismatches
 */
export function useClientDate() {
  const [clientDate, setClientDate] = useState<Date | null>(null)

  useEffect(() => {
    setClientDate(new Date())
  }, [])

  return clientDate
}

/**
 * Hook to check if we're on the client side
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
