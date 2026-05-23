import { Check, Copy, User } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
}

function BotAvatar() {
  return (
    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" strokeWidth={2.5} />
        <line x1="12" y1="16" x2="12" y2="16" strokeWidth={2.5} />
        <line x1="16" y1="16" x2="16" y2="16" strokeWidth={2.5} />
      </svg>
    </div>
  );
}

export function ChatMessage({ role, content, timestamp, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('group flex gap-3 px-2 py-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && <BotAvatar />}

      <div className={cn('flex max-w-[82%] flex-col gap-1.5', isUser && 'items-end')}>
        {/* Label + timestamp */}
        <div className={cn('flex items-center gap-2 px-1', isUser ? 'justify-end' : 'justify-between w-full')}>
          <div className={cn('flex items-center gap-2', isUser && 'flex-row-reverse')}>
            <span className="text-xs font-medium text-foreground/70">
              {isUser ? 'You' : 'Finance Assistant'}
            </span>
            {timestamp && (
              <span className="text-xs text-muted-foreground">
                {timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* Copy button — assistant only, visible on hover */}
          {!isUser && !isStreaming && (
            <button
              onClick={copy}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>

        {/* Bubble */}
        <div
          className={cn(
            'rounded-3xl px-4 py-3 shadow-sm',
            isUser
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md border border-border/60 bg-background text-foreground',
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-6">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words text-sm leading-6
              prose-p:my-1 prose-p:leading-6
              prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
              prose-h1:text-base prose-h2:text-base prose-h3:text-sm
              prose-ul:my-1.5 prose-ul:pl-4 prose-li:my-0.5
              prose-ol:my-1.5 prose-ol:pl-4
              prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
              prose-pre:rounded-xl prose-pre:bg-muted prose-pre:p-3 prose-pre:text-xs
              prose-strong:font-semibold prose-strong:text-foreground
              prose-blockquote:border-l-2 prose-blockquote:border-primary/40 prose-blockquote:pl-3 prose-blockquote:text-muted-foreground prose-blockquote:italic
              prose-hr:border-border/40
            ">
              <ReactMarkdown>{content}</ReactMarkdown>
              {isStreaming && (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-foreground/60 ml-0.5 -mb-0.5" />
              )}
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <User className="h-4.5 w-4.5" />
        </div>
      )}
    </div>
  );
}
