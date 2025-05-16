// frontend/src/components/Header.tsx
import { FC } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface HeaderProps {
  agendaType: 'client' | 'general';
  setAgendaType: (type: 'client' | 'general') => void;
}

export const Header: FC<HeaderProps> = ({ agendaType, setAgendaType }) => {
  return (
    <div className="mb-6 flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center justify-center">
        <h1 className="text-3xl font-bold text-primary">AI Agenda Generator</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Label htmlFor="agenda-type" className={agendaType === 'client' ? 'font-bold' : ''}>
          Client Meeting
        </Label>
        <Switch
          id="agenda-type"
          checked={agendaType === 'general'}
          onCheckedChange={(checked) => setAgendaType(checked ? 'general' : 'client')}
        />
        <Label htmlFor="agenda-type" className={agendaType === 'general' ? 'font-bold' : ''}>
          General Meeting
        </Label>
      </div>
    </div>
  );
};