import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Database,
  BarChart4,
  Braces,
  Sparkles,
  LineChart,
  Code,
  Layers,
  Brain,
  MessageSquareHeart,
} from "lucide-react";
import { Footer } from "@/components/Footer";

const PricingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const { subscription, isLoading: isSubscriptionLoading, isSubscribed } = useSubscription();

  const handleSubscribe = useCallback(async () => {
    if (isSubscribed) {
      setError("You already have an active subscription");
      return;
    }

    setLoading(true);
    setError(null);

    const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!STRIPE_PK) {
      setError("Stripe is not configured correctly");
      setLoading(false);
      return;
    }

    try {
      const { data: checkoutSession, error: checkoutError } = await supabase.functions.invoke(
        "stripe-checkout-session",
        {
          body: {
            email: user?.email || null,
            userId: user?.id || null,
            customerId: subscription?.customer_id || null,
          },
        }
      );

      if (checkoutError) throw new Error(checkoutError.message);
      if (!checkoutSession?.sessionId) throw new Error("Failed to create checkout session");

      const stripe = await loadStripe(STRIPE_PK);
      if (!stripe) throw new Error("Stripe failed to load");

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: checkoutSession.sessionId,
      });

      if (stripeError) throw new Error(stripeError.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [user, isSubscribed, subscription]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(109,66,239,0.15),rgba(232,67,147,0.08),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(109,66,239,0.1),rgba(232,67,147,0.05),rgba(0,0,0,0))]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            backgroundImage:
              "linear-gradient(60deg, rgba(109,66,239,0.03) 0%, rgba(232,67,147,0.03) 50%, rgba(245,182,35,0.03) 100%)",
            backgroundSize: "400% 400%",
          }}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      <section className="relative pt-4 pb-4 md:pt-8 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-3">
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Analytics</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Unlock the Power of
              <span className="text-primary"> Your Data</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your Power BI metadata into actionable insights with AI-generated models, formulas, and code
            </p>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-center">{error}</p>
            </div>
          )}

          <div className="max-w-md mx-auto">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2 rounded-full flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  PRO PLAN
                </div>
              </div>

              <div className="flex items-center mb-4 justify-center">
                <Database className="h-6 w-6 text-primary mr-2" />
                <h2 className="text-xl font-bold">Power Vibes Pro</h2>
              </div>

              <div className="mb-4 text-center">
                <p className="text-4xl font-bold mb-1 leading-none">
                  $15<span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-xs text-muted-foreground leading-tight">Billed monthly. Cancel anytime.</p>
              </div>

              <p className="text-muted-foreground mb-6 text-center text-sm leading-tight">
                Complete access to AI-powered Power BI analytics and code generation
              </p>

              <ul className="space-y-2 mb-6 flex-grow">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight">Upload Power BI metadata (.bim files)</span>
                </li>
                <li className="flex items-start">
                  <Database className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight">AI-generated SQL data models</span>
                </li>
                <li className="flex items-start">
                  <BarChart4 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight">Extract and optimize DAX formulas</span>
                </li>
                <li className="flex items-start">
                  <Braces className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight">M code analysis and extraction</span>
                </li>
                <li className="flex items-start">
                  <Layers className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight">Complete metadata analysis</span>
                </li>
                <li className="flex items-start">
                  <Brain className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight">AI-powered insights and recommendations</span>
                </li>
                <li className="flex items-start">
                  <LineChart className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight">Performance optimization suggestions</span>
                </li>
                <li className="flex items-start">
                  <MessageSquareHeart className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight">Email support</span>
                </li>
              </ul>

              <Button
                className="w-full font-semibold py-2 rounded-lg text-sm"
                onClick={handleSubscribe}
                disabled={loading || isSubscriptionLoading || isSubscribed}
              >
                {isSubscriptionLoading
                  ? "Checking subscription..."
                  : loading
                  ? "Processing..."
                  : isSubscribed
                  ? "Already Subscribed"
                  : "Start Your Analytics Journey"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 backdrop-blur-sm">
              <Database className="h-5 w-5 text-primary" />
              <span>SQL Models</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 backdrop-blur-sm">
              <LineChart className="h-5 w-5 text-primary" />
              <span>DAX Formulas</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 backdrop-blur-sm">
              <Code className="h-5 w-5 text-primary" />
              <span>M Code</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 backdrop-blur-sm">
              <Layers className="h-5 w-5 text-primary" />
              <span>Metadata Analysis</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
