import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-3 p-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      <div className={cn('flex max-w-[80%] flex-col gap-2', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          )}
        >
          <p className="whitespace-pre-wrap break-words text-sm">{content}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString()}
          </span>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
