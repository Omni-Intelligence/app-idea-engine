import { ProjectData, ProjectStatus } from "@/types/project-details";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon } from "lucide-react";
import MarkdownRenderer from '@/components/MarkdownRenderer.tsx';

interface ProjectDetailsCardProps {
  project: ProjectData;
}

export const ProjectDetailsCard = ({ project }: ProjectDetailsCardProps) => {
  const getStatusBadgeVariant = (status: ProjectStatus | null): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'draft':
        return 'outline';
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'archived':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="overflow-hidden border-2 shadow-md transition-all hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-poppins text-2xl font-bold">{project.title}</CardTitle>
          <Badge variant={getStatusBadgeVariant(project.status)} className="text-sm">
            {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'No Status'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="rounded-lg bg-muted/30 p-4">
          <h3 className="mb-2 font-poppins text-sm font-semibold uppercase text-muted-foreground">Description</h3>
          <div className="prose prose-sm max-w-none">
            <MarkdownRenderer content={project.description || 'No description provided'} />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3 border-t bg-muted/10 px-6 py-4 text-sm sm:flex-row sm:justify-between sm:space-y-0">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Created: </span>
          <span className="font-medium">{new Date(project.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Last updated: </span>
          <span className="font-medium">{new Date(project.updated_at).toLocaleDateString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
