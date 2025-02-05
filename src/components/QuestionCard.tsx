import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface QuestionCardProps {
  question: string;
  placeholder: string;
  onSubmit: (answer: string) => void;
}

export const QuestionCard = ({ question, placeholder, onSubmit }: QuestionCardProps) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer('');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">{question}</h2>
        <Textarea
          placeholder={placeholder}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[120px] mb-4"
        />
        <Button onClick={handleSubmit} className="w-full">
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};