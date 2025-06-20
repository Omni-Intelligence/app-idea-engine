import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);

  const [newUserCreated, setNewUserCreated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (hasVerified) return;

    const verifySubscription = async () => {
      try {
        console.log("Verifying subscription for user:", user?.email, "Session ID:", sessionId);

        const { data, error } = await supabase.functions.invoke("stripe-subscriptions", {
          body: {
            action: "verifyAndSyncSubscription",
            sessionId,
            userEmail: user?.email,
            userId: user?.id,
          },
        });

        if (error) throw error;

        if (data.newUserCreated && !user) {
          setNewUserCreated(true);
          setUserEmail(data.userEmail);

          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: data.userEmail,
            password: "new-user",
          });

          if (signInError) {
            console.error("Auto sign-in error:", signInError);
            toast({
              title: "Sign-in Error",
              description: "Unable to sign in automatically. Please try signing in manually.",
              variant: "destructive",
            });
          }
        }

        if (data.success) {
          setVerificationSuccess(true);
          queryClient.invalidateQueries({ queryKey: ["subscription"] });

          toast({
            title: "Subscription Verified",
            description: "Your subscription has been successfully activated.",
          });
        } else {
          toast({
            title: "Verification Failed",
            description: "Unable to verify your subscription. Please contact support.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Subscription verification error:", error);
        toast({
          title: "Verification Error",
          description: "An error occurred while verifying your subscription.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
        setHasVerified(true);
      }
    };

    verifySubscription();
  }, [sessionId, hasVerified]);

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });

      setNewUserCreated(false);
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Password Update Failed",
        description: "Unable to update your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleContinue = () => {
    navigate("/projects");
  };

  const handleCheckSubscription = () => {
    navigate("/profile");
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-accent" />
          <p className="text-lg text-gray-700">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-muted p-4 pt-20">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                verificationSuccess ? "bg-accent" : "bg-primary"
              }`}
            >
              <CheckCircle className="h-12 w-12 text-accent-foreground" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className={`text-3xl font-bold ${verificationSuccess ? "text-accent" : "text-primary"}`}>
              {verificationSuccess ? "Payment Successful!" : "Payment Received"}
            </h1>
            <p className="text-lg text-gray-700">
              {verificationSuccess
                ? "You can now unlock the full power of your Power BI data analysis."
                : "We received your payment and are processing your subscription."}
            </p>
          </div>
        </div>

        {newUserCreated && (
          <div className="bg-accent/10 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-accent/20 space-y-4">
            <h3 className="text-lg font-semibold text-accent">Account Created</h3>
            <p className="text-accent text-sm">
              We've created an account for you with email: <strong>{userEmail}</strong>
            </p>
            <p className="text-accent text-sm mb-4">Please set up a secure password to continue.</p>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={handlePasswordUpdate}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/80"
                disabled={!newPassword || newPassword.length < 6 || isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating Password...
                  </>
                ) : (
                  "Set Password"
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/20">
          <p className="text-gray-600 mb-6">
            {verificationSuccess
              ? "Start analyzing your Power BI metadata with AI-generated SQL models, DAX formulas, and M code insights."
              : "Your subscription will be activated shortly. You can check your subscription status or try accessing your projects."}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleContinue}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/80"
              disabled={newUserCreated}
            >
              Start Creating
            </Button>
            <Button onClick={handleCheckSubscription} variant="outline" className="flex-1" disabled={newUserCreated}>
              Check My Subscription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
