
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
  project_submissions: ProjectSubmission | null;
}

interface ProjectSubmission {
  id: string;
  project_idea: string;
  core_features: string;
  target_audience: string;
  problem_solved: string;
  tech_stack: string;
  development_timeline: string;
  monetization: string;
  ai_integration: string;
  technical_expertise: string;
  scaling_expectation: string;
  created_at: string;
  status: string;
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
        .select(`
          *,
          project_submissions (*)
        `)
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

      {/* Project Submission Details */}
      {project.project_submissions && (
        <Card>
          <CardHeader>
            <CardTitle>Project Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Project Idea</h3>
              <p>{project.project_submissions.project_idea}</p>
            </div>
            <div>
              <h3 className="font-semibold">Core Features</h3>
              <p>{project.project_submissions.core_features}</p>
            </div>
            <div>
              <h3 className="font-semibold">Target Audience</h3>
              <p>{project.project_submissions.target_audience}</p>
            </div>
            <div>
              <h3 className="font-semibold">Problem Solved</h3>
              <p>{project.project_submissions.problem_solved}</p>
            </div>
            <div>
              <h3 className="font-semibold">Tech Stack</h3>
              <p>{project.project_submissions.tech_stack}</p>
            </div>
            <div>
              <h3 className="font-semibold">Development Timeline</h3>
              <p>{project.project_submissions.development_timeline}</p>
            </div>
            <div>
              <h3 className="font-semibold">Monetization Strategy</h3>
              <p>{project.project_submissions.monetization}</p>
            </div>
            <div>
              <h3 className="font-semibold">AI Integration</h3>
              <p>{project.project_submissions.ai_integration}</p>
            </div>
            <div>
              <h3 className="font-semibold">Technical Expertise</h3>
              <p>{project.project_submissions.technical_expertise}</p>
            </div>
            <div>
              <h3 className="font-semibold">Scaling Expectations</h3>
              <p>{project.project_submissions.scaling_expectation}</p>
            </div>
            <div>
              <h3 className="font-semibold">Submission Status</h3>
              <p>{project.project_submissions.status}</p>
            </div>
            <div>
              <h3 className="font-semibold">Submitted At</h3>
              <p>{new Date(project.project_submissions.created_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
