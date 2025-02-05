
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ConfirmationPageProps {
  answers: Record<string, string>;
  onSubmit: () => Promise<string>;
  onBack: () => void;
}

export const ConfirmationPage = ({ answers, onSubmit, onBack }: ConfirmationPageProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submissionId = await onSubmit();
      return submissionId;
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
    initial: "Initial Project Idea",
    0: "Project Type",
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#9b87f5] to-[#7E69AB]">
        Please Review Your Answers
      </h2>
      <Card className="p-8 glass-card shadow-lg border border-purple-100">
        <div className="space-y-6">
          {/* Initial project idea from homepage */}
          <div className="border-b border-purple-100/50 pb-6">
            <h3 className="font-medium text-lg text-[#1A1F2C] mb-2">{questionLabels.initial}</h3>
            <p className="text-gray-600 leading-relaxed">{answers.initial}</p>
          </div>
          {/* Questionnaire answers */}
          {Object.entries(answers).filter(([key]) => key !== 'initial').map(([key, value]) => (
            <div key={key} className="border-b border-purple-100/50 pb-6 last:border-b-0">
              <h3 className="font-medium text-lg text-[#1A1F2C] mb-2">{questionLabels[key]}</h3>
              <p className="text-gray-600 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="flex justify-between mt-8 gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-8 py-6 text-base border-purple-200 hover:bg-purple-50 text-purple-700"
        >
          Back to Questions
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-6 text-base bg-[#9b87f5] hover:bg-[#9b87f5]/90 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
