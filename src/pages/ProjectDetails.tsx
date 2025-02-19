
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectInfo } from "@/components/project/ProjectInfo";
import { DocumentsList } from "@/components/project/DocumentsList";
import type { ProjectDetails, DocumentDetails, ProjectSubmission } from '@/types/project';
import { Card, CardContent } from "@/components/ui/card";

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [documents, setDocuments] = useState<DocumentDetails[]>([]);
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [loading, setLoading] = useState(true);

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
        .maybeSingle();

      if (projectError) throw projectError;
      if (!projectData) {
        throw new Error('Project not found');
      }
      
      setProject(projectData);

      if (projectData.submission_id) {
        const { data: submissionData, error: submissionError } = await supabase
          .from('project_submissions')
          .select('*')
          .eq('id', projectData.submission_id)
          .maybeSingle();

        if (submissionError) throw submissionError;
        if (submissionData) {
          setSubmission(submissionData);

          const { data: documentsData, error: documentsError } = await supabase
            .from('generated_documents')
            .select('*')
            .eq('submission_id', projectData.submission_id)
            .order('created_at', { ascending: false });

          if (documentsError) throw documentsError;
          setDocuments(documentsData || []);
        }
      }

    } catch (error: any) {
      console.error('Error fetching project details:', error);
      toast({
        title: "Error",
        description: "Failed to load project details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocuments = () => {
    if (!submission) {
      toast({
        title: "Error",
        description: "Project submission data not found.",
        variant: "destructive",
      });
      return;
    }

    const answers = submission.answers as Record<string, any>;
    
    navigate('/generate-documents', { 
      state: { 
        projectId: submission.id,
        appIdea: submission.project_idea,
        questions: Object.keys(answers),
        answers: answers
      } 
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[200px] w-full mb-6" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
              <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
              <Button onClick={() => navigate('/projects')}>
                Back to Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8">
      <div className="container mx-auto px-4">
        <ProjectHeader />
        <ProjectInfo project={project} submission={submission} />
        <DocumentsList 
          documents={documents} 
          onGenerateClick={handleGenerateDocuments}
        />
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
