
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  const handleCopy = async () => {
    if (document?.content) {
      try {
        await navigator.clipboard.writeText(document.content);
        toast({
          title: "Copied!",
          description: "Document content copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy content",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{documentLabel}</DialogTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
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
