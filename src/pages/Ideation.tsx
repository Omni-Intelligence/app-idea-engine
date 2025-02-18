
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Ideation = () => {
  const [idea, setIdea] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

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

    // For now, we'll just show a success message
    toast({
      title: "Success!",
      description: "Your idea has been received.",
    });
    
    // Clear the form
    setIdea("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-6">
            Share Your App Idea
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="idea" 
                className="block text-sm font-medium text-gray-700 mb-2"
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
  );
};

export default Ideation;
