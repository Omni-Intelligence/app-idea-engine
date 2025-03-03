import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const industries = [
  "Healthcare",
  "Education",
  "Finance",
  "Retail",
  "Manufacturing",
  "Technology",
  "Real Estate",
  "Transportation",
  "Hospitality",
];

const businessFunctions = [
  "Sales",
  "Marketing",
  "Human Resources",
  "Operations",
  "Customer Service",
  "Finance",
  "IT",
  "Research & Development",
];

const appTemplates = {
  "Healthcare": [
    "Patient Appointment Scheduler",
    "Medical Records Management",
    "Telemedicine Platform",
  ],
  "Education": [
    "Learning Management System",
    "Student Progress Tracker",
    "Virtual Classroom Platform",
  ],
  // ... add more templates for other industries
};

const Index = () => {
  const [idea, setIdea] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idea.trim()) {
      toast({
        title: "Error",
        description: "Please enter your app idea",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate title from description
      const { data: titleData, error: titleError } = await supabase.functions.invoke('generate-title', {
        body: { description: idea },
      });

      if (titleError) throw titleError;
      if (!titleData?.title) throw new Error('Failed to generate title');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to save your project",
          variant: "destructive",
        });
        return;
      }

      // Save to user_projects
      const { data: project, error: projectError } = await supabase
        .from('user_projects')
        .insert({
          title: titleData.title,
          description: idea,
          project_idea: idea,
          user_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      toast({
        title: "Success",
        description: "Your project has been saved!",
      });

      // Navigate to questionnaire with the project data
      navigate('/questionnaire', {
        state: {
          appIdea: idea,
          projectId: project.id
        }
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to save your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAppIdeas = async () => {
    if (!selectedIndustry || !selectedFunction) {
      toast({
        title: "Selection Required",
        description: "Please select both an industry and a business function.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingIdeas(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-app-ideas', {
        body: {
          industry: selectedIndustry,
          businessFunction: selectedFunction,
        },
      });

      if (error) throw error;

      if (data?.ideas) {
        setGeneratedIdeas(data.ideas);
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Error",
        description: "Failed to generate ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const generateOutlineFromTemplate = async (template: string) => {
    setIsGenerating(true);
    setInspirationOpen(false);
    setTemplatesOpen(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-app-outline', {
        body: {
          template,
          industry: selectedIndustry,
          businessFunction: selectedFunction,
        },
      });

      if (error) throw error;

      if (data?.outline) {
        setIdea(data.outline);
        toast({
          title: "Success",
          description: "Generated app outline from template!\n Feel free to modify it.",
          variant: "success",
        });
      }
    } catch (error) {
      console.error('Error generating outline:', error);
      toast({
        title: "Error",
        description: "Failed to generate outline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getTemplatesForSelection = () => {
    if (!selectedIndustry && !selectedFunction) return null;

    return (
      <div className="mt-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-primary">Generate Custom Ideas</h3>
          <Button
            size="sm"
            onClick={generateAppIdeas}
            disabled={isGeneratingIdeas || !selectedIndustry || !selectedFunction}
          >
            {isGeneratingIdeas ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              "Generate Ideas"
            )}
          </Button>
        </div>

        {isGeneratingIdeas ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : generatedIdeas.length > 0 ? (
          <ul className="space-y-2">
            {generatedIdeas.map((idea, index) => (
              <li
                key={index}
                className="p-3 text-sm bg-primary/10 rounded-lg hover:bg-primary/20 cursor-pointer transition-colors"
                onClick={() => generateOutlineFromTemplate(idea)}
              >
                {idea}
              </li>
            ))}
          </ul>
        ) : null}

        {appTemplates[selectedIndustry as keyof typeof appTemplates] && (
          <div className="mt-6 border-t pt-2">
            <h3 className="font-medium  mb-2">Pre-made Templates:</h3>
            <ul className="space-y-2">
              {appTemplates[selectedIndustry as keyof typeof appTemplates].map((template, index) => (
                <li
                  key={index}
                  className="p-3 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 cursor-pointer transition-colors"
                  onClick={() => generateOutlineFromTemplate(template)}
                >
                  {template}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className=" flex flex-col ">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl mb-8">
            App Idea Engine
          </h1>
          <p className="mt-6 max-w-md mx-auto text-base text-primary sm:text-lg md:text-xl md:max-w-3xl mb-12">
            Transform your app ideas into reality with our AI-powered development assistant.
          </p>

          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="idea"
                    className="block text-lg font-medium text-gray-700 mb-2 text-left"
                  >
                    What do you want to build?
                  </label>
                  <p className="text-sm text-gray-600 mb-4 text-left">
                    Please be as detailed as possible about all the key aspects of your application.
                    The more specific you are, the more useful the documents will be for outlining your app.
                  </p>
                  <div className="relative">
                    <Textarea
                      id="idea"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Describe your app idea here..."
                      className="min-h-[250px] text-base"
                      disabled={isGenerating}
                    />
                    {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
                        <div className="flex items-center space-x-2 text-purple-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-sm font-medium">Generating outline...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button
                    type="submit"
                    className=" w-full sm:w-1/2"
                    disabled={isGenerating}
                  >
                    Submit Idea
                  </Button>
                  <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                    <Dialog open={inspirationOpen} onOpenChange={setInspirationOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-2"
                          disabled={isGenerating}
                        >
                          <Lightbulb className="w-4 h-4" />
                          Need inspiration?
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Find App Ideas</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Select Industry</label>
                            <Select
                              value={selectedIndustry}
                              onValueChange={setSelectedIndustry}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose an industry" />
                              </SelectTrigger>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry} value={industry}>
                                    {industry}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Select Business Function</label>
                            <Select
                              value={selectedFunction}
                              onValueChange={setSelectedFunction}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a function" />
                              </SelectTrigger>
                              <SelectContent>
                                {businessFunctions.map((func) => (
                                  <SelectItem key={func} value={func}>
                                    {func}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {getTemplatesForSelection()}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-2"
                          disabled={isGenerating}
                        >
                          <FileText className="w-4 h-4" />
                          Templates
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>App Templates</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {["E-commerce Platform", "Project Management Tool", "Social Media App", "Fitness Tracking App"].map((template) => (
                              <div
                                key={template}
                                className="p-4 border rounded-lg hover:bg-primary/10 cursor-pointer transition-colors"
                                onClick={() => generateOutlineFromTemplate(template)}
                              >
                                <h3 className="font-semibold text-primary mb-2">{template}</h3>
                                <p className="text-sm text-gray-600">Click to generate a detailed outline.</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-semibold text-purple-900">App Idea Engine</span>
            </div>
            <a
              href="#"
              className="text-purple-600 hover:text-purple-700 font-medium"
              onClick={(e) => {
                e.preventDefault();
                // Add logic to show "Why is this free?" dialog or navigate to the page
              }}
            >
              Why is this free?
            </a>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default Index;
