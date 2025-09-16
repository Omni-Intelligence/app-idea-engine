import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ExternalLink, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEdnaMembership } from "@/hooks/useEdnaMembership";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  // const { subscription } = useSubscription();
  const { checkMembershipAndRedirect, loading: membershipLoading } = useEdnaMembership();
  const navigate = useNavigate();

  const handleEdnaLearnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    checkMembershipAndRedirect();
  };

  // const handleBillingPortal = async () => {
  //   setBillingLoading(true);
  //   try {
  //     if (!subscription?.customer_id) {
  //       toast.error("You don't have an active subscription yet. Please subscribe first to manage billing.");
  //       return;
  //     }

  //     console.log("Customer ID for billing portal:", subscription.customer_id);

  //     const { data: portalData, error: portalError } = await supabase.functions.invoke("stripe-billing-portal", {
  //       body: { customerId: subscription.customer_id },
  //     });

  //     if (portalError) {
  //       throw portalError;
  //     }

  //     if (portalData?.portalUrl) {
  //       window.open(portalData.portalUrl, "_blank");
  //     } else {
  //       throw new Error("No portal URL received");
  //     }
  //   } catch (error) {
  //     console.error("Error opening billing portal:", error);
  //     toast.error("Failed to open billing portal. Please try again.");
  //   } finally {
  //     setBillingLoading(false);
  //   }
  // };

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user as UserProfile);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  };

  const getInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No user data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{getUserDisplayName()}</h3>
                <p className="text-muted-foreground">Account holder</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member since</p>
                  <p className="text-sm text-muted-foreground">{formatJoinDate(user.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing & Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Manage Billing</h4>
                <p className="text-sm text-muted-foreground">
                  View invoices, update payment methods, and manage your subscription
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleBillingPortal}
                disabled={billingLoading || !subscription?.customer_id}
              >
                {billingLoading ? "Opening..." : "Manage Billing"}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Subscription</h4>
                  <p className="text-sm text-muted-foreground">View our subscription plan details</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/pricing")}>
                  View Plan
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Enterprise DNA Ecosystem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">EDNA Learn</h4>
                <p className="text-sm text-muted-foreground">Access our learning platform and courses</p>
              </div>
              <Button variant="outline" onClick={handleEdnaLearnClick} disabled={membershipLoading}>
                {membershipLoading ? "Checking..." : "Open EDNA Learn"}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
