
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [idea, setIdea] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idea.trim()) {
      toast({
        title: "Error",
        description: "Please enter your app idea",
        variant: "destructive",
      });
      return;
    }

    navigate('/questionnaire', { state: { appIdea: idea } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-900 sm:text-5xl md:text-6xl">
            App Idea Engine
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-purple-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Transform your app ideas into reality with our AI-powered development assistant.
          </p>
          
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label 
                    htmlFor="idea" 
                    className="block text-sm font-medium text-gray-700 mb-2 text-left"
                  >
                    Describe your app idea
                  </label>
                  <Input
                    id="idea"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Enter your app idea here..."
                    className="h-32 py-2 resize-none"
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Submit Idea
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
