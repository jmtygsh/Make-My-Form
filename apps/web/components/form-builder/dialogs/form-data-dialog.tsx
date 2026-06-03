"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Pre } from "~/components/ui/pre";

interface FormDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, any>;
}

export function FormDataDialog({ isOpen, onClose, data }: FormDataDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submitted Form Data</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Pre language="json" code={JSON.stringify(data, null, 2)} className="min-h-20 max-h-[400px]" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
