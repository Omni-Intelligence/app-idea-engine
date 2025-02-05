import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Option {
  value: string;
  label: string;
}

interface QuestionCardProps {
  question: string;
  placeholder: string;
  options?: Option[];
  onSubmit: (answer: string) => void;
}

export const QuestionCard = ({ question, placeholder, options = [], onSubmit }: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleSubmit = () => {
    const answer = isCustom ? customAnswer : selectedOption;
    if (answer.trim()) {
      onSubmit(answer);
      setSelectedOption('');
      setCustomAnswer('');
      setIsCustom(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-semibold mb-6">{question}</h2>
        
        <RadioGroup
          className="gap-4 mb-6"
          value={isCustom ? 'custom' : selectedOption}
          onValueChange={(value) => {
            if (value === 'custom') {
              setIsCustom(true);
              setSelectedOption('');
            } else {
              setIsCustom(false);
              setSelectedOption(value);
            }
          }}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="text-lg cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="text-lg cursor-pointer">
              Custom Answer
            </Label>
          </div>
        </RadioGroup>

        {isCustom && (
          <Textarea
            placeholder={placeholder}
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            className="min-h-[120px] mb-4"
          />
        )}

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={(!isCustom && !selectedOption) || (isCustom && !customAnswer.trim())}
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};