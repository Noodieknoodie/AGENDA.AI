// frontend/src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AgendaForm } from '@/components/AgendaForm';
import { Header } from '@/components/Header';

const queryClient = new QueryClient();

export function App() {
  const [agendaType, setAgendaType] = useState<'client' | 'general'>('client');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          <Header agendaType={agendaType} setAgendaType={setAgendaType} />
          <AgendaForm agendaType={agendaType} />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}