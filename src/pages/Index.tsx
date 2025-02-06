import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuestionStore } from '@/store/questionStore';
import { ArrowRight, Lightbulb } from 'lucide-react';

const Index = () => {
  const { answers } = useQuestionStore();
  const [idea, setIdea] = useState('');
  const navigate = useNavigate();
  const { setAnswer, reset } = useQuestionStore();

  // Set the idea from the store when component mounts
  useEffect(() => {
    const storedAnswer = answers[0];
    if (storedAnswer) {
      setIdea(Array.isArray(storedAnswer) ? storedAnswer.join(', ') : storedAnswer);
    }
  }, [answers]);

  const handleSubmit = () => {
    if (idea.trim()) {
      reset();
      setAnswer(0, idea);
      navigate('/questionnaire');
    }
  };

  const features = [
    { number: '01', label: 'Ideate' },
    { number: '02', label: 'Build' },
    { number: '03', label: 'Scale' },
    { number: '04', label: 'Launch' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-white">
      <div className="w-full max-w-4xl text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 text-transparent bg-clip-text">
          Transform Your Ideas
          <br />
          Into Reality
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Start your journey from concept to creation. Let AI guide you through 
          building your next successful project.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-purple-100/50 backdrop-blur-sm px-6 py-3 rounded-full"
            >
              <span className="text-purple-600 mr-2">{feature.number}</span>
              <span className="text-gray-700">{feature.label}</span>
            </div>
          ))}
        </div>

        <Card className="glass-card p-6 md:p-8">
          <Textarea
            placeholder="Share your project idea..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="min-h-[120px] mb-6 text-lg bg-white/80 border-purple-100 focus:border-purple-300 focus:ring-purple-500"
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 flex items-center gap-2"
            >
              Start Building
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/projects')}
              className="px-8 py-6 text-lg rounded-full border-purple-200 hover:bg-purple-50 text-purple-700"
            >
              View Projects
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/ideation')}
              className="px-8 py-6 text-lg rounded-full border-purple-200 hover:bg-purple-50 text-purple-700 flex items-center gap-2"
            >
              <Lightbulb className="w-5 h-5" />
              Don't know what to build?
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
