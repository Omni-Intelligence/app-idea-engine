import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ProjectData, QuestionnaireResponse, GeneratedDocument } from "@/types/project-details";
import { DocumentType } from "@/types/documents";
import { GeneratedDocuments } from "@/components/project/GeneratedDocuments";
import { ProjectDetailsCard } from "@/components/project/ProjectDetailsCard";
import { QuestionnaireResponses } from "@/components/project/QuestionnaireResponses";

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse[]>([]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    if (!projectId) return;

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('user_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      if (!projectData) {
        toast({
          title: "Project not found",
          description: "This project may have been deleted or you may not have access to it.",
          variant: "destructive",
        });
        navigate('/projects');
        return;
      }

      setProject(projectData);

      const { data: responsesData, error: responsesError } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('project_id', projectId)
        .order('question_order');

      if (responsesError) throw responsesError;
      setQuestionnaireResponses(responsesData || []);

      const { data: documentsData, error: documentsError } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments(documentsData || []);

    } catch (error: any) {
      console.error('Error in fetchProjectDetails:', error);
      toast({
        title: "Error",
        description: "Failed to load project details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneretedDocumentEvent = (doc: GeneratedDocument) => {
    setDocuments(prev => [...prev, doc]);
  }

  const handleGenerateDocuments = () => {
    if (project && questionnaireResponses.length > 0) {
      const questions = questionnaireResponses.map(r => r.question);
      const existingDocuments = documents.map(d => d.document_type);
      const answers = questionnaireResponses.reduce((acc, r) => ({
        ...acc,
        [r.question]: r.answer
      }), {});

      navigate('/generate-documents', {
        state: {
          projectId: project.id,
          appIdea: project.project_idea,
          questions,
          answers,
          existingDocuments
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-600">Loading project details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-gray-600">Project not found</p>
            <Button
              onClick={() => navigate('/projects')}
              variant="outline"
            >
              Return to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProjectDetailsCard project={project} >
        <Button
          onClick={() => {
            document.getElementById('generated-documents')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <FileText className="w-4 h-4 " />
          Generate Documents
        </Button>
      </ProjectDetailsCard>
      {questionnaireResponses?.length > 0 && <QuestionnaireResponses responses={questionnaireResponses} />}
      <GeneratedDocuments documents={documents} projectId={project.id} onGeneretedDocumentEvent={handleGeneretedDocumentEvent} onGenerateDocument={handleGenerateDocuments} />
    </div>
  );
};

export default ProjectDetailsPage;
