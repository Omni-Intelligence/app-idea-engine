
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface DocumentItemProps {
  type: string;
  icon: LucideIcon;
  label: string;
  isGenerating: boolean;
  existingDoc: any;
  onGenerate: () => void;
  onView: () => void;
}

export const DocumentItem = ({
  type,
  icon: Icon,
  label,
  isGenerating,
  existingDoc,
  onGenerate,
  onView,
}: DocumentItemProps) => {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <Icon className="h-6 w-6 text-gray-500" />
      <div className="flex-1">
        <h4 className="font-medium">{label}</h4>
      </div>
      {existingDoc ? (
        <Button variant="outline" onClick={onView}>
          View
        </Button>
      ) : (
        <Button onClick={onGenerate} disabled={!!isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate'
          )}
        </Button>
      )}
    </div>
  );
};
