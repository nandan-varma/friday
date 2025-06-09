"use client"

import { useState } from "react"
import { MessageCircle, X, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import ChatWindow, { type ChatWindowProps } from "./chat-window"

interface MinimizedChatWindowProps extends Omit<ChatWindowProps, 'height' | 'className'> {
    /** Position of the minimized chat button */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    /** Custom className for the container */
    className?: string
}

export default function MinimizedChatWindow({
    position = 'bottom-right',
    className,
    ...chatProps
}: MinimizedChatWindowProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMaximized, setIsMaximized] = useState(false)
    const isMobile = useIsMobile()

    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6',
    }

    // Mobile: Use Sheet (slide from bottom)
    if (isMobile) {
        return (
            <div className={cn("fixed z-50", positionClasses[position], className)}>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            size="lg"
                            className="rounded-full shadow-lg h-14 w-14 p-0"
                            aria-label="Open chat"
                        >
                            <MessageCircle className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh] p-0">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle>AI Assistant</SheetTitle>
                        </SheetHeader>
                        <div className="h-[calc(90vh-65px)]">
                            <ChatWindow
                                {...chatProps}
                                height="h-full"
                                className="border-0 rounded-none"
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        )
    }

    // Desktop: Use Dialog or minimized window
    return (
        <div className={cn("fixed z-50", positionClasses[position], className)}>
            {!isOpen ? (
                // Minimized state - floating button
                <Button
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className="rounded-full shadow-lg h-14 w-14 p-0"
                    aria-label="Open chat"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            ) : isMaximized ? (
                // Maximized state - full screen dialog
                <Dialog open={isMaximized} onOpenChange={setIsMaximized}>
                    <DialogContent className="max-w-4xl h-[80vh] p-0">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">AI Assistant</h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsMaximized(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Minimize2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsMaximized(false)
                                        setIsOpen(false)
                                    }}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="h-[calc(80vh-65px)]">
                            <ChatWindow
                                {...chatProps}
                                height="h-full"
                                className="border-0 rounded-none"
                            />
                        </div>
                    </DialogContent>
                </Dialog>            ) : (                // Windowed state - floating card
                <Card className="w-[28rem] h-[32rem] shadow-xl flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b shrink-0">
                        <h3 className="font-semibold text-sm">AI Assistant</h3>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMaximized(true)}
                                className="h-7 w-7 p-0"
                            >
                                <Maximize2 className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-7 w-7 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ChatWindow
                            {...chatProps}
                            height="h-full"
                            className="border-0 rounded-none"
                        />
                    </div>
                </Card>
            )}
        </div>
    )
}
