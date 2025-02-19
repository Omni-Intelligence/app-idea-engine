
import { ProjectData, ProjectStatus } from "@/types/project-details";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProjectDetailsCardProps {
  project: ProjectData;
}

export const ProjectDetailsCard = ({ project }: ProjectDetailsCardProps) => {
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
  );
};
