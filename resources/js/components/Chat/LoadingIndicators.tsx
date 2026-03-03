import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
    </div>
  );
}

export function ToolIndicator({ toolName }: { toolName: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-muted-foreground">Using {toolName}...</span>
    </div>
  );
}
