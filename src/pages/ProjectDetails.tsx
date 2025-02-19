
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  project_idea: string | null;
  core_features: string | null;
  target_audience: string | null;
  problem_solved: string | null;
  tech_stack: string | null;
  development_timeline: string | null;
  monetization: string | null;
  ai_integration: string | null;
  technical_expertise: string | null;
  scaling_expectation: string | null;
}

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    
    try {
      console.log('Fetching project with ID:', projectId);
      
      const { data: projectData, error: projectError } = await supabase
        .from('user_projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError) {
        console.error('Project fetch error:', projectError);
        throw projectError;
      }

      if (!projectData) {
        console.log('No project found with ID:', projectId);
        toast({
          title: "Project not found",
          description: "Could not find the requested project.",
          variant: "destructive",
        });
        return;
      }

      console.log('Project data:', projectData);
      setProject(projectData);
      
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-600">Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
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
            <p>{project.status || 'No status set'}</p>
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

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Project Idea</h3>
            <p>{project.project_idea || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Core Features</h3>
            <p>{project.core_features || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Target Audience</h3>
            <p>{project.target_audience || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Problem Solved</h3>
            <p>{project.problem_solved || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Tech Stack</h3>
            <p>{project.tech_stack || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Development Timeline</h3>
            <p>{project.development_timeline || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Monetization Strategy</h3>
            <p>{project.monetization || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">AI Integration</h3>
            <p>{project.ai_integration || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Technical Expertise</h3>
            <p>{project.technical_expertise || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Scaling Expectations</h3>
            <p>{project.scaling_expectation || 'Not specified'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailsPage;
