// frontend/src/components/TalkingPoint.tsx
import { FC, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical, Edit2, Save, X } from 'lucide-react';

interface TalkingPointProps {
  id: string;
  title: string;
  notes: string;
  index: number;
  isFixed: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, notes: string) => void;
}

export const TalkingPoint: FC<TalkingPointProps> = ({
  id,
  title,
  notes,
  index,
  isFixed,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editNotes, setEditNotes] = useState(notes);

  const handleSave = () => {
    onEdit(id, editTitle, editNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditNotes(notes);
    setIsEditing(false);
  };

  return (
    <div className="rounded-md border bg-white p-3 shadow-sm">
      <div className="flex items-center">
        <div className={`mr-2 ${isFixed ? 'opacity-30' : 'cursor-move'}`}>
          <GripVertical size={16} />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full"
                placeholder="Topic title"
              />
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full resize-none text-sm"
                placeholder="Add notes (optional)"
                rows={2}
              />
              <div className="flex space-x-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  className="text-xs"
                >
                  <Save size={14} className="mr-1" /> Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="text-xs"
                >
                  <X size={14} className="mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <h4 className="font-medium">{title}</h4>
                <div className="flex space-x-1">
                  {!isFixed && (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="rounded-sm p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(id)}
                        className="rounded-sm p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {notes && <p className="mt-1 text-sm text-gray-600">{notes}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};