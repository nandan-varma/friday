"use client"

import React, { memo, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  content: string
  className?: string
  isUserMessage?: boolean
}

const MarkdownRenderer = memo<MarkdownProps>(({ content, className, isUserMessage = false }) => {
  const processedContent = useMemo(() => {
    // Simple preprocessing to handle common formatting patterns
    return content
      .replace(/\*\*(.*?)\*\*/g, '**$1**') // Ensure bold formatting
      .replace(/\*(.*?)\*/g, '*$1*') // Ensure italic formatting
      .replace(/^• /gm, '- ') // Convert bullet points to markdown lists
      .trim()
  }, [content])
  return (
    <div className={cn(
      "prose prose-sm max-w-none",
      "dark:prose-invert",
      "[&_p]:mb-2 last:[&_p]:mb-0",
      "[&_ul]:my-2 [&_ol]:my-2 [&_li]:mb-1",
      "[&_strong]:font-semibold [&_strong]:text-foreground",
      "[&_em]:italic [&_em]:text-foreground/90",
      "[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-muted [&_code]:text-sm [&_code]:font-mono",
      "[&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:overflow-x-auto",
      "[&_pre_code]:p-0 [&_pre_code]:bg-transparent",
      "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
      "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4 first:[&_h1]:mt-0",
      "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 first:[&_h2]:mt-0",
      "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 first:[&_h3]:mt-0",
      "[&_hr]:border-border [&_hr]:my-4",
      "[&_table]:border-collapse [&_table]:w-full",
      "[&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted [&_th]:font-semibold",
      "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
      isUserMessage && "**:text-primary-foreground",
      className
    )}>
      <ReactMarkdown
        components={{
          // Custom components for better styling
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto">
                <code className="text-sm font-mono" {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code 
                className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-foreground" 
                {...props}
              >
                {children}
              </code>
            )
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
})

MarkdownRenderer.displayName = 'MarkdownRenderer'

export { MarkdownRenderer }
