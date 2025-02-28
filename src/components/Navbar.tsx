import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SiteLogo } from "@/components/SiteLogo";

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
    <nav className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <SiteLogo />
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Button
                  onClick={() => navigate('/projects')}
                  className="bg-purple-600 hover:bg-purple-700 rounded-full px-6 py-2 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  My Projects
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                asChild
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
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

