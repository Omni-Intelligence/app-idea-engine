
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { FileText, ChevronLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface ProjectDetails {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  status: string | null;
  submission_id: string | null;
}

interface DocumentDetails {
  id: string;
  document_type: string;
  content: string;
  created_at: string;
  status: string;
  submission_id: string | null;
}

interface ProjectSubmission {
  id: string;
  project_idea: string;
  answers: Json;
  core_features: string;
  target_audience: string;
  problem_solved: string;
  tech_stack: string;
  development_timeline: string;
  monetization: string;
  ai_integration: string;
  technical_expertise: string;
  scaling_expectation: string;
}

const ProjectDetails = () => {
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
      // First, get the project which contains the submission_id
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

      // Then, if we have a submission_id, get the submission details
      if (projectData.submission_id) {
        const { data: submissionData, error: submissionError } = await supabase
          .from('project_submissions')
          .select('*')
          .eq('id', projectData.submission_id)
          .maybeSingle();

        if (submissionError) throw submissionError;
        if (submissionData) {
          setSubmission(submissionData);

          // Finally, get documents associated with this submission
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

  const handleGenerateMore = () => {
    if (!submission) {
      toast({
        title: "Error",
        description: "Project submission data not found.",
        variant: "destructive",
      });
      return;
    }

    navigate('/generate-documents', { 
      state: { 
        projectId: submission.id,
        appIdea: submission.project_idea,
        questions: Object.keys(submission.answers),
        answers: submission.answers
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

  const getDocumentTitle = (type: string) => {
    return type.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/projects')}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-purple-900">{project.title}</CardTitle>
            <CardDescription>
              Created {formatDistanceToNow(new Date(project.created_at))} ago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 whitespace-pre-wrap mb-6">{project.description}</p>
            
            {submission && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-purple-800">Project Details</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-gray-700">Project Idea</h4>
                    <p className="text-gray-600">{submission.project_idea}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Core Features</h4>
                    <p className="text-gray-600">{submission.core_features}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Target Audience</h4>
                    <p className="text-gray-600">{submission.target_audience}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Problem Solved</h4>
                    <p className="text-gray-600">{submission.problem_solved}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Tech Stack</h4>
                    <p className="text-gray-600">{submission.tech_stack}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Development Timeline</h4>
                    <p className="text-gray-600">{submission.development_timeline}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Monetization Strategy</h4>
                    <p className="text-gray-600">{submission.monetization}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">AI Integration</h4>
                    <p className="text-gray-600">{submission.ai_integration}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Technical Expertise</h4>
                    <p className="text-gray-600">{submission.technical_expertise}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Scaling Expectations</h4>
                    <p className="text-gray-600">{submission.scaling_expectation}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-purple-900">Generated Documents</h2>
          <Button onClick={handleGenerateMore} className="bg-purple-600 hover:bg-purple-700">
            Generate More Documents
          </Button>
        </div>

        <div className="grid gap-4">
          {documents.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
                  <p className="text-gray-600 mb-4">Start generating documents for your project!</p>
                  <Button onClick={handleGenerateMore} className="bg-purple-600 hover:bg-purple-700">
                    Generate Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-purple-900">
                    {getDocumentTitle(doc.document_type)}
                  </CardTitle>
                  <CardDescription>
                    Generated {formatDistanceToNow(new Date(doc.created_at))} ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {doc.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-600 mb-2">{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
