
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h1>Project Details</h1>
      <p>Project ID: {projectId}</p>
    </div>
  );
};

export default ProjectDetailsPage;
