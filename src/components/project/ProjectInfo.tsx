
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import type { ProjectDetails, ProjectSubmission } from '@/types/project';

interface ProjectInfoProps {
  project: ProjectDetails;
  submission: ProjectSubmission | null;
}

export const ProjectInfo = ({ project, submission }: ProjectInfoProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-900">{project.title}</CardTitle>
        <CardDescription>
          Created {formatDistanceToNow(new Date(project.created_at))} ago
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 whitespace-pre-wrap mb-6">{project.description}</p>
        
        {submission && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-purple-800">Project Details</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <DetailItem label="Project Idea" value={submission.project_idea} />
              <DetailItem label="Core Features" value={submission.core_features} />
              <DetailItem label="Target Audience" value={submission.target_audience} />
              <DetailItem label="Problem Solved" value={submission.problem_solved} />
              <DetailItem label="Tech Stack" value={submission.tech_stack} />
              <DetailItem label="Development Timeline" value={submission.development_timeline} />
              <DetailItem label="Monetization Strategy" value={submission.monetization} />
              <DetailItem label="AI Integration" value={submission.ai_integration} />
              <DetailItem label="Technical Expertise" value={submission.technical_expertise} />
              <DetailItem label="Scaling Expectations" value={submission.scaling_expectation} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <h4 className="font-medium text-gray-700">{label}</h4>
    <p className="text-gray-600">{value}</p>
  </div>
);
