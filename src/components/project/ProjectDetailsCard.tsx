import { ProjectData, ProjectStatus } from "@/types/project-details";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, FileTextIcon, UserIcon } from "lucide-react";
import MarkdownRenderer from '@/components/MarkdownRenderer.tsx';

interface ProjectDetailsCardProps {
  project: ProjectData;
  children?: React.ReactNode;
}

export const ProjectDetailsCard = ({ project, children }: ProjectDetailsCardProps) => {
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
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="font-poppins text-xl font-semibold text-gray-900">{project.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <UserIcon className="h-4 w-4" />
              <span>Project ID: {project.id}</span>
            </div>
          </div>
          <div className="">
            {children}
          </div>

        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5 text-gray-400" />
            <h3 className="font-poppins text-sm font-medium text-gray-700">Project Description</h3>
          </div>
          <div className="prose prose-sm max-w-none text-gray-600">
            <MarkdownRenderer content={project.description || 'No description provided'} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span>Created: </span>
            <span className="font-medium text-gray-900">{new Date(project.created_at).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span>Last updated: </span>
            <span className="font-medium text-gray-900">{new Date(project.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-gray-500">
            Last modified {new Date(project.updated_at).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Version 1.0
            </Badge>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
