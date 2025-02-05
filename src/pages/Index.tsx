import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuestionStore } from '@/store/questionStore';

const Index = () => {
  const [idea, setIdea] = useState('');
  const navigate = useNavigate();
  const { setAnswer } = useQuestionStore();

  const handleSubmit = () => {
    if (idea.trim()) {
      setAnswer(0, idea);
      navigate('/questionnaire');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <h1 className="text-3xl font-bold text-center mb-6">
            What do you want to build today?
          </h1>
          <Textarea
            placeholder="Share your app idea..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="min-h-[120px] mb-4"
          />
          <Button onClick={handleSubmit} className="w-full">
            Let's explore your idea
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;