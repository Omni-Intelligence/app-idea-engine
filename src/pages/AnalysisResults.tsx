
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const AnalysisResults = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data, error } = await supabase
          .from('project_submissions')
          .select('ai_analysis')
          .eq('id', submissionId)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.ai_analysis) {
          setAnalysis(data.ai_analysis);
          setIsLoading(false);
        } else {
          // If analysis is not ready, poll every 2 seconds
          const interval = setInterval(async () => {
            const { data: updatedData, error: pollError } = await supabase
              .from('project_submissions')
              .select('ai_analysis')
              .eq('id', submissionId)
              .maybeSingle();

            if (pollError) throw pollError;

            if (updatedData?.ai_analysis) {
              setAnalysis(updatedData.ai_analysis);
              setIsLoading(false);
              clearInterval(interval);
            }
          }, 2000);

          // Cleanup interval
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        toast({
          title: "Error",
          description: "Failed to load analysis results. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    if (submissionId) {
      fetchAnalysis();
    }
  }, [submissionId, toast]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <h2 className="text-2xl font-semibold">Analyzing Your Project...</h2>
            <p className="text-gray-600">Please wait while our AI analyzes your project details.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-6">
        <h2 className="text-2xl font-semibold mb-6">Your Project Analysis</h2>
        {analysis ? (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{analysis}</div>
          </div>
        ) : (
          <p className="text-gray-600">No analysis available. Please try again later.</p>
        )}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleBackToHome}>Back to Home</Button>
        </div>
      </Card>
    </div>
  );
};

export default AnalysisResults;
