import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Questionnaire from "@/pages/Questionnaire";
import QuestionnaireConfirmation from "@/pages/QuestionnaireConfirmation";
import GenerateDocuments from "@/pages/GenerateDocuments";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AccessDetails from "@/pages/AccessDetails";
import { ResetPassword } from "@/pages/ResetPassword";
import { UpdatePassword } from "@/pages/UpdatePassword";
import PricingPage from "./pages/PricingPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import { UserProvider } from "./contexts/UserContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <SubscriptionProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 bg-gray-50">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/questionnaire" element={<Questionnaire />} />
                  <Route path="/questionnaire-confirmation" element={<QuestionnaireConfirmation />} />
                  <Route path="/generate-documents" element={<GenerateDocuments />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/project/:projectId" element={<ProjectDetails />} />
                  <Route path="/access-details" element={<AccessDetails />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster />
          </Router>
        </SubscriptionProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
