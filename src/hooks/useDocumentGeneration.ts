
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentType } from "@/types/documents";

export const useDocumentGeneration = (projectId: string) => {
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateDocument = async (docType: DocumentType) => {
    if (!docType.available) {
      toast({
        title: "Coming Soon",
        description: "This document type will be available soon!",
      });
      return;
    }

    setGeneratingDoc(docType.id);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');
      
      let functionName = '';
      switch(docType.id) {
        case 'user_journey_and_app_flow':
          functionName = 'generate-app-flow';
          break;
        case 'detailed_project_requirements':
          functionName = 'generate_requirements';
          break;
        case 'recommended_technology_stack':
          functionName = 'generate-tech-stack';
          break;
        case 'frontend_development_guidelines':
          functionName = 'generate-frontend-guidelines';
          break;
        case 'backend_architecture_and_api':
          functionName = 'generate-backend-structure';
          break;
        case 'project_file_organization':
          functionName = 'generate-file-structure';
          break;
        case 'project_implementation_plan':
          functionName = 'generate-implementation-plan';
          break;
        default:
          throw new Error('Invalid document type');
      }
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          projectId,
          userId: user.id 
        }
      });

      if (error) throw error;
      if (!data) throw new Error('No response from function');

      toast({
        title: "Success",
        description: "Document has been generated!",
      });

      navigate(`/project/${projectId}`);
      
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate document",
        variant: "destructive",
      });
    } finally {
      setGeneratingDoc(null);
    }
  };

  return {
    generatingDoc,
    generateDocument
  };
};
