
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
      const { data, error } = await supabase.functions.invoke('generate_requirements', {
        body: { projectId }
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
