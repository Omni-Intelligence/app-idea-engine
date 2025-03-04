import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentType, documentTypes, DocumentGenerationData } from "@/types/documents";

export const useDocumentGeneration = (projectId: string, onGeneretedEvent: (docType: DocumentGenerationData) => void) => {
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
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
          userId: user.id
        }
      });

      if (error) throw error;
      if (!data) throw new Error('No response from function');

      toast({
        title: "Success",
        description: `${docType.title} has been generated!`,
      });
      onGeneretedEvent(data?.document);
      return true;
    } catch (error: any) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: `Failed to generate ${docType.title}: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setGeneratingDoc(null);
    }
  };

  const generateAllDocuments = async () => {
    if (isGeneratingAll) return;
    
    setIsGeneratingAll(true);
    let success = true;
    
    // Define the order of document generation
    const orderedDocTypes = [
      documentTypes.find(d => d.id === "Project Requirements Document"),
      documentTypes.find(d => d.id === "App Flow Document"),
      documentTypes.find(d => d.id === "Tech Stack Document"),
      documentTypes.find(d => d.id === "Backend Structure Document"),
      documentTypes.find(d => d.id === "Frontend Guidelines Document"),
      documentTypes.find(d => d.id === "File Structure Document"),
      documentTypes.find(d => d.id === "Implementation Plan"),
    ].filter((d): d is DocumentType => d !== undefined);

    for (const docType of orderedDocTypes) {
      toast({
        title: "Generating Document",
        description: `Starting generation of ${docType.title}...`,
      });

      const result = await generateDocument(docType);
      if (!result) {
        success = false;
        break;
      }

      // Add a small delay between documents to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setIsGeneratingAll(false);

    if (success) {
      toast({
        title: "All Documents Generated",
        description: "Successfully generated all project documents!",
      });
      navigate(`/project/${projectId}`);
    }
  };

  return {
    generatingDoc,
    isGeneratingAll,
    generateDocument,
    generateAllDocuments
  };
};
