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
    <Card className="w-full max-w-5xl mx-auto">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 text-center">{question}</h2>
        
        <RadioGroup
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8"
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
            <div
              key={option.value}
              className={`p-4 md:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 min-h-[100px] flex items-center justify-center ${
                selectedOption === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={option.value} id={option.value} className="hidden" />
              <Label
                htmlFor={option.value}
                className="text-lg md:text-xl cursor-pointer flex items-center justify-center h-full text-center"
              >
                {option.label}
              </Label>
            </div>
          ))}
          <div
            className={`p-4 md:p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 min-h-[100px] flex items-center justify-center ${
              isCustom ? 'border-primary bg-primary/5 col-span-full' : 'border-border hover:border-primary/50 col-span-full'
            }`}
          >
            <RadioGroupItem value="custom" id="custom" className="hidden" />
            <Label
              htmlFor="custom"
              className="text-lg md:text-xl cursor-pointer flex items-center justify-center h-full text-center"
            >
              Custom Answer
            </Label>
          </div>
        </RadioGroup>

        {isCustom && (
          <Textarea
            placeholder={placeholder}
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            className="min-h-[120px] mb-6 text-base md:text-lg p-4"
          />
        )}

        <Button 
          onClick={handleSubmit} 
          className="w-full py-4 md:py-6 text-base md:text-lg"
          disabled={(!isCustom && !selectedOption) || (isCustom && !customAnswer.trim())}
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};