
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ErrorState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">No Questions Available</h2>
        <p className="text-gray-600">
          Please start over and provide your initial project idea.
        </p>
        <Button onClick={() => navigate('/')} className="mt-6">
          Start Over
        </Button>
      </div>
    </div>
  );
};
