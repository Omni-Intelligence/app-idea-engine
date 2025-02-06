
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface InitialIdeaPreviewProps {
  initialAnswer: string | string[];
}

export const InitialIdeaPreview = ({ initialAnswer }: InitialIdeaPreviewProps) => {
  const [showFullIdea, setShowFullIdea] = useState(false);
  
  if (!initialAnswer) return null;

  const displayText = typeof initialAnswer === 'string' 
    ? (initialAnswer.length > 100 ? `${initialAnswer.substring(0, 100)}...` : initialAnswer)
    : initialAnswer.join(', ');

  return (
    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-purple-900 mb-1">Your Initial Project Idea:</h3>
          <p className="text-sm text-purple-800">
            {showFullIdea ? (typeof initialAnswer === 'string' ? initialAnswer : initialAnswer.join(', ')) : displayText}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
          onClick={() => setShowFullIdea(!showFullIdea)}
        >
          {showFullIdea ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
