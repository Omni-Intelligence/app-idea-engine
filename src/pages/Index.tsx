
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuestionStore } from '@/store/questionStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const [idea, setIdea] = useState('');
  const navigate = useNavigate();
  const { setAnswer, reset } = useQuestionStore();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (idea.trim()) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Sign in required",
          description: "Please sign in to continue with your idea exploration.",
        });
        navigate('/auth');
        return;
      }

      reset();
      setAnswer(0, idea);
      navigate('/questionnaire');
    }
  };

  const steps = [
    { number: '[0]', label: 'Create' },
    { number: '[1]', label: 'Organize' },
    { number: '[2]', label: 'Chain' },
    { number: '[3]', label: 'Share' },
    { number: '[4]', label: 'Iterate' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-white">
      <div className="w-full max-w-4xl text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 text-transparent bg-clip-text">
          Your App Ideas,
          <br />
          Perfectly Engineered
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Create, organize, and build powerful applications. Boost your productivity
          with our intuitive app development platform.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-purple-100/50 backdrop-blur-sm px-6 py-3 rounded-full"
            >
              <span className="text-purple-600 mr-2">{step.number}</span>
              <span className="text-gray-700">{step.label}</span>
            </div>
          ))}
        </div>

        <Card className="bg-white/50 backdrop-blur-sm border-purple-100 p-6 md:p-8">
          <Textarea
            placeholder="Share your app idea..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="min-h-[120px] mb-6 text-lg bg-white/80 border-purple-100 focus:border-purple-300 focus:ring-purple-500"
          />
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 flex items-center gap-2"
            >
              Let's Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/projects')}
              className="px-8 py-6 text-lg rounded-full border-purple-200 hover:bg-purple-50 text-purple-700"
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
