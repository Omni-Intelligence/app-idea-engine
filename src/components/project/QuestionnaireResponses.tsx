import { QuestionnaireResponse } from "@/types/project-details";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface QuestionnaireResponsesProps {
  responses: QuestionnaireResponse[];
}

export const QuestionnaireResponses = ({ responses }: QuestionnaireResponsesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {responses.map((response, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {response.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600 text-sm">{response.answer || 'Not specified'}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
