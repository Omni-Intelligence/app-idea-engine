import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Github, Mail } from "lucide-react";

interface AuthProps {
  onSuccess?: (user?: any) => void;
  flatCard?: boolean;
  additionalText?: string;
  titleSingIn?: string;
  titleSignUp?: string;
}

export const Auth = ({ onSuccess, flatCard, additionalText, titleSingIn, titleSignUp }: AuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<{ google: boolean; github: boolean }>({
    google: true,
    github: true
  });
  const { toast } = useToast();

  // const checkAvailableProviders = async () => {
  //   try {
  //     const { data: googleData } = await supabase.auth.signInWithOAuth({
  //       provider: 'google',
  //       options: {
  //         redirectTo: window.location.origin,
  //         skipBrowserRedirect: true
  //       }
  //     });
  //     const { data: githubData } = await supabase.auth.signInWithOAuth({
  //       provider: 'github',
  //       options: {
  //         redirectTo: window.location.origin,
  //         skipBrowserRedirect: true
  //       }
  //     });
  //     setAvailableProviders({
  //       google: !!googleData?.url,
  //       github: !!githubData?.url
  //     });
  //   } catch (error) {
  //     console.error('Error checking providers:', error);
  //     setAvailableProviders({
  //       google: false,
  //       github: false
  //     });
  //   }
  // };

  // useEffect(() => {
  //   checkAvailableProviders();
  // }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome to the app!",
          description: "You can now create your first project.",
        });
        if (data?.user) {
          onSuccess?.(data.user);
        }

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSocialAuth = async (provider: 'google' | 'github') => {
  //   if (!availableProviders[provider]) {
  //     toast({
  //       title: "Provider Not Available",
  //       description: `${provider} authentication is currently not available. Please try another method.`,
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const { data, error } = await supabase.auth.signInWithOAuth({
  //       provider,
  //       options: {
  //         redirectTo: `${window.location.origin}/projects`
  //       }
  //     });

  //     if (error) throw error;
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <Card className={flatCard ? "border-none shadow-none bg-transparent p-0" : "p-4"}>
      <CardContent className={flatCard ? "pt-2" : "pt-6"}>
        <div className="flex flex-col min-h-[400px]">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              {isSignUp ? (titleSignUp || "Create an Account") : (titleSingIn || "Welcome Back")}
            </h1>
            <p className="text-sm text-gray-500">
              {isSignUp
                ? "Enter your details to create your account"
                : "Enter your credentials to access your account"}
            </p>

            {additionalText ? (
              <Alert variant="primary" className=" text-sm font-medium">
                {additionalText}
              </Alert>
            ) : <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Transform your app ideas into reality with our AI-powered development assistant.
            </p>}
          </div>

          <div className="mt-auto pt-4">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase">
                Or continue with
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => handleSocialAuth('google')}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => handleSocialAuth('github')}
                className="w-full"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div> */}

            <div className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-primary hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
