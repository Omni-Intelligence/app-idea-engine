
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const ProjectHeader = () => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="ghost"
      onClick={() => navigate('/projects')}
      className="mb-6"
    >
      <ChevronLeft className="mr-2 h-4 w-4" />
      Back to Projects
    </Button>
  );
};
