'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CalendarProvider } from '@/lib/hooks/use-calendar'
import { TTSProvider } from '@/lib/hooks/use-tts'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <CalendarProvider>
        <SidebarProvider>
          <TTSProvider>
          <TooltipProvider>{children}</TooltipProvider>
          </TTSProvider>
        </SidebarProvider>
      </CalendarProvider>
    </NextThemesProvider>
  )
}
