
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const LoadingState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Generating Questions</h2>
        <p className="text-gray-600 mb-8">
          Please wait while we analyze your project idea and generate specific questions...
        </p>
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};
