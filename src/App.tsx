import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import AccessDetails from "@/pages/AccessDetails";
import Auth from "@/pages/Auth";
import GenerateDocuments from "@/pages/GenerateDocuments";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ProjectDetails from "@/pages/ProjectDetails";
import Projects from "@/pages/Projects";
import Questionnaire from "@/pages/Questionnaire";
import QuestionnaireConfirmation from "@/pages/QuestionnaireConfirmation";
import { ResetPassword } from "@/pages/ResetPassword";
import { UpdatePassword } from "@/pages/UpdatePassword";
import AutoSSO from "./components/AutoSSO";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { UserProvider } from "./contexts/UserContext";
import PaymentSuccess from "./pages/PaymentSuccess";
import PricingPage from "./pages/PricingPage";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <SubscriptionProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <AutoSSO />
              <Navbar />
              <main className="flex-1 bg-gray-50">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  {/* <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/access-details" element={<AccessDetails />} /> */}

                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Routes>
                          <Route path="profile" element={<Profile />} />
                          <Route path="/questionnaire" element={<Questionnaire />} />
                          <Route path="/questionnaire-confirmation" element={<QuestionnaireConfirmation />} />
                          <Route path="/generate-documents" element={<GenerateDocuments />} />
                          <Route path="/projects" element={<Projects />} />
                          <Route path="/project/:projectId" element={<ProjectDetails />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </ProtectedRoute>
                    }
                  />
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
