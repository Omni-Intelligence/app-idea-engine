import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  project_idea: string | null;
  user_id: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data as Project[]);
    } catch (error: unknown) {
      toast({
        title: "Error fetching projects",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/project/${project.id}`);
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent triggering the card click

    try {
      const { error } = await supabase
        .from('user_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      setProjects(projects.filter(project => project.id !== projectId));

      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error deleting project",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4  min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-primary">My Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card">
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">My Projects</h1>
        <Button onClick={() => navigate('/')} size="lg" >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground mb-4">You haven't created any projects yet</p>
            <Button onClick={() => navigate('/')} className="primary-button">
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="glass-card cursor-pointer group  transition-all duration-300 relative overflow-hidden border-none flex flex-col"
              onClick={() => handleProjectClick(project)}
            >
              {/* <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
              <CardHeader>
                <CardTitle className="text-xl  text-primary font-semibold">
                  {project.title}
                </CardTitle>
              </CardHeader>

              <CardContent className='flex-1'>
                <CardDescription className="text-gray-500 mt-2 line-clamp-2">
                  {project.description || 'No description provided'}
                </CardDescription>

              </CardContent>

              <CardFooter>
                <div className="w-full flex items-center justify-between gap-2 -mb-4">
                  <div className="flex-1 flex items-center gap-2 text-sm text-gray-400">
                    <div className="size-2 rounded-full bg-purple-500/50" />
                    Created {formatDistanceToNow(new Date(project.created_at))} ago
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className=" text-gray-400 hover:text-red-500 hover:bg-red-50/30 rounded-full transform transition-all duration-300 hover:rotate-12"
                    onClick={(e) => handleDeleteProject(e, project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
