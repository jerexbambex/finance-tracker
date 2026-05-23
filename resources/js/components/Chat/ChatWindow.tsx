import { AlertCircle, BarChart3, Bot, List, MessageSquare, PiggyBank, Plus, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { LoadingDots, ToolIndicator } from './LoadingIndicators';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ToolEvent {
  id: string;
  toolName: string;
  status: 'running' | 'completed';
  resultSummary?: string;
}

interface ChatWindowProps {
  conversationId?: string;
  onConversationCreate?: (id: string) => void;
  onSendReady?: (fn: (msg: string) => void) => void;
  className?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

export interface ChatWindowHandle {
  send: (message: string) => void;
}

const quickActions = [
  { icon: TrendingUp,  label: 'Show my spending this month',        color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { icon: PiggyBank,   label: 'Set a $500 food budget for this month', color: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-50 dark:bg-violet-950/40' },
  { icon: BarChart3,   label: 'Show my budget status',               color: 'text-blue-600 dark:text-blue-400',      bg: 'bg-blue-50 dark:bg-blue-950/40' },
  { icon: List,        label: 'List all my budgets',                 color: 'text-teal-600 dark:text-teal-400',      bg: 'bg-teal-50 dark:bg-teal-950/40' },
  { icon: Plus,        label: 'Add a $45 grocery expense today',     color: 'text-indigo-600 dark:text-indigo-400',  bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
  { icon: MessageSquare, label: 'Summarize my finances this month',  color: 'text-cyan-600 dark:text-cyan-400',      bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
];

export const ChatWindow = forwardRef<ChatWindowHandle, ChatWindowProps>(function ChatWindow({
  conversationId,
  onConversationCreate,
  onSendReady,
  className,
  title = 'Finance Assistant',
  description = 'Ask me anything about your finances',
  compact = false,
}, ref) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [activeConversationId, setActiveConversationId] = useState(conversationId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, toolEvents]);

  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    const clientMessageId = crypto.randomUUID();
    const userMessage: Message = {
      id: clientMessageId,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingContent('');
    setToolEvents([]);
    setErrorMessage(null);

    try {
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');

      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify({
          conversation_id: activeConversationId,
          message: content,
          client_message_id: clientMessageId,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `Request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            processSseBlock(buffer, {
              onStart: handleStart,
              onContent: handleContent,
              onDone: handleDone,
              onError: handleError,
              onToolCall: handleToolCall,
              onToolResult: handleToolResult,
            });
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          processSseBlock(block, {
            onStart: handleStart,
            onContent: handleContent,
            onDone: handleDone,
            onError: handleError,
            onToolCall: handleToolCall,
            onToolResult: handleToolResult,
          });
        }

        function handleStart(data: { conversation_id?: string }) {
          if (data.conversation_id) {
            setActiveConversationId(data.conversation_id);
            onConversationCreate?.(data.conversation_id);
          }
        }

        function handleContent(data: { content?: string }) {
          if (!data.content) return;
          fullContent += data.content;
          setStreamingContent(fullContent);
        }

        function handleDone() {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: fullContent,
              timestamp: new Date(),
            },
          ]);
          setStreamingContent('');
          setIsLoading(false);
        }

        function handleError(data: { message?: string }) {
          throw new Error(data.message || 'Unknown chat error');
        }

        function handleToolCall(data: { tool_call?: { tool_name?: string; tool_id?: string } }) {
          const toolName = data.tool_call?.tool_name;
          if (!toolName) return;

          setToolEvents((prev) => [
            ...prev,
            {
              id: data.tool_call?.tool_id || crypto.randomUUID(),
              toolName,
              status: 'running',
            },
          ]);
        }

        function handleToolResult(data: { tool_result?: { tool_name?: string; tool_id?: string; result?: unknown }; successful?: boolean }) {
          const toolId = data.tool_result?.tool_id;
          const toolName = data.tool_result?.tool_name;
          const resultSummary = summarizeToolResult(toolName, data.tool_result?.result);

          setToolEvents((prev) => {
            const existing = prev.find((event) => event.id === toolId);

            if (!existing) {
              return toolName
                ? [...prev, { id: toolId || crypto.randomUUID(), toolName, status: 'completed', resultSummary }]
                : prev;
            }

            return prev.map((event) =>
              event.id === toolId ? { ...event, status: 'completed', resultSummary } : event,
            );
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setErrorMessage(getFriendlyErrorMessage(error));
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
      setToolEvents([]);
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  // Expose sendMessage via ref and callback
  useImperativeHandle(ref, () => ({ send: sendMessage }));
  useEffect(() => { onSendReady?.(sendMessage); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetConversation = () => {
    setMessages([]);
    setStreamingContent('');
    setToolEvents([]);
    setErrorMessage(null);
    setIsLoading(false);
    setActiveConversationId(undefined);
  };

  const isEmpty = messages.length === 0 && !streamingContent;

  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden rounded-3xl border bg-card/95 shadow-sm',
        compact ? 'h-[720px]' : 'h-[calc(100vh-17rem)] min-h-[680px] max-h-[980px]',
        className,
      )}
    >
      {/* Header */}
      <div className={cn('border-b bg-gradient-to-r from-violet-500/8 via-background to-background', compact ? 'p-5' : 'p-4')}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex-shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">{title}</h2>
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetConversation}
            disabled={isLoading || (messages.length === 0 && !activeConversationId)}
            className="rounded-full gap-1.5 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            New chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className={cn(
        'flex-1 overflow-y-auto',
        compact ? 'p-5' : 'p-4',
      )}>
        {errorMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Request failed</p>
              <p className="text-amber-800/90 dark:text-amber-300/90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex h-full flex-col items-center justify-center gap-8 py-6">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">Your AI Finance Assistant</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Ask about budgets, log transactions, get insights — all in plain English.
                </p>
              </div>
            </div>

            <div className="grid w-full max-w-2xl gap-2.5 sm:grid-cols-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => sendMessage(action.label)}
                  disabled={isLoading}
                  className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3.5 text-left text-sm font-medium transition-all hover:border-primary/30 hover:bg-accent hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0', action.bg)}>
                    <action.icon className={cn('h-4 w-4', action.color)} />
                  </div>
                  <span className="leading-snug">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <ChatMessage key={message.id} {...message} />
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <ChatMessage role="assistant" content={streamingContent} isStreaming />
        )}

        {/* Tool events — show inline after any in-progress message */}
        {toolEvents.length > 0 && (
          <div className="space-y-2 px-2 pb-2">
            {toolEvents.map((event) => (
              <ToolIndicator
                key={event.id}
                toolName={event.toolName}
                status={event.status}
                resultSummary={event.resultSummary}
              />
            ))}
          </div>
        )}

        {/* Initial loading dots (before first token) */}
        {isLoading && !streamingContent && toolEvents.length === 0 && (
          <div className="flex justify-start p-4">
            <LoadingDots label="Thinking..." />
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        compact={compact}
        placeholder="Ask about your finances, set a budget, log a transaction..."
      />
    </Card>
  );
});

function getFriendlyErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Something went wrong.';

  if (message.includes('rate limited')) return 'The AI provider is rate limiting requests. Wait a moment, then try again.';
  if (message.includes('insufficient_quota')) return 'The AI provider account is out of quota. Contact support.';
  if (message.includes('Failed to send message')) return 'Could not submit the request. Refresh and try again.';

  return message;
}

type SseHandlers = {
  onStart: (data: { conversation_id?: string }) => void;
  onContent: (data: { content?: string }) => void;
  onDone: () => void;
  onError: (data: { message?: string }) => void;
  onToolCall: (data: { tool_call?: { tool_name?: string; tool_id?: string } }) => void;
  onToolResult: (data: { tool_result?: { tool_name?: string; tool_id?: string; result?: unknown }; successful?: boolean }) => void;
};

function processSseBlock(block: string, handlers: SseHandlers) {
  const lines = block.split('\n').filter(Boolean);
  let eventName = 'message';
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event: ')) eventName = line.slice(7).trim();
    if (line.startsWith('data: ')) dataLines.push(line.slice(6));
  }

  if (dataLines.length === 0) return;

  const data = JSON.parse(dataLines.join(''));
  const type = eventName === 'message' ? data.type : eventName;

  switch (type) {
    case 'start':       handlers.onStart(data);       break;
    case 'content':     handlers.onContent(data);     break;
    case 'tool_call':   handlers.onToolCall(data);    break;
    case 'tool_result': handlers.onToolResult(data);  break;
    case 'done':        handlers.onDone();             break;
    case 'error':       handlers.onError(data);       break;
  }
}

function summarizeToolResult(toolName: string | undefined, result: unknown): string {
  if (!result) return 'Completed';

  // McpToolAdapter returns a JSON string — parse it so we can read the fields
  let r: Record<string, unknown>;
  if (typeof result === 'string') {
    try {
      const parsed: unknown = JSON.parse(result);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        r = parsed as Record<string, unknown>;
      } else {
        return result;
      }
    } catch {
      return result;
    }
  } else if (typeof result !== 'object' || Array.isArray(result)) {
    return String(result);
  } else {
    r = result as Record<string, unknown>;
  }

  switch (toolName) {
    case 'accounts_list': {
      const count = typeof r.count === 'number' ? r.count : (Array.isArray(r.accounts) ? r.accounts.length : null);
      if (count !== null) return `${count} account${count === 1 ? '' : 's'} found`;
      break;
    }
    case 'budgets_create':
      if (r.name && r.amount) return `${r.name} · $${r.amount} · ${r.period ?? 'monthly'}`;
      break;
    case 'budgets_status':
      if (r.budget_amount) return `$${r.spent ?? 0} spent of $${r.budget_amount} (${r.percent_used ?? 0}% used)`;
      break;
    case 'budgets_list': {
      const count = typeof r.count === 'number' ? r.count : (Array.isArray(r.budgets) ? r.budgets.length : null);
      if (count !== null) return `${count} budget${count === 1 ? '' : 's'} found`;
      break;
    }
    case 'transactions_create':
      if (r.description && r.amount) return `${r.description} · $${r.amount}`;
      break;
    case 'transactions_list': {
      const count = typeof r.count === 'number' ? r.count : (Array.isArray(r.transactions) ? r.transactions.length : null);
      if (count !== null) return `${count} transaction${count === 1 ? '' : 's'} found`;
      break;
    }
    case 'reports_monthly_summary':
      if (r.income !== undefined) return `Income $${r.income} · Expenses $${r.expenses}`;
      break;
  }

  const json = JSON.stringify(result);
  return json.length > 120 ? `${json.slice(0, 117)}...` : json;
}
