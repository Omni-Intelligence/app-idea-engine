
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuestionStore } from '@/store/questionStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Lightbulb, Sparkles } from 'lucide-react';

const Ideation = () => {
  const [dailyTasks, setDailyTasks] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState('');
  const navigate = useNavigate();
  const { setAnswer, reset } = useQuestionStore();
  const { toast } = useToast();

  const handleGenerateIdea = async () => {
    if (!dailyTasks.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your daily tasks first.",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to generate project ideas.",
      });
      navigate('/auth');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-idea', {
        body: { dailyTasks },
      });

      if (error) throw error;
      
      setGeneratedIdea(data.generatedText);
    } catch (error) {
      console.error('Error generating idea:', error);
      toast({
        title: "Error",
        description: "Failed to generate project idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseIdea = () => {
    if (generatedIdea) {
      reset();
      setAnswer(0, generatedIdea);
      navigate('/questionnaire');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-white">
      <div className="w-full max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 text-transparent bg-clip-text mb-4">
            Let's Find Your Next Project
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about your daily tasks and challenges, and we'll help you discover opportunities for innovation.
          </p>
        </div>

        <Card className="glass-card p-6 md:p-8 mb-6">
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              What tasks do you handle in your daily work?
            </label>
            <Textarea
              placeholder="Describe your typical workday, tasks you frequently do, or challenges you face..."
              value={dailyTasks}
              onChange={(e) => setDailyTasks(e.target.value)}
              className="min-h-[150px] text-lg bg-white/80 border-purple-100 focus:border-purple-300 focus:ring-purple-500"
            />
          </div>
          <Button
            onClick={handleGenerateIdea}
            disabled={isGenerating || !dailyTasks.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Lightbulb className="w-5 h-5" />
                Generate Project Ideas
              </>
            )}
          </Button>
        </Card>

        {generatedIdea && (
          <Card className="glass-card p-6 md:p-8">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">
              Here's a Project Idea for You:
            </h3>
            <p className="text-lg text-gray-700 mb-6 whitespace-pre-wrap">
              {generatedIdea}
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleUseIdea}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-300"
              >
                Use This Idea
              </Button>
              <Button
                onClick={handleGenerateIdea}
                variant="outline"
                className="flex-1 border-purple-200 hover:bg-purple-50 text-purple-700 px-8 py-6 text-lg rounded-full"
              >
                Generate Another
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Ideation;
