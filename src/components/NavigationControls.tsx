import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationControlsProps {
  onBack: () => void;
  showBack: boolean;
}

export const NavigationControls = ({ onBack, showBack }: NavigationControlsProps) => {
  const navigate = useNavigate();

  const handleStartAgain = () => {
    navigate('/');
  };

  return (
    <div className="w-full flex justify-end gap-4">
      {showBack && (
        <Button onClick={onBack} className="flex items-center">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}
      <Button 
        variant="outline" 
        onClick={handleStartAgain} 
        className="flex items-center"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Start Again
      </Button>
    </div>
  );
};