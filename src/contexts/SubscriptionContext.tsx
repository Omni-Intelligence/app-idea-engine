import { createContext, useContext, ReactNode, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Database } from "@/integrations/supabase/types";

type UserSubscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  isLoading: boolean;
  isSubscribed: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: isUserLoading } = useUser();
  const queryClient = useQueryClient();

  const fetchSubscription = async (): Promise<UserSubscription | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["trialing", "active"])
      .maybeSingle();

    if (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }

    return data;
  };

  const {
    data,
    isLoading: isSubscriptionLoading,
    error,
  } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: fetchSubscription,
    enabled: !isUserLoading && !!user,
  });

  useEffect(() => {
    const checkExpiredSubscription = async () => {
      if (!data || !data.stripe_id) return;

      const now = new Date();
      const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
      const endsAt = data.ends_at ? new Date(data.ends_at) : null;

      const isExpired = (trialEndsAt && trialEndsAt <= now) || (endsAt && endsAt <= now);

      if (isExpired) {
        try {
          const { data: syncData, error: syncError } = await supabase.functions.invoke("stripe-subscriptions", {
            body: {
              action: "checkSubscriptionStatus",
              subscriptionId: data.stripe_id,
            },
          });

          if (syncError) {
            console.error("Error checking subscription status:", syncError);
            return;
          }

          if (syncData.success && syncData.updated) {
            queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
          }
        } catch (error) {
          console.error("Error verifying expired subscription:", error);
        }
      }
    };

    checkExpiredSubscription();
  }, [data, queryClient, user?.id]);

  if (error) {
    console.error("Error in SubscriptionProvider:", error.message);
    return (
      <SubscriptionContext.Provider value={{ subscription: null, isLoading: false, isSubscribed: false }}>
        {children}
      </SubscriptionContext.Provider>
    );
  }

  const subscription = data ?? null;
  const isLoading = isUserLoading || isSubscriptionLoading;
  const isSubscribed = !!subscription;

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading, isSubscribed }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
