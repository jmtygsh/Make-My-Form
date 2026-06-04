'use client';

import { useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { CreateFormData } from './types';

interface CreateFormDialogProps {
  isOpen: boolean;
  isCreating: boolean;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreateFormData) => Promise<void>;
}

export function CreateFormDialog({
  isOpen,
  isCreating,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onOpenChange,
  onCreate,
}: CreateFormDialogProps) {
  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      return;
    }
    await onCreate({ title, description });
  }, [title, description, onCreate]);

  const isTitleEmpty = !title.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Create a new form</DialogTitle>
          <DialogDescription>
            Give your form a name and an optional description to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="form-title">Title</Label>
            <Input
              id="form-title"
              placeholder="e.g., Customer Feedback"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              disabled={isCreating}
              aria-invalid={isTitleEmpty && title !== ''}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="form-description">Description (Optional)</Label>
            <Input
              id="form-description"
              placeholder="e.g., Weekly feedback form for recent customers"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={isCreating}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || isTitleEmpty}
            className="bg-[#1d7b69] hover:bg-[#166052] text-white"
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
