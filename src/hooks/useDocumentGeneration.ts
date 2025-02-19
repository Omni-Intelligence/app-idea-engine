
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
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate documents.",
          variant: "destructive",
        });
        return;
      }
      
      let functionName = '';
      switch(docType.id) {
        case 'App Flow Document':
          functionName = 'generate-app-flow';
          break;
        case 'Project Requirements Document':
          functionName = 'generate_requirements';
          break;
        case 'Tech Stack Document':
          functionName = 'generate-tech-stack';
          break;
        case 'Frontend Guidelines Document':
          functionName = 'generate-frontend-guidelines';
          break;
        case 'Backend Structure Document':
          functionName = 'generate-backend-structure';
          break;
        case 'File Structure Document':
          functionName = 'generate-file-structure';
          break;
        case 'Implementation Plan':
          functionName = 'generate-implementation-plan';
          break;
        default:
          throw new Error('Invalid document type');
      }
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          projectId,
          userId: user.id  // Explicitly passing userId to all functions
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
      console.error('Error generating document:', error);
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
