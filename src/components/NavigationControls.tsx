import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface NavigationControlsProps {
  onBack: () => void;
  showBack: boolean;
}

export const NavigationControls = ({ onBack, showBack }: NavigationControlsProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      {showBack && (
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}
    </div>
  );
};