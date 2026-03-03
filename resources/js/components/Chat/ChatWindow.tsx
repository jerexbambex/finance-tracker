import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { LoadingDots } from './LoadingIndicators';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  conversationId?: string;
  onConversationCreate?: (id: string) => void;
}

export function ChatWindow({ conversationId, onConversationCreate }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: content,
          client_message_id: clientMessageId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'content') {
              fullContent += data.content;
              setStreamingContent(fullContent);
            } else if (data.type === 'done') {
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
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const quickActions = [
    'Show my spending this month',
    'Set a monthly budget',
    'List my budgets',
  ];

  return (
    <Card className="flex h-[600px] flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Finance Assistant</h2>
        <p className="text-sm text-muted-foreground">Ask me anything about your finances</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <p className="text-center text-muted-foreground">
              Start a conversation or try a quick action:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(action)}
                  disabled={isLoading}
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} {...message} />
        ))}

        {streamingContent && (
          <ChatMessage role="assistant" content={streamingContent} />
        )}

        {isLoading && !streamingContent && (
          <div className="flex justify-start p-4">
            <LoadingDots />
          </div>
        )}

        <div ref={scrollRef} />
      </ScrollArea>

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </Card>
  );
}
