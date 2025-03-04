
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface QuestionInputProps {
  question: string;
  answer: string;
  isGenerating: boolean;
  onChange: (value: string) => void;
  onGenerateAnswer: () => void;
}

export const QuestionInput = ({
  question,
  answer,
  isGenerating,
  onChange,
  onGenerateAnswer,
}: QuestionInputProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question}
      </label>
      <div className="relative">
        <Textarea
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[100px] pr-12"
        />
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="absolute right-2 top-2 text-primary"
          onClick={onGenerateAnswer}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
