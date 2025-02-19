
import { QuestionnaireResponse } from "@/types/project-details";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface QuestionnaireResponsesProps {
  responses: QuestionnaireResponse[];
}

export const QuestionnaireResponses = ({ responses }: QuestionnaireResponsesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {responses.map((response, index) => (
          <div key={index}>
            <h3 className="font-semibold">{response.question}</h3>
            <p>{response.answer || 'Not specified'}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
