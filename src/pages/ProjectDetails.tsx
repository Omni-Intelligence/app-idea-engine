import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus | null;
  created_at: string;
  updated_at: string;
  project_idea: string | null;
  user_id: string;
}

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<Array<{
    question: string;
    answer: string;
    question_order: number;
  }>>([]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    
    try {
      console.log('Fetching project with ID:', projectId);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('user_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Project fetch error:', projectError);
        throw projectError;
      }

      if (!projectData) {
        console.log('No project found with ID:', projectId);
        toast({
          title: "Project not found",
          description: "This project may have been deleted or you may not have access to it.",
          variant: "destructive",
        });
        navigate('/projects');
        return;
      }

      setProject(projectData);

      // Fetch questionnaire responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('project_id', projectId)
        .order('question_order');

      if (responsesError) {
        console.error('Responses fetch error:', responsesError);
        throw responsesError;
      }

      setQuestionnaireResponses(responsesData || []);
      
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

  const handleGenerateDocuments = () => {
    if (project && questionnaireResponses.length > 0) {
      const questions = questionnaireResponses.map(r => r.question);
      const answers = questionnaireResponses.reduce((acc, r) => ({
        ...acc,
        [r.question]: r.answer
      }), {});

      navigate('/generate-documents', {
        state: {
          projectId: project.id,
          appIdea: project.project_idea,
          questions,
          answers
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

  const getStatusColor = (status: ProjectStatus | null) => {
    switch (status) {
      case 'draft':
        return 'text-yellow-600';
      case 'active':
        return 'text-green-600';
      case 'completed':
        return 'text-blue-600';
      case 'archived':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-900">{project.title}</h1>
        <Button 
          onClick={handleGenerateDocuments}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Documents
        </Button>
      </div>

      {/* Project Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Title</h3>
            <p>{project.title}</p>
          </div>
          <div>
            <h3 className="font-semibold">Description</h3>
            <p>{project.description || 'No description provided'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <p className={getStatusColor(project.status)}>
              {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'No status set'}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Created At</h3>
            <p>{new Date(project.created_at).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-semibold">Last Updated</h3>
            <p>{new Date(project.updated_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questionnaireResponses.map((response, index) => (
            <div key={index}>
              <h3 className="font-semibold">{response.question}</h3>
              <p>{response.answer || 'Not specified'}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailsPage;
