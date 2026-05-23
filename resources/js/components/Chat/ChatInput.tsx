import { Mic, Send, Square } from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface SpeechRecognitionEventLike extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = 'Type your message...',
  compact = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported =
    typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleListening = () => {
    if (!speechSupported || disabled) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();

      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();

      setMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('border-t bg-background/95 p-4 backdrop-blur-sm', compact ? 'p-3' : 'p-4')}
    >
      <div className="rounded-[1.75rem] border border-border/70 bg-background p-2 shadow-sm">
        <div className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'resize-none border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0',
              compact ? 'min-h-[52px]' : 'min-h-[68px]',
            )}
            rows={2}
          />

          <div className="flex items-center gap-2 pb-1">
            {speechSupported && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={toggleListening}
                disabled={disabled}
                className={cn(
                  'rounded-2xl',
                  isListening && 'bg-red-500/10 text-red-600 hover:bg-red-500/15',
                )}
              >
                {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}

            <Button
              type="submit"
              size="icon"
              disabled={disabled || !message.trim()}
              className="rounded-2xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 px-3 pt-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {disabled
              ? <span className="text-violet-600 dark:text-violet-400 font-medium">Assistant is responding...</span>
              : <><span>↵ send</span><span>⇧↵ new line</span>{speechSupported && <span>{isListening ? '🎙 Listening...' : 'Mic available'}</span>}</>
            }
          </div>

          <span className={message.length > 4500 ? 'text-amber-500 font-medium' : ''}>
            {message.length > 0 ? `${message.length}/5000` : 'Be specific for best results'}
          </span>
        </div>
      </div>
    </form>
  );
}
