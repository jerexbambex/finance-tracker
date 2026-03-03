import AppContent from '@/Components/app-content';
import AppShell from '@/Components/app-shell';
import Heading from '@/Components/heading';
import { ChatWindow } from '@/Components/Chat';
import { Head } from '@inertiajs/react';

export default function Chat() {
  return (
    <AppShell>
      <Head title="AI Chat" />
      <AppContent>
        <div className="mb-6">
          <Heading>AI Finance Assistant</Heading>
          <p className="text-muted-foreground">
            Chat with your AI assistant to manage transactions, budgets, and get financial insights.
          </p>
        </div>
        <ChatWindow />
      </AppContent>
    </AppShell>
  );
}
