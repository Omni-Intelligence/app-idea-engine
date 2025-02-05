
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ConfirmationPageProps {
  answers: Record<string, string>;
  onSubmit: () => Promise<void>;
  onBack: () => void;
}

export const ConfirmationPage = ({ answers, onSubmit, onBack }: ConfirmationPageProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionLabels: Record<string, string> = {
    0: "Project Idea",
    1: "Target Audience",
    2: "Problem Solved",
    3: "Core Features",
    4: "AI Integration",
    5: "Monetization Strategy",
    6: "Development Timeline",
    7: "Technical Expertise",
    8: "Tech Stack",
    9: "Scaling Expectation"
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Please Review Your Answers</h2>
      <Card className="p-6">
        <div className="space-y-4">
          {Object.entries(answers).map(([key, value]) => (
            <div key={key} className="border-b pb-4 last:border-b-0">
              <h3 className="font-medium text-gray-900">{questionLabels[key]}</h3>
              <p className="mt-1 text-gray-600">{value}</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back to Questions
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Submit and Analyze'
          )}
        </Button>
      </div>
    </div>
  );
};
