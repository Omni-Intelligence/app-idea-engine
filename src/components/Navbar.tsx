import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SiteLogo } from "@/components/SiteLogo";
import { LogOut } from "lucide-react";

export const Navbar = () => {
  const [session, setSession] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="border-b border-primary/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <SiteLogo />
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Button
                  onClick={() => navigate('/projects')}
                >
                  My Projects
                </Button>
                <Button
                  variant="white"
                  size="icon"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-5" />
                </Button>
              </>
            ) : (
              <Button
                asChild
              >
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

