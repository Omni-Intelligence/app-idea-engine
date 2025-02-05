
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentViewerProps {
  document: any;
  documentLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentViewer = ({
  document,
  documentLabel,
  open,
  onOpenChange,
}: DocumentViewerProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{documentLabel}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-4">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{document?.content}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
