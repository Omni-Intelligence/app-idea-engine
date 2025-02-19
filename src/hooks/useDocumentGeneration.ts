
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
      const functionName = `generate_${docType.id.replace('-', '_')}`;
      
      console.log('Calling edge function:', functionName, {
        projectId
      });

      const { data: generatedDoc, error } = await supabase.functions.invoke(functionName, {
        body: {
          projectId
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!generatedDoc) {
        throw new Error('No document generated');
      }

      console.log('Generated document:', generatedDoc);

      toast({
        title: "Success",
        description: `${docType.title} has been generated!`,
      });

      navigate(`/project/${projectId}`);

    } catch (error: any) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate document. Please try again.",
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
