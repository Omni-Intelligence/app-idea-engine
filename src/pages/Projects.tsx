import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Search, Edit, View } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import debounce from 'lodash/debounce';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, [debouncedSearchQuery, currentPage, pageSize]);

  const fetchProjects = async () => {
    try {
      let query = supabase
        .from('user_projects')
        .select('*', { count: 'exact' });

      if (debouncedSearchQuery) {
        query = query.ilike('title', `%${debouncedSearchQuery}%`);
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setProjects(data as Project[]);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil(count / pageSize));
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

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setCurrentPage(1);
      setDebouncedSearchQuery(value);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-primary">My Projects</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold ">My Projects</h1>
        <Button onClick={() => navigate('/')} size="lg" variant="secondary">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {projects.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-base text-muted-foreground mb-4">You haven't created any projects yet</p>
            <Button onClick={() => navigate('/')} size="lg">
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  {/* <TableHead>Description</TableHead> */}
                  <TableHead className="w-[100px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer hover:bg-muted/50 "
                  >
                    <TableCell className="">
                      <p className="text-lg font-medium mb-4">
                        {project.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description || 'No description provided'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {formatDistanceToNow(new Date(project.created_at))} ago
                      </p>
                    </TableCell>

                    <TableCell className=" h-full" >
                      <div className="flex gap-2 items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50/30 rounded-full"
                          onClick={(e) => handleDeleteProject(e, project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => handleProjectClick(project)}
                        >
                          Review
                        </Button>
                      </div>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Projects;
