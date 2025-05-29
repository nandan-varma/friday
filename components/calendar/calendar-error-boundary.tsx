"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class CalendarErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Calendar error:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6">
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="text-muted-foreground">
                  We encountered an error while loading your calendar. Please try again.
                </p>
                {this.state.error && (
                  <details className="text-sm text-muted-foreground">
                    <summary className="cursor-pointer">Error details</summary>
                    <pre className="mt-2 text-left bg-muted p-2 rounded text-xs overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </div>
              <Button onClick={this.handleRetry} variant="outline">
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
