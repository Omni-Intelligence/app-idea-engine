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
    <div className="min-h-screen bg-muted flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(254,202,40,0.10),rgba(254,202,40,0.05),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(254,202,40,0.08),rgba(254,202,40,0.03),rgba(0,0,0,0))]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            backgroundImage:
              "linear-gradient(60deg, rgba(254,202,40,0.03) 0%, rgba(254,202,40,0.03) 50%, rgba(245,182,35,0.03) 100%)",
            backgroundSize: "400% 400%",
          }}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      <section className="relative pt-4 pb-4 md:pt-8 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-sm mb-3">
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-accent" />
                <span>AI-Powered App Ideation</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Unlock the Power of
              <span className="text-accent"> Your App Ideas</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your app ideas into reality with our AI-powered assistant. Generate outlines, use industry
              templates, and manage your projects with ease.
            </p>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-center">{error}</p>
            </div>
          )}

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col border-2 border-accent relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-accent text-accent-foreground text-sm font-semibold px-6 py-2 rounded-full flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                  PRO PLAN
                </div>
              </div>
              <div className="flex items-center mb-4 justify-center">
                <Database className="h-6 w-6 text-accent mr-2" />
                <h2 className="text-xl font-bold">App Idea Engine Pro</h2>
              </div>
              <div className="mb-4 text-center">
                <p className="text-4xl font-bold mb-1 leading-none">
                  $15<span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-xs text-muted-foreground leading-tight">Billed monthly. Cancel anytime.</p>
              </div>
              <p className="text-muted-foreground mb-6 text-center text-sm leading-tight">
                Unlock all features: AI-powered ideation, detailed outlines, industry templates, and project management
                tools.
              </p>
              <ul className="space-y-2 mb-6 flex-grow">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight text-gray-600">
                    Generate detailed app outlines from your ideas
                  </span>
                </li>
                <li className="flex items-start">
                  <Database className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight text-gray-600">
                    Industry and function-specific app templates
                  </span>
                </li>
                <li className="flex items-start">
                  <BarChart4 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight text-gray-600">AI-generated project documentation</span>
                </li>
                <li className="flex items-start">
                  <Braces className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight text-gray-600">Customizable app idea inspiration</span>
                </li>
                <li className="flex items-start">
                  <Layers className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight text-gray-600">Project management dashboard</span>
                </li>
                <li className="flex items-start">
                  <Brain className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight text-gray-600">AI-powered recommendations</span>
                </li>
                <li className="flex items-start">
                  <LineChart className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight text-gray-600">Export and share your project outlines</span>
                </li>
                <li className="flex items-start">
                  <MessageSquareHeart className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-tight text-gray-600">Priority email support</span>
                </li>
              </ul>
              <Button
                className="w-full font-semibold py-2 rounded-lg text-sm bg-accent text-accent-foreground hover:bg-accent/80"
                onClick={handleSubscribe}
                disabled={loading || isSubscriptionLoading || isSubscribed}
              >
                {isSubscriptionLoading
                  ? "Checking subscription..."
                  : loading
                  ? "Processing..."
                  : isSubscribed
                  ? "Already Subscribed"
                  : "Upgrade to Pro"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 backdrop-blur-sm">
              <Database className="h-5 w-5 text-accent" />
              <span>App Templates</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 backdrop-blur-sm">
              <LineChart className="h-5 w-5 text-accent" />
              <span>AI Outlines</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 backdrop-blur-sm">
              <Code className="h-5 w-5 text-accent" />
              <span>Project Docs</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 backdrop-blur-sm">
              <Layers className="h-5 w-5 text-accent" />
              <span>Management Tools</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
