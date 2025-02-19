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
import { Lightbulb, FileText } from "lucide-react";

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

  const getTemplatesForSelection = () => {
    if (!selectedIndustry && !selectedFunction) return null;

    const templates = appTemplates[selectedIndustry as keyof typeof appTemplates] || [];
    return (
      <div className="mt-4 space-y-2">
        <h3 className="font-medium text-purple-900">Suggested App Ideas:</h3>
        <ul className="space-y-2">
          {templates.map((template, index) => (
            <li key={index} className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors"
                onClick={() => setIdea(template)}>
              {template}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-white">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-900 sm:text-5xl md:text-6xl mb-8">
            App Idea Engine
          </h1>
          <p className="mt-6 max-w-md mx-auto text-base text-purple-600 sm:text-lg md:text-xl md:max-w-3xl mb-12">
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
                  <Textarea
                    id="idea"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe your app idea here..."
                    className="min-h-[150px] text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button 
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 w-full sm:w-1/2"
                  >
                    Submit Idea
                  </Button>
                  <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Lightbulb className="w-4 h-4" />
                          Need inspiration?
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
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

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-2"
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
                                className="p-4 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setIdea(`I want to build a ${template.toLowerCase()} that...`);
                                }}
                              >
                                <h3 className="font-medium text-purple-900 mb-2">{template}</h3>
                                <p className="text-sm text-gray-600">Click to use this template as a starting point.</p>
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

      <footer className="bg-white border-t border-gray-200 mt-auto">
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
      </footer>
    </div>
  );
};

export default Index;
