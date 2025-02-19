
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
      console.log('Starting document generation for:', docType.id);
      const functionName = `generate_${docType.id}`;
      
      console.log('Calling edge function:', functionName, {
        projectId
      });

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { projectId }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data?.document) {
        throw new Error('No document data in response');
      }

      toast({
        title: "Success",
        description: `${docType.title} has been generated!`,
      });

      navigate(`/project/${projectId}`);

    } catch (error: any) {
      console.error('Error generating document:', error);
      
      let errorMessage = 'Failed to generate document. Please try again.';
      if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
