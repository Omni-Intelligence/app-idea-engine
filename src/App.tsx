
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Questionnaire from "@/pages/Questionnaire";
import QuestionnaireConfirmation from "@/pages/QuestionnaireConfirmation";
import GenerateDocuments from "@/pages/GenerateDocuments";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/questionnaire-confirmation" element={<QuestionnaireConfirmation />} />
          <Route path="/generate-documents" element={<GenerateDocuments />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:projectId" element={<ProjectDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
