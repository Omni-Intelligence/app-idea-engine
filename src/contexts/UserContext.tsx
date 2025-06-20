import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useEdnaMembership } from "@/hooks/useEdnaMembership";

type UserContextType = {
  user: User | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({ user: null, loading: true });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { checkMembership } = useEdnaMembership();

  const checkAndUpdateMembership = async (currentUser: User) => {
    const now = new Date();
    const lastUpdated = currentUser.user_metadata?.ednaMembershipUpdatedAt;

    if (lastUpdated) {
      const lastUpdatedDate = new Date(lastUpdated);
      const hoursDiff = (now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        console.log("EDNA Membership check skipped - updated within 24 hours");
        return;
      }
    }

    if (!currentUser.user_metadata?.isEdnaMember || !lastUpdated) {
      const hasAccess = await checkMembership();

      console.log("EDNA Membership access:", hasAccess);

      await supabase.auth.updateUser({
        data: {
          ...currentUser.user_metadata,
          isEdnaMember: hasAccess,
          ednaMembershipUpdatedAt: now.toISOString(),
        },
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user && _event === "SIGNED_IN") {
        checkAndUpdateMembership(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
