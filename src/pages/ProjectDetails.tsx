
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
}

interface DocumentDetails {
  id: string;
  document_type: string;
  content: string;
  created_at: string;
  status: string;
  submission_id: string | null;
}

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [documents, setDocuments] = useState<DocumentDetails[]>([]);
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
        .select('id, title, description, created_at, status')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      const { data: documentsData, error: documentsError } = await supabase
        .from('generated_documents')
        .select('id, document_type, content, created_at, status, submission_id')
        .eq('submission_id', projectId)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments(documentsData || []);

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
    navigate('/generate-documents', { 
      state: { 
        projectId,
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
            <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
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
